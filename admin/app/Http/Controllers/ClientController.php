<?php

namespace App\Http\Controllers;

use App\Models\GameResults;
use App\Models\Notification;
use App\Models\Users;
use App\Models\User;
use App\Models\Ticket;
use App\Models\UserPointsSale;
use App\Models\Plant;
use App\Models\Fund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\Storage;
use Milon\Barcode\Facades\DNS1DFacade as DNS1D;                       // ← now resolves to Milon\Barcode\Facades\DNS1DFacade
use Carbon\Carbon;
use Illuminate\Support\Str;

class ClientController extends Controller
{
    public function index(Request $request)
    {
    
        $user  = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
    
        if ($roles[0] === 'Retailer') {
            $currentPlayers = Users::where('retailer_id', auth()->id())->pluck('id');
        } elseif ($roles[0] === 'Stockit') {
            $currentPlayers = Users::where('stockit_id', auth()->id())->pluck('id');
        } else { // Super Admin
            $currentPlayers = Users::where('sub_admin_id', auth()->id())->pluck('id');
        }

        $users = Users::whereIn('id', $currentPlayers)->get();
        $retailers = User::role('Retailer')->pluck('company_name', 'id'); // [id => company_name]

        $users = $users->map(function ($user) use ($retailers) {
            $companyName = $retailers[$user->retailer_id] ?? null;

            $user->type = (strtolower(trim($companyName)) === 'desktop') ? 'desktop' : 'phone';
            return $user;
        });

        $allusers = Users::whereIn('id', $currentPlayers)->count();

        return Inertia::render('Players/View', ['users' => $users, 'allusers' => $allusers,'retailers' => $retailers
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        $plants =  Plant::where('status', 'active')->get();
        $user  = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();


        if ($roles[0] === 'Retailer') {
            $retailerUsers = User::role('Retailer')->where('stockit_id', auth()->id())->get(['id','name','pan_card']);
        } elseif ($roles[0] === 'Stockit') {
            $retailerUsers = User::role('Retailer')->where('stockit_id', auth()->id())->get(['id','name','pan_card']);
        } else { // Super Admin
            $retailerUsers = User::role('Retailer')->get(['id','name','pan_card']);
        }

        return Inertia::render('Players/Create', ['roles' => $roles, 'plants' => $plants, 'retailerUsers'  => $retailerUsers,]);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'first_name'          => 'required|string|max:255',
        'last_name'           => 'required|string|max:255',
        'country'             => 'required|string|max:100',
        'phone'               => [
            'required',
            'string',
            'max:15',
            'regex:/^[0-9]{7,15}$/',
            Rule::unique('user', 'phone'),
        ],
        'email'               => 'required|string|email|max:255|unique:user',
        'username'            => [
            'required',
            'string',
            'max:100',
            Rule::unique('user', 'username'),
        ],
        'password'            => 'required|string|min:8',
        'points'              => 'nullable|integer|min:0',
        'winning_percentage'  => 'required|numeric|min:0|max:100',
        'override_chance'     => 'required|numeric|min:0|max:100',
        'retailer_id'            => 'required',
    ]);
    $stockit = User::findOrFail($validated['retailer_id']);
    $admin = User::findOrFail($stockit->stockit_id);
 

    $user = Users::create([
        'first_name'          => $request->first_name,
        'last_name'           => $request->last_name,
        'country'             => $request->country,
        'phone'               => $request->phone,
        'email'               => $request->email,
        'username'            => $request->username,
        'password'            => bcrypt($request->password),
        'points'              => $request->points,
        'winning_percentage'  => $request->winning_percentage,
        'override_chance'     => $request->override_chance,
        'retailer_id'         => $request->retailer_id,
        'stockit_id'          => $stockit->stockit_id,
        'sub_admin_id'        => $admin->sub_admin_id,
    ]);

    $sub = User::findOrFail($validated['retailer_id']);
    if ($sub->pan_card < $validated['points']) {
        throw new \Exception('Low Balance');
    }

    $fund = UserPointsSale::create([
        'from_id' => auth()->id(),
        'user_id' => $user->id,
        'amount' => $request->points,
        'reference_number' => $request->reference_number ?? mt_rand(10000000, 99999999),

    ]);

    $user->update([
        'points' => $request->points,
    ]);
    $sub->decrement('pan_card', $validated['points']);


    Notification::create([
        'from_id'           => auth()->id(),
        'to_id'             => User::whereHas('roles', fn($q) => $q->where('name', 'Super Admin'))->value('id') ?? 1,
        'type'              => 'created',
        'purpose'           => 'client_created',
        'status'            => 'unread',
        'notification_text' => 'New Client Added successfully.',
        'notification_url'  => 'clients',
    ]);

    return redirect()->route('players.index')->with('success', 'Player Added successfully.');
}

    public function edit($id)
    {
        $user = Users::findOrFail($id);
        $roles = Role::all();
        $plants =  Plant::where('status', 'active')->get();
        // echo '<pre>';
        // print_r($user);die;
    
        return Inertia::render('Players/Edit', ['client' => $user, 'roles' => $roles, 'plants' => $plants]);
    }
    public function addfund($id)
    {
        $user = Users::findOrFail($id);
        $roles = Role::all();
        $plants =  Plant::where('status', 'active')->get();
        // echo '<pre>';
        // print_r($user);die;
    
        return Inertia::render('Players/AddFund', ['client' => $user, 'roles' => $roles, 'plants' => $plants]);
    }
    public function storefund(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:user,id',
            'amount' => 'required|numeric|min:0',
            'reference_number' => 'required|string|unique:funds,reference_number',
            'modeOfPayment' => 'required',
        ]);

        $fund = UserPointsSale::create([
            'from_id' => auth()->id(),
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'reference_number' => $request->reference_number,
        ]);
        $user = Users::findOrFail($id);
        $sub = User::findOrFail($user->stockit_id);
        if ($sub->pan_card < $user->points) {
            return redirect()->back('players.index')
       ->with('success', 'You are on Low Balance.');
        }
        $user->update([
            'points' => $user->points + $request->amount,
        ]);

        $sub->decrement('pan_card', $request->amount);
       // Redirect to a valid Inertia route with a flash message.
       return redirect()->route('players.index')
       ->with('success', 'Fund entry created successfully.');
    }
      public function view($id)
    {
   
        $gameResults = GameResults::with(['client', 'games'])
        ->where('user_id', $id)
        ->where('bet', '>', 0)
        ->get()
        ->groupBy('game_id');
    
        // echo '<pre>';
        // print_r($user);die;
    
        return Inertia::render('Players/Viewuser', ['gameResults' => $gameResults]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'country' => 'required|string|max:100',
            'phone' => [
                'required',
                'string',
                'max:15',
                'regex:/^[0-9]{7,15}$/',
                Rule::unique('user', 'phone')->ignore($id),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('user', 'email')->ignore($id),
            ],
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('user', 'username')->ignore($id),
            ],
            'password' => 'nullable|string|min:8',
            'points' => 'required|integer|min:0',
            'winning_percentage' => 'required|numeric|min:0|max:100',
            'override_chance' => 'required|numeric|min:0|max:100',
        ]);
    
        $user = Users::findOrFail($id);
    
        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'country' => $request->country,
            'phone' => $request->phone,
            'email' => $request->email,
            'username' => $request->username,
            'password' => $request->password ? bcrypt($request->password) : $user->password,
            'points' => $request->points,
            'winning_percentage' => $request->winning_percentage,
            'override_chance' => $request->override_chance,
        ]);
    
        Notification::create([
            'from_id'           => auth()->id(),
            'to_id'             => User::whereHas('roles', fn($q) => $q->where('name', 'Super Admin'))->value('id') ?? 1,
            'type'              => 'update',
            'purpose'           => 'client_edit',
            'status'            => 'unread',
            'notification_text' => 'Client updated successfully.',
            'notification_url'  => 'clients',
        ]);
    
        return redirect()->route('players.index')->with('success', 'Client updated successfully.');
    }
    public function suspend($id)
{
    $user = Users::findOrFail($id);

    // Toggle status
    $newStatus = $user->status === 'active' ? 'inactive' : 'active';
//     echo '<pre>';
// print_r($newStatus);die;
    $user->update([
        'status' => $newStatus,
    ]);



    return redirect()->back()->with('success', 'Player status updated to ' . $newStatus . '.');
}

    public function createticket($id)
    {
        $user = Users::findOrFail($id);
        return Inertia::render('Players/Ticket', ['user' => $user]);
    } 

    public function storeticket(Request $request, $id)
    {
        $validated = $request->validate([
            'amount'    => 'required|integer',
            'card_name' => 'required|string',
        ]);
    
        // build our special serial
        $now    = Carbon::now()->format('YmdHis');
        $amt    = $validated['amount'];
        $card   = Str::upper(Str::substr($validated['card_name'], 0, 3));
        $serial = "{$now}{$amt}{$card}{$id}".auth()->id();
    
        // create the ticket record
        $ticket = Ticket::create([
            'user_id'       => $id,
            'retailer_id'   => auth()->id(),
            'serial_number'=> $serial,
            'amount'        => $amt,
            'card_name'     => $validated['card_name'],
        ]);
    
        // generate barcode PNG (Code 39) and save it
        $pngData = DNS1D::getBarcodePNG($serial, 'C39');

        // File name with path under /public/barcodes
        $filename = $serial . '.png';
        $fullPath = public_path('barcodes/' . $filename);
        
        // Make sure the barcodes directory exists
        if (!file_exists(public_path('barcodes'))) {
            mkdir(public_path('barcodes'), 0755, true);
        }
        
        // Save the barcode image directly to public/barcodes
        file_put_contents($fullPath, base64_decode($pngData));
        
    
        // update the ticket with the path
        $ticket->update(['bar_code_scanner' =>  '/barcodes/'.$filename]);
    
        return redirect()->route('players.index')->with('success', 'Ticket Created successfully.');
    }
    public function viewticket(Request $request, $id)
    {
        $user = Users::findOrFail($id);
        $tickets = Ticket::where('user_id', $id)->get();
        return Inertia::render('Players/ViewTicket', ['user' => $user, 'tickets' => $tickets]);
    }
    
}

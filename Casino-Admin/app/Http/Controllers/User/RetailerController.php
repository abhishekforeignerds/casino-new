<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;

use App\Models\User;
use App\Models\Users;
use App\Models\Plant;
use App\Models\Fund;
use App\Models\GameResults;
use App\Models\UserPointsClaim;
use App\Models\TotalBetHistory;
use App\Models\ClaimPointData;
use App\Models\UserPointsSale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class RetailerController extends Controller
{
    public function index(Request $request)
    {    

        $user = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
        if ($roles[0] == 'Stockit') {
            $currentPlayers = User::where('stockit_id', auth()->id())->pluck('id');
        } elseif ($roles[0] == 'Super Admin') {
            $currentPlayers = User::where('sub_admin_id', auth()->id())->pluck('id');
        }

        $users = User::with(['plant', 'roles'])->whereIn('id', $currentPlayers)->role('Retailer')->get();
    
        $activeUsers = User::role('Retailer')->whereIn('id', $currentPlayers)->where('status', 'active')->count();
        $allUsers = User::role('Retailer')->whereIn('id', $currentPlayers)->where('status', '!=', 'deleted')
        ->count();

        $pendingUsers = User::role('Retailer')->whereIn('id', $currentPlayers)->where('status', 'pending_approval')->count();
        $inactiveUsers = User::role('Retailer')->whereIn('id', $currentPlayers)->where('status', 'inactive')->count();
    
        return Inertia::render('Users/Retailer/View', [
            'users' => $users,
            'statusCounts' => [
                'active' => $activeUsers,
                'pending' => $pendingUsers,
                'inactive' => $inactiveUsers,
                'allUsers' => $allUsers,
            ],
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        $rolespermissions = Role::with('permissions')->get();
        $plants =  Plant::where('status', 'active')->get();
        return Inertia::render('Users/Retailer/Create', [
            'roles' => $roles,
            'rolespermissions' => $rolespermissions,
            'plants' => $plants,
            'subAdmins'     => User::role('Super Admin')->get(['id','name']),
            'stockitUsers'  => User::role('Stockit')->get(),
        ]);
    }



    public function store(Request $request)
    {
        // 1) Validation
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => ['required','string','email:dns','max:255','unique:users'],
            'password'        => 'required|string|min:8',
            'role'            => ['required','string'],
            'mobile_number'   => [
                'required','string','size:10','regex:/^[0-9]{10}$/',
                Rule::unique('users','mobile_number'),
            ],
            'status'          => 'required|string',
            'company_name'    => 'nullable|string',
            'commission_percentage'    => 'required|integer|min:0|max:10',
            'balance'        => 'required|integer|min:100',
            'state_code'      => 'nullable|string',
            'company_name'      => 'nullable|string',
            'plant_id'        => ['nullable','integer','exists:plants,id'],
            'company_address' => 'nullable|string',
            // New field: how much to seed/transfer

            // If Stockit, require the sub_admin_id
            'sub_admin_id'    => [
                Rule::requiredIf($request->role === 'Stockit'),
                'nullable','integer','exists:users,id'
            ],
            // If Retailer, require the stockit_id
            'stockit_id'      => [
                Rule::requiredIf($request->role === 'Retailer'),
                'nullable','integer','exists:users,id'
            ],
        ]);
        $stockituser = User::findOrFail($validated['stockit_id']);
        try {
            DB::transaction(function() use ($validated, $stockituser) {
                
                // 2) Create user with zero balance
                $user = User::create([
                    'name'             => $validated['name'],
                    'email'            => $validated['email'],
                    'password'         => bcrypt($validated['password']),
                    'mobile_number'    => $validated['mobile_number'],
                    'status'           => $validated['status'],
                    'company_name'     => $validated['company_name']   ?? null,
                    'gstin_number'     => $validated['commission_percentage']   ?? null,
                    'pan_card'         => 0,    // start at zero
                    'state_code'       => $validated['state_code']     ?? null,
                    'plant_assigned'   => $validated['plant_id']       ?? null,
                    'company_address'  => $validated['company_address']?? null,
                    'stockit_id'       => $validated['stockit_id'],
                    'sub_admin_id'     => $stockituser->sub_admin_id,
                    'company_name'     => $validated['company_name'],
                ]);
               
                
                // now you can sync roles
                $user->syncRoles($validated['role']);
                $amount = $validated['balance'];

                // 3a) Sub Admin creation: funds come from the lone Super Admin
                if ($validated['role'] === 'Super Admin') {
                    $super = User::role('Super Admin')->sole();
                    if ($super->pan_card < $amount) {
                        throw new \Exception('Low Balance');
                    }
                    $user->increment('pan_card', $amount);
                    $super->decrement('pan_card', $amount);
                }

                // 3b) Stockit creation: funds come from selected Sub Admin
                if ($validated['role'] === 'Stockit') {
                    
                    if ($sub->pan_card < $amount) {
                        throw new \Exception('Low Balance');
                    }
                    $user->increment('pan_card', $amount);
                    $sub->decrement('pan_card', $amount);
                }

                // 3c) Retailer creation: funds come from selected Stockit
                if ($validated['role'] === 'Retailer') {
                    $stk = User::findOrFail($validated['stockit_id']);
                    if ($stk->pan_card < $amount) {
                        throw new \Exception('Low Balance');
                    }
                    $user->increment('pan_card', $amount);
                    $stk->decrement('pan_card', $amount);
                }
            });
        } catch (\Exception $e) {
            // Rollback has already occurred; show message
            return redirect()
                ->route('users.index')
                ->with('success', $e->getMessage());
        }

        // Notify & redirect on success


        return redirect()
            ->route('retailer.index')
            ->with('success', 'Retailer created successfully.');
    }  

    public function storefund(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'reference_number' => 'required|string|unique:funds,reference_number',
            'modeOfPayment' => 'required',
        ]);
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })
        ->first();
        $subAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })
        ->first();
        $stockit = User::whereHas('roles', function ($query) {
            $query->where('name', 'Stockit');
        })
        ->first();
        $fund = Fund::create([
            'from_id' =>auth()->id(),
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'reference_number' => $validated['reference_number'] ?? rand(1000000000, 9999999999),
        ]);
        $user = User::findOrFail($id);
        if ($user->roles->contains('name', 'Super Admin')) {
            if ($superAdmin->pan_card - $request->amount < 0) {
                return redirect()->route('users.index')
                ->with('success', 'Low Balance');
            } else {
                $user->update([
                    'pan_card' => $user->pan_card + $request->amount,
                ]);
                $superAdmin->update([
                    'pan_card' => $superAdmin->pan_card - $request->amount,
                ]);
                return redirect()->route('users.index')
                ->with('success', 'Fund Added Successfully');
            }
        }
        if ($user->roles->contains('name', 'Retailer')) {
            if ($stockit->pan_card - $request->amount < 0) {
                return redirect()->route('users.index')
                ->with('success', 'Low Balance');
            } else {
                $user->update([
                    'pan_card' => $user->pan_card + $request->amount,
                ]);
                $stockit->update([
                    'pan_card' => $stockit->pan_card - $request->amount,
                ]);
                return redirect()->route('users.index')
                ->with('success', 'Fund Added Successfully');
            }
        }
        if ($user->roles->contains('name', 'Stockit')) {
            
            if ($subAdmin->pan_card - $request->amount < 0) {
                return redirect()->route('users.index')
                ->with('success', 'Low Balance');
            } else {
                $user->update([
                    'pan_card' => $user->pan_card + $request->amount,
                ]);
                $subAdmin->update([
                    'pan_card' => $subAdmin->pan_card - $request->amount,
                ]);
                return redirect()->route('users.index')
                ->with('success', 'Fund Added Successfully');
            }
            
        }
       
       // Redirect to a valid Inertia route with a flash message.
       
    }
    public function playergameResults()
    {
        $user = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
        if ($roles[0] == 'Retailer') {
            $currentPlayers = Users::where('retailer_id', auth()->id())->pluck('id');
        } elseif ($roles[0] == 'Stockit') {
            $currentPlayers = Users::where('stockit_id', auth()->id())->pluck('id');
        } elseif ($roles[0] == 'Super Admin') {
            $currentPlayers = Users::where('sub_admin_id', auth()->id())->pluck('id');
        }

        $claimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('claim_point'));
        $unClaimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($unclaims) => $unclaims->sum('unclaim_point'));
        $betByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($unclaims) => $unclaims->sum('balance'));
 $gameResults = GameResults::with(['client.retailer', 'games'])
        ->whereIn('user_id', $currentPlayers)
        ->get()
        ->groupBy('game_id');
        $betByUser = TotalBetHistory::whereIn('user_id', $currentPlayers)
    ->whereNotNull('card_bet_amounts') // add this condition
    ->get()
    ->groupBy('user_id')
    ->map(fn($unclaims) => $unclaims->sum('bet_amount'));



        return Inertia::render('Users/Retailer/Gameresults', [
            'gameResults' => $gameResults,
            'claimsByUser'  => $claimsByUser,
            'unClaimsByUser'  => $unClaimsByUser,
            'betByUser'  => $betByUser,
        ]);

    }

    public function turnoverHistory(Request $request)
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
    
        // read date filters
        $fromDate = $request->input('from_date');
        $toDate   = $request->input('to_date');
    
        // build the query builder
        $query = GameResults::with([
            'client.retailer',
            'client.stockit',
            'games'
        ])
        ->whereIn('user_id', $currentPlayers);
    
        // apply date filters before fetching
        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }
    
        // fetch and group
        $gameResults = $query->get()->groupBy('game_id');
    
        
        $claimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('claim_point'));
        $unClaimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($unclaims) => $unclaims->sum('unclaim_point'));
        $saleToUser = UserPointsSale::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('amount'));
        $betByUser = TotalBetHistory::whereIn('user_id', $currentPlayers)
    ->whereNotNull('card_bet_amounts') // add this condition
    ->get()
    ->groupBy('user_id')
    ->map(fn($unclaims) => $unclaims->sum('bet_amount'));



        return Inertia::render('Users/Retailer/Turnover', [
            'gameResults'   => $gameResults,
            'claimsByUser'  => $claimsByUser,
            'unClaimsByUser'  => $unClaimsByUser,
            'betByUser'  => $betByUser,
            'saleToUser'    => $saleToUser,
            'filters'       => [
                'from_date' => $fromDate,
                'to_date'   => $toDate,
            ],
        ]);
    }
    public function playerhistory(Request $request)
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
    
        // read date filters + quick filter
        $fromDate    = $request->input('from_date');
        $toDate      = $request->input('to_date');
        $quickFilter = $request->input('quick_filter', 'all');
    
        $query = GameResults::with(['client.retailer','games'])
                 ->whereIn('user_id', $currentPlayers);
    
        // if from/to provided, apply those
        if ($fromDate) {
            $query->whereDate('created_at','>=',$fromDate);
        }
        if ($toDate) {
            $query->whereDate('created_at','<=',$toDate);
        }
    
        // if no from/to, but a quick filter (today/yesterday), apply that
        if (! $fromDate && ! $toDate && in_array($quickFilter,['today','yesterday'])) {
            $date = $quickFilter === 'today'
                ? now()->toDateString()
                : now()->subDay()->toDateString();
            $query->whereDate('created_at',$date);
        }
    
        $gameResults = $query->get()->groupBy('game_id');
    
        $claimsByUser = UserPointsClaim::whereIn('from_id',$currentPlayers)
                          ->get()
                          ->groupBy('from_id')
                          ->map(fn($c)=> $c->sum('amount'));
         $betByUser = TotalBetHistory::whereIn('user_id', $currentPlayers)
    ->whereNotNull('card_bet_amounts') // add this condition
    ->get()
    ->groupBy('user_id')
    ->map(fn($unclaims) => $unclaims->sum('bet_amount'));

    
        return Inertia::render('Users/Retailer/Playerhistory', [
            'gameResults'  => $gameResults,
            'claimsByUser' => $claimsByUser,
            'betByUser' => $betByUser,
            'filters'      => [
                'from_date'    => $fromDate,
                'to_date'      => $toDate,
                'quick_filter' => $quickFilter,
            ],
        ]);
    }
    
    public function transactionHistory(Request $request)
    {
        $user  = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
    
        if ($roles[0] === 'Retailer') {
            $currentPlayers = Users::where('retailer_id', $user->id)->pluck('id');
        } elseif ($roles[0] === 'Stockit') {
            $currentPlayers = Users::where('stockit_id', $user->id)->pluck('id');
        } else {
            $currentPlayers = Users::where('sub_admin_id', $user->id)->pluck('id');
        }
    
        // read filters
        $fromDate    = $request->input('from_date');
        $toDate      = $request->input('to_date');
        $quickFilter = $request->input('quick_filter', 'all');
    
        $query = UserPointsSale::with(['fromUser','user'])
                 ->whereIn('user_id', $currentPlayers);
    
        // apply from/to
        if ($fromDate) {
            $query->whereDate('created_at','>=',$fromDate);
        }
        if ($toDate) {
            $query->whereDate('created_at','<=',$toDate);
        }
    
        // if no from/to, apply quick (today/yesterday)
        if (! $fromDate && ! $toDate && in_array($quickFilter, ['today','yesterday'])) {
            $date = $quickFilter === 'today'
                  ? now()->toDateString()
                  : now()->subDay()->toDateString();
            $query->whereDate('created_at', $date);
        }
    
        $userpointsSales = $query->get();
    
        return Inertia::render('Users/Retailer/Transactions', [
            'userpointsSales' => $userpointsSales,
            'filters'         => [
                'from_date'    => $fromDate,
                'to_date'      => $toDate,
                'quick_filter' => $quickFilter,
            ],
        ]);
    }
        public function suspend($id)
{
    $user = User::findOrFail($id);

    // Toggle status
    $newStatus = $user->status === 'active' ? 'inactive' : 'active';

    $user->update([
        'status' => $newStatus,
    ]);



    return redirect()->back()->with('success', 'Retailer status updated to ' . $newStatus . '.');
}
    
}

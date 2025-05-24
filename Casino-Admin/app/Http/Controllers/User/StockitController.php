<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;

use App\Models\User;
use App\Models\Plant;
use App\Models\Fund;
use App\Models\UserPointsSale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class StockitController extends Controller
{
    public function index(Request $request)
    {    
        $users = User::with(['plant', 'roles'])->role('Stockit')->get();
    
        $activeUsers = User::role('Stockit')->where('status', 'active')->count();
        $allUsers = User::role('Stockit')->where('status', '!=', 'deleted')
        ->count();

        $pendingUsers = User::role('Stockit')->where('status', 'pending_approval')->count();
        $inactiveUsers = User::role('Stockit')->where('status', 'inactive')->count();
    
        return Inertia::render('Users/Stockit/View', [
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
        return Inertia::render('Users/Stockit/Create', [
            'roles' => $roles,
            'rolespermissions' => $rolespermissions,
            'plants' => $plants,
            'subAdmins'     => User::role('Super Admin')->get(['id','name']),
            'stockitUsers'  => User::role('Stockit')->get(['id','name']),
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
            'plant_id'        => ['nullable','integer','exists:plants,id'],
            'company_address' => 'nullable|string',

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


            DB::transaction(function() use ($validated) {
                // 2) Create user with zero balance
                $user = User::create([
                    'name'            => $validated['name'],
                    'email'           => $validated['email'],
                    'password'        => bcrypt($validated['password']),
                    'mobile_number'   => $validated['mobile_number'],
                    'status'          => $validated['status'],
                    'company_name'    => $validated['company_name']   ?? null,
                    'gstin_number'    => $validated['commission_percentage']   ?? null,
                    'pan_card'        => 0,    // start at zero
                    'state_code'      => $validated['state_code']     ?? null,
                    'plant_assigned'  => $validated['plant_id']       ?? null,
                    'company_address' => $validated['company_address']?? null,
                    'sub_admin_id' => $validated['sub_admin_id']?? null,
                ]);

                // Assign role
                $user->syncRoles($validated['role']);
                $amount = $validated['balance'];

                // 3a) Sub Admin creation: funds come from the lone Super Admin
                if ($validated['role'] === 'Super Admin') {
                    $super = User::role('Super Admin')->sole();
                    if ($super->pan_card < $amount) {
                        throw new \Exception('Low Balance');
                    } else {
                        UserPointsSale::create([
                            'from_id' => $super->id,
                            'user_id' => $user->id,
                            'amount' => $amount,
                            'initial_amount' => $user->points,
                            'reference_number' => $request->reference_number ?? mt_rand(10000000, 99999999),

                        ]);
                        
                        $user->increment('pan_card', $amount);
                        $super->decrement('pan_card', $amount);
                    }
               
                }

                // 3b) Stockit creation: funds come from selected Sub Admin
                if ($validated['role'] === 'Stockit') {
                    $sub = User::findOrFail($validated['sub_admin_id']);
                    if ($sub->pan_card < $amount) {
                        throw new \Exception('Low Balance');
                    } else {
                           UserPointsSale::create([
                            'from_id' => $sub->id,
                            'user_id' => $user->id,
                            'amount' => $amount,
                            'initial_amount' => $user->points,
                            'reference_number' => $request->reference_number ?? mt_rand(10000000, 99999999),

                        ]);
                        
                    $user->increment('pan_card', $amount);
                    $sub->decrement('pan_card', $amount);
                    }
                }

                // 3c) Retailer creation: funds come from selected Stockit
                if ($validated['role'] === 'Retailer') {
                    $stk = User::findOrFail($validated['stockit_id']);
                    if ($stk->pan_card < $amount) {
                        throw new \Exception('Low Balance');
                    } else {
                        Fund::create([
                            'from_id' => $stk->id,
                            'user_id' => $user->id, // <-- corrected
                            'amount' => $amount,
                            'reference_number' => $validated['reference_number'] ?? rand(1000000000, 9999999999),
                        ]);
                        $user->increment('pan_card', $amount);
                        $stk->decrement('pan_card', $amount);
                    }
                  
                }
            });
 

    

        return redirect()
            ->route('stockit.index')
            ->with('success', 'User created successfully.');
    }

    public function suspend($id)
{
    $user = User::findOrFail($id);

    // Toggle status
    $newStatus = $user->status === 'active' ? 'inactive' : 'active';

    $user->update([
        'status' => $newStatus,
    ]);



    return redirect()->back()->with('success', 'Stockist status updated to ' . $newStatus . '.');
}
}

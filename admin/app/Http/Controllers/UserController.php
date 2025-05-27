<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Plant;
use App\Models\Fund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {    
        $users = User::with(['plant', 'roles', 'subAdmin', 'stockit'])
        ->get();
    
        $activeUsers = User::where('status', 'active')->count();
        $allUsers = User::where('status', '!=', 'deleted')
        ->count();

        $pendingUsers = User::where('status', 'pending_approval')->count();
        $inactiveUsers = User::where('status', 'inactive')->count();
    
        return Inertia::render('Users/View', [
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
        return Inertia::render('Users/Create', [
            'roles' => $roles,
            'rolespermissions' => $rolespermissions,
            'plants' => $plants,
            'subAdmins'     => User::role('Super Admin')->get(['id','name']),
            'stockitUsers'  => User::role('Stockit')->get(['id','name']),
        ]);
    }



    public function store(Request $request)
    {
        try {
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
                'gstin_number'    => 'nullable|string',
                'pan_card'        => 'nullable|numeric',
                'state_code'      => 'nullable|string',
                'plant_id'        => ['nullable','integer','exists:plants,id'],
                'company_address' => 'nullable|string',
                'sub_admin_id'    => [
                    Rule::requiredIf($request->role === 'Stockit'),
                    'nullable','integer','exists:users,id'
                ],
                'stockit_id'      => [
                    Rule::requiredIf($request->role === 'Retailer'),
                    'nullable','integer','exists:users,id'
                ],
                'reference_number' => 'nullable|string|max:255', // Add if needed
            ]);
    
            // If stockit_id exists, fetch user (inside try now)
            $stockituser = null;
            if (!empty($validated['stockit_id'])) {
                $stockituser = User::findOrFail($validated['stockit_id']);
            }
    
            DB::transaction(function() use ($validated, $stockituser) {
                // 2) Create user with zero balance
                $user = User::create([
                    'name'            => $validated['name'],
                    'email'           => $validated['email'],
                    'password'        => bcrypt($validated['password']),
                    'mobile_number'   => $validated['mobile_number'],
                    'status'          => $validated['status'],
                    'company_name'    => $validated['company_name']   ?? null,
                    'gstin_number'    => $validated['gstin_number']   ?? null,
                    'pan_card'        => 0,    // Start with 0
                    'state_code'      => $validated['state_code']     ?? null,
                    'plant_assigned'  => $validated['plant_id']       ?? null,
                    'company_address' => $validated['company_address']?? null,
                    'stockit_id'      => $validated['stockit_id']     ?? null,
                    'sub_admin_id'    => $stockituser?->sub_admin_id ?? null,
                ]);
    
                $user->assignRole($validated['role']);
                $amount = $validated['pan_card'] ?? 0;
    
                if ($amount > 0) {
                    if ($validated['role'] === 'Super Admin') {
                        $super = User::role('Super Admin')->sole();
                        if ($super->pan_card < $amount) {
                            throw new \Exception('Low Balance for Super Admin');
                        }
                        Fund::create([
                            'from_id' => $super->id,
                            'user_id' => $user->id, // <-- corrected
                            'amount' => $amount,
                            'reference_number' => $validated['reference_number'] ?? rand(1000000000, 9999999999),
                        ]);
                        $user->increment('pan_card', $amount);
                        $super->decrement('pan_card', $amount);
                    }
    
                    if ($validated['role'] === 'Stockit') {
                        $sub = User::findOrFail($validated['sub_admin_id']);
                        if ($sub->pan_card < $amount) {
                            throw new \Exception('Low Balance for Sub Admin');
                        }
                        Fund::create([
                            'from_id' => $sub->id,
                            'user_id' => $user->id,
                            'amount' => $amount,
                            'reference_number' => $validated['reference_number'] ?? rand(1000000000, 9999999999),
                        ]);
                        $user->increment('pan_card', $amount);
                        $sub->decrement('pan_card', $amount);
                    }
    
                    if ($validated['role'] === 'Retailer') {
                        $stk = User::findOrFail($validated['stockit_id']);
                        if ($stk->pan_card < $amount) {
                            throw new \Exception('Low Balance for Stockit');
                        }
                        Fund::create([
                            'from_id' => $stk->id,
                            'user_id' => $user->id,
                            'amount' => $amount,
                            'reference_number' => $validated['reference_number'] ?? rand(1000000000, 9999999999),
                        ]);
                        $user->increment('pan_card', $amount);
                        $stk->decrement('pan_card', $amount);
                    }
                }
            });
    
            // Notify & redirect on success
            $this->sendNotification(
                'New User added successfully',
                route('users.index')
            );
    
            return redirect()
                ->route('users.index')
                ->with('success', 'User created successfully.');
            
        } catch (\Throwable $e) {
            return redirect()
                ->route('users.index')
                ->with('error', 'Error: ' . $e->getMessage());
        }
    }
    
    public function edit($id)
    {
        
        $user = User::with('roles', 'plant')->findOrFail($id);
        $roles = Role::all();  
        $plants =  Plant::where('status', 'active')->get();  
    
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'plants' => $plants,
        ]);
    }
    public function view($id)
    {
        
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::all();  
    
        return Inertia::render('Users/Viewuser', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }
    

    public function update(Request $request, $id)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email:dns|max:255|unique:users,email,' . $id,
        'password' => 'nullable|string|min:8',
        'role' => 'required|string',
        'mobile_number' => [
            'required',
            'string',
            'size:10',
            'regex:/^[0-9]{10}$/',
            Rule::unique('users', 'mobile_number')->ignore($id), // Ignore the current user's mobile number
        ],
        'status' => 'required',
        'company_name' => 'nullable|string',
        'gstin_number' => 'nullable|string',
        'pan_card' => 'nullable|string',
        'state_code' => 'nullable|string',
        'plant_assigned' => 'nullable',
        'company_address' => 'nullable|string',
    ]);

    $user = User::findOrFail($id);

    $user->update([
        'name' => $request->name,
        'email' => $request->email,
        'password' => $request->password ? bcrypt($request->password) : $user->password,
        'mobile_number' => $request->mobile_number,
        'status' => $request->status,
        'gstin_number' => $request->gstin_number,
    ]);

    $user->syncRoles($request->role);

    $this->sendNotification(
        'User updated successfully',
        route('users.index')
    );
    return redirect()->route('users.index')->with('success', 'User updated successfully.');
}

    public function suspend($id)
{
    $user = User::findOrFail($id);

    // Toggle status
    $newStatus = $user->status === 'active' ? 'inactive' : 'active';

    $user->update([
        'status' => $newStatus,
    ]);

    $this->sendNotification(
        'User status updated to ' . $newStatus,
        route('users.index')
    );

    return redirect()->back()->with('success', 'User status updated to ' . $newStatus . '.');
}


/**
     * Send a notification to the Super Admin.
     *
     * @param string $notification_text The notification message.
     * @param string $notification_url  The URL for the notification.
     * @param string $type              The type of the notification (default 'created').
     * @param string $purpose           The purpose of the notification (default 'completed').
     */
    private function sendNotification(
        string $notification_text,
        string $notification_url,
        string $type = 'created',
        string $purpose = 'completed'
    ) {
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();

        // Check if Super Admin exists before sending notification.
        if ($superAdmin) {
            Notification::create([
                'from_id'           => $from_id,
                'to_id'             => $superAdmin->id ?? 1,
                'type'              => $type,
                'purpose'           => $purpose,
                'status'            => 'unread',
                'notification_text' => $notification_text,
                'notification_url'  => $notification_url,
            ]);
        }
    }

    public function addfund($id)
    {
        $user = User::findOrFail($id);
        $roles = Role::all();
        $plants =  Plant::where('status', 'active')->get();
        // echo '<pre>';
        // print_r($user);die;
    
        return Inertia::render('Users/AddFund', ['client' => $user, 'roles' => $roles, 'plants' => $plants]);
    }
    public function storefund(Request $request, $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'reference_number' => 'required|string|unique:funds,reference_number',
            'modeOfPayment' => 'required',
        ]);
 $fund = Fund::create([
        'from_id'          => auth()->id(),
        'user_id'          => $request->user_id,
        'amount'           => $request->amount,
        'reference_number' => $request->reference_number,
        'modeofpayment'    => $request->modeOfPayment,
    ]);

    $user = User::findOrFail($id);
    $amount = $request->amount;
    $mode   = strtolower($request->modeOfPayment);

    // Determine who is sending ("from") and who is receiving ("to")
    switch (true) {
        case $user->hasRole('Super Admin'):
            $to   = $user;
            $from = User::role('Super Admin')->first();     // could be sub-admin if that's different
            break;

        case $user->hasRole('Retailer'):
            $to   = $user;
            $from = User::role('Stockit')->first();
            break;

        case $user->hasRole('Stockit'):
            $to   = $user;
            $from = User::role('Super Admin')->first();     // you’d probably want Sub Admin here?
            break;

        default:
            return redirect()->route('users.index')
                             ->with('error', 'Invalid user role.');
    }

    // Check balance
    if ($from->pan_card < $amount) {
        return redirect()->route('users.index')
                         ->with('error', 'Low Balance');
    }

    // Apply Cr (credit) or Dr (debit) logic:
    // - if Cr: add to $to, subtract from $from
    // - otherwise: subtract from $to, add to $from
 
    if ($mode === 'cr') {
        $toValue   = $to->pan_card   + $amount;
        $fromValue = $from->pan_card - $amount;
    } else {
        $toValue   = $to->pan_card   - $amount;
        $fromValue = $from->pan_card + $amount;
    }
if ($toValue < 0 || $fromValue < 0) {
    return redirect()->route('users.index')
                     ->with('success', 'Low Balance for this transaction');
}
    // Persist the changes
    $to->update(['pan_card' => $toValue]);
    $from->update(['pan_card' => $fromValue]);

    return redirect()->route('stockit.index')
                     ->with('success', 'Fund transaction completed successfully.');
       
       // Redirect to a valid Inertia route with a flash message.
       
    }

}
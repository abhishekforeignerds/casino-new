<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\RawMaterial;
use App\Models\FinishedGoodRawMaterial;
use App\Models\FinishedGood;
use App\Models\Plant;
use App\Models\Notification; // Ensure you import the Notification model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Vendor']);
        })->with(['roles', 'plant'])->get();

        $activeUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('status', 'active')->count();

        $allUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->count();

        $recentVendors = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('created_at', '>=', now()->subDay())->count();

        $pendingUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('status', 'pending_approval')->count();

        $inactiveUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('status', 'inactive')->count();

        return Inertia::render('Vendors/View', [
            'users' => $users,
            'statusCounts' => [
                'active'        => $activeUsers,
                'pending'       => $pendingUsers,
                'inactive'      => $inactiveUsers,
                'allUsers'      => $allUsers,
                'recentVendors' => $recentVendors,
            ],
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        $plants = Plant::where('status', 'active')->get();
        $finished_goods = FinishedGood::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();
        $raw_materials = RawMaterial::where('status', ['available', 'low_stock', 'unavailable'])->get();
        $fgrm = FinishedGoodRawMaterial::all();
        return Inertia::render('Vendors/Create', [
            'roles' => $roles,
            'plants' => $plants,
            'raw_materials' => $raw_materials,
            'fgrm' => $fgrm,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'nullable|string|max:255',
            'email'           => 'required|string|email|max:255|unique:users',
            'password'        => 'required|string|min:8',
            'role'            => 'required|string',
            'mobile_number'   => [
                'required',
                'string',
                'size:10',
                'regex:/^[0-9]{10}$/',
                Rule::unique('users', 'mobile_number'),
            ],
            'status'          => 'required',
            'company_name'    => 'required|string',
            'gstin_number'    => 'required|string',
            'pan_card'        => 'required|string',
            'state_code'      => 'required|string',
            'plant_id'        => 'required|string',
            'company_address' => 'required|string',
            'raw_materials'   => 'nullable', // Raw materials will be stored as JSON
        ]);
    
        $user = User::create([
            'name'             => $request->name,
            'email'            => $request->email,
            'password'         => bcrypt($request->password),
            'mobile_number'    => $request->mobile_number,
            'status'           => $request->status,
            'company_name'     => $request->company_name,
            'gstin_number'     => $request->gstin_number,
            'pan_card'         => $request->pan_card,
            'state_code'       => $request->state_code,
            'plant_assigned'   => $request->plant_id,
            'company_address'  => $request->company_address,
            // Encode the raw_materials array to JSON before storing
            'raw_materials'    => $request->raw_materials ? json_encode($request->raw_materials) : null,
        ]);
        
        $user->assignRole($request->role);

        // Send notification for vendor creation.
        $this->sendNotification(
            'New Vendor added successfully',
            route('vendors.index')
        );

        return redirect()->route('vendors.index')->with('success', 'Vendor created successfully.');
    }

    public function edit($id)
{
    $user = User::with('roles')->findOrFail($id);
    // Decode raw_materials from JSON to array (if any)
    $user->raw_materials = $user->raw_materials ? json_decode($user->raw_materials, true) : [];
    
    $roles = Role::all();
    $plants = Plant::where('status', 'active')->get();
    $raw_materials = RawMaterial::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();

    return Inertia::render('Vendors/Edit', [
        'client'        => $user,
        'roles'         => $roles,
        'plants'        => $plants,
        'raw_materials' => $raw_materials,
    ]);
}

public function update(Request $request, $id)
{
    $validated = $request->validate([
        'name'             => 'required|string|max:255',
        'email'            => 'required|string|email|max:255|unique:users,email,' . $id,
        'password'         => 'nullable|string|min:8',
        'role'             => 'required|string',
        'mobile_number'    => [
            'required',
            'string',
            'size:10',
            'regex:/^[0-9]{10}$/',
            Rule::unique('users', 'mobile_number')->ignore($id),
        ],
        'status'           => 'required',
        'company_name'     => 'required|string',
        'gstin_number'     => 'required|string',
        'pan_card'         => 'required|string',
        'plant_id'         => 'required|string',
        'state_code'       => 'required|string',
        'company_address'  => 'required|string',
        'raw_materials'    => 'nullable', // Expect raw_materials as an array
    ]);

    $user = User::findOrFail($id);

    $user->update([
        'name'            => $request->name,
        'email'           => $request->email,
        'password'        => $request->password ? bcrypt($request->password) : $user->password,
        'mobile_number'   => $request->mobile_number,
        'status'          => $request->status,
        'company_name'    => $request->company_name,
        'gstin_number'    => $request->gstin_number,
        'pan_card'        => $request->pan_card,
        'state_code'      => $request->state_code,
        // Use plant_id to update plant_assigned field
        'plant_assigned'  => $request->plant_id,
        'company_address' => $request->company_address,
        // JSON encode the raw materials array if provided
        'raw_materials'   => $request->raw_materials ? json_encode($request->raw_materials) : null,
    ]);

    $user->syncRoles($request->role);

    // Send notification for vendor update.
    $this->sendNotification(
        'Vendor updated successfully',
        route('vendors.index')
    );

    return redirect()->route('vendors.index')->with('success', 'Vendor updated successfully.');
}


    public function view($id)
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::all();
        $plants = Plant::where('status', 'active')->get();

        return Inertia::render('Vendors/Viewuser', [
            'user'   => $user,
            'roles'  => $roles,
            'plants' => $plants
        ]);
    }

    public function suspend($id)
    {
        // Find the vendor by ID.
        $user = User::findOrFail($id);

        // Update the vendor's status to 'inactive'.
        $user->update([
            'status' => 'inactive',
        ]);

        // Send notification for vendor suspension.
        $this->sendNotification(
            'Vendor suspended successfully',
            route('vendors.index')
        );

        return redirect()->route('vendors.index')->with('success', 'Vendor suspended successfully.');
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
}

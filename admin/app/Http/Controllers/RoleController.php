<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Retrieve all roles with their assigned permissions
        $roles = Role::with('permissions')->get();

        return inertia('Roles/View', [
            'roles' => $roles,
        ]);
    }

    // Show the edit form for a specific role
    public function edit($id)
    {
        // Find role by id with its permissions
        $role = Role::with('permissions')->findOrFail($id);
        // Fetch all available permissions for selection
        $permissions = Permission::all();

        return inertia('Roles/Edit', [
            'role'        => $role,
            'permissions' => $permissions,
        ]);
    }

    // Update the role in the database
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
        ]);

        // Update the role name
        $role->name = $validated['name'];
        $role->save();

        // Sync (assign/update) permissions.
        // If no permissions were sent, remove all assigned permissions.
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')
                         ->with('success', 'Role updated successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
{
    // Fetch all permissions to let the user assign them to the role
    $permissions = Permission::all();
    return inertia('Roles/Create', [
        'permissions' => $permissions,
    ]);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255|unique:roles,name',
        'permissions' => 'nullable|array'
    ]);

    // Create the role using the Spatie Role model
    $role = Role::create(['name' => $validated['name']]);

    // Assign permissions if provided
    if (!empty($validated['permissions'])) {
        $role->syncPermissions($validated['permissions']);
    }

    return redirect()->route('roles.index')->with('success', 'Role created successfully.');
}

    /**
     * Display the specified resource.
     */
    
}

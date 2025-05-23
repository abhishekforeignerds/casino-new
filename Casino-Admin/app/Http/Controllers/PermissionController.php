<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    // List all permissions
    public function index(Request $request)
    {
        $permissions = Permission::all();
        return inertia('Permissions/View', [
            'permissions' => $permissions,
        ]);
    }

    // Show the form to create a new permission
    public function create()
    {
        return inertia('Permissions/Create');
    }

    // Store a newly created permission
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
        ]);

        Permission::create([
            'name'       => $validated['name'],
            'guard_name' => 'web', // adjust guard if necessary
        ]);

        return redirect()->route('permissions.create')
                         ->with('success', 'Permission created successfully.');
    }

    // Show the form to edit an existing permission
    public function edit($id)
    {
        $permission = Permission::findOrFail($id);
        return inertia('Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    // Update the permission in the database
    public function update(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
        ]);

        $permission->update([
            'name' => $validated['name'],
        ]);

        return redirect()->route('permissions.index')
                         ->with('success', 'Permission updated successfully.');
    }

    // Optional: Delete a permission
    public function destroy($id)
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();
        return redirect()->route('permissions.index')
                         ->with('success', 'Permission deleted successfully.');
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
{
    // Create permissions
    Permission::create(['name' => 'view users']);
    Permission::create(['name' => 'create users']);
    Permission::create(['name' => 'edit users']);
    Permission::create(['name' => 'delete users']);

    // Create roles
    $admin = Role::create(['name' => 'admin']);
    $user = Role::create(['name' => 'user']);

    // Assign permissions to roles
    $admin->givePermissionTo(['view users', 'create users', 'edit users', 'delete users']);
    $user->givePermissionTo('view users');
}
}

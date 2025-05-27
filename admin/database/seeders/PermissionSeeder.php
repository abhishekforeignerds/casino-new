<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // First, remove wrongly formatted permissions (e.g., Users.view)
        $oldFormattedPermissions = [
            'Users' => [
                'view', 'create', 'edit', 'delete', 'addFundSubadmin', 'addFundStockit', 'addFundRetailer',
                'addfund', 'storefund', 'superadmin-table', 'subadmin-table', 'stockit-table', 'retailer-table',
            ],
            'Games' => [
                'import-store', 'import', 'suspend', 'view', 'destroy', 'update', 'edit', 'store',
                'create', 'index', 'viewone',
            ],
            'Players' => [
                'view', 'create', 'store', 'edit', 'update', 'destroy', 'viewone', 'addfund', 'storefund',
                'winningpercentage', 'overidechance', 'createticket',
            ],
            'Subadmin' => [
                'view', 'create', 'store', 'edit', 'view-one', 'update',
            ],
            'Retailer' => [
                'view', 'store', 'create', 'edit', 'update', 'view-one', 'createticket',
            ],
            'Stockit' => [
                'view-one', 'view', 'create', 'store', 'edit', 'update',
            ],
        ];

        foreach ($oldFormattedPermissions as $group => $actions) {
            foreach ($actions as $action) {
                $oldName = "{$group}.{$action}";
                Permission::where('name', $oldName)->delete();
            }
        }

        // Now add correctly formatted permissions
        $newPermissions = [
            'users' => [
                'view', 'create', 'edit', 'delete', 'addFundSubadmin', 'addFundStockit', 'addFundRetailer',
                'addfund', 'storefund', 'superadmin-table', 'subadmin-table', 'stockit-table', 'retailer-table',
            ],
            'games' => [
                'import-store', 'import', 'suspend', 'view', 'destroy', 'update', 'edit', 'store',
                'create', 'index', 'viewone',
            ],
            'players' => [
                'view', 'create', 'store', 'edit', 'update', 'destroy', 'viewone', 'addfund', 'storefund',
                'winningpercentage', 'overidechance', 'createticket',
            ],
            'subadmin' => [
                'view', 'create', 'store', 'edit', 'view-one', 'update',
            ],
            'retailer' => [
                'view', 'store', 'create', 'edit', 'update', 'view-one', 'createticket',
            ],
            'stockit' => [
                'view-one', 'view', 'create', 'store', 'edit', 'update',
            ],
        ];

        foreach ($newPermissions as $resource => $actions) {
            foreach ($actions as $action) {
                $name = "{$action} {$resource}";
                Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
            }
        }
    }
}

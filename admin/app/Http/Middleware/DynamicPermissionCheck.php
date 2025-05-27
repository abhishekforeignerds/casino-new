<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DynamicPermissionCheck
{
    public function handle(Request $request, Closure $next, $permission = null)
    {
        $user = $request->user();

        // If no explicit permission was provided, derive it from the route name.
        if (!$permission) {
            $routeName = $request->route()->getName(); // e.g., 'users.index', 'users.view'
            // print_r($routeName);die;
            $parts = explode('.', $routeName);
// print_r($parts);die;
            if (count($parts) >= 2) {
                $module = $parts[0]; // e.g., 'users'
                $action = $parts[1]; // e.g., 'index', 'create', etc.

                // Map common route actions to desired permission actions.
                $actionMap = [
                    'index'   => 'view',
                    'view'    => 'viewone',
                    'create'  => 'create',
                    'store'   => 'create',
                    'edit'    => 'edit',
                    'update'  => 'edit',
                    'destroy' => 'delete',
                    'suspend' => 'delete',
                    'suspend' => 'suspend',
                    'completed' => 'completed',
                    'update-status' => 'update-status',
                    'release-init' => 'release-init',
                    'fg-issused' => 'fg-issused',
                    'insufficient-fg' => 'insufficient-fg',
                    'update-status-new' => 'update-status-new',
                    'po-index' => 'po-report',

                ];

                if (isset($actionMap[$action])) {
                    $action = $actionMap[$action];
                }

                $permission = $action . ' ' . $module; // e.g., "view users"
            }
        }

        if (!$user || !$user->can($permission)) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}

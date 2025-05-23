<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Notification;
use App\Models\User;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Pre-fetch authenticated user and their primary role
        $user = $request->user();
        $roleName = null;

        if ($user) {
            $roleName = $user->roles->pluck('name')->first();
           
        }

        // Compute commission based on role
        $commission = 0;
        if ($user) {
            switch ($roleName) {
                case 'Super Admin':
                    // sum of all gstin_number
                    $commission = User::sum('gstin_number');
                    break;

                case 'Stockit':
                    // sum of gstin_number where stockit_id = current user
                    $commission = User::where('stockit_id', $user->id)
                                      ->sum('gstin_number');
                                      
                    break;

                case 'Retailer':
                    // gstin_number of the current user
                    $commission = $user->gstin_number;
                    break;

                default:
                    $commission = 0;
                    break;
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'                 => $user->id,
                    'name'               => $user->name,
                    'email'              => $user->email,
                    'balance'            => $user->pan_card,
                    'userall'            => User::where('id', $user->id)->get(),
                    'commission'         => $commission,
                    'plant_id'           => $user->plant_assigned,
                    'roles'              => $user->roles->pluck('name'),
                    'rolespermissions'   => $user->roles->map(function ($role) {
                        return [
                            'name'        => $role->name,
                            'permissions' => $role->permissions->pluck('name'),
                        ];
                    }),
                ] : null,
            ],

            'notifications_unread' => [
                'unread_count' => $user
                    ? (
                        $roleName === 'Super Admin'
                            ? Notification::where('status', 'unread')->count()
                            : Notification::where('status', 'unread')
                                          ->where('to_id', $user->id)
                                          ->count()
                    )
                    : 0,
            ],

            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ]);
    }
}

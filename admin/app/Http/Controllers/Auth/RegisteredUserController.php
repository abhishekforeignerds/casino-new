<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;


use App\Models\Plant;


use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string',
           'mobile_number' =>  [
                'nullable',
                'string',
                'size:10', // Ensures exactly 10 digits
                'regex:/^[0-9]{10}$/', // Ensures only numeric values
                Rule::unique('users', 'mobile_number'),
            ],
            'status' => 'nullable',
            'company_name' => 'nullable|string',
            'gstin_number' => 'nullable|string',
            'pan_card' => 'nullable|string',
            'state_code' => 'nullable|string',
            'company_address' => 'nullable|string',
        ]);

       

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'mobile_number' => $request->mobile_number,
            'status' => 'pending_approval',
            'company_name' => $request->company_name,
            'gstin_number' => $request->gstin_number,
            'pan_card' => $request->pan_card,
            'state_code' => $request->state_code,
            'company_address' => $request->company_address,
        ]);
        $user->assignRole($request->role);
        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}

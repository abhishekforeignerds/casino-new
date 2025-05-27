<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('en_IN');

        // Define plant IDs and the roles to assign
        $plantIds = [1];
        $roles = [
            'Super Admin',
        ];

        foreach ($plantIds as $plantId) {
            foreach ($roles as $role) {
                // Base user data common to all roles with a random name
                $data = [
                    'name'           => $faker->name,
                    'email'          => $faker->unique()->safeEmail,
                    'password'       => Hash::make('password'), // or any default password
                    'mobile_number'  => $faker->numerify('##########'), // 10 digit mobile number
                    'status'         => 1, // example status value
                    'plant_assigned' => $plantId,
                    'pan_card' => 1000000,
                ];

                // For Client and Vendor, assign company details
                if (in_array($role, ['Client', 'Vendor'])) {
                    $data['company_name']    = $faker->company;
                    $data['gstin_number']    = 'GSTIN' . $plantId; // customize as needed
                    $data['pan_card']        = 'PAN' . $plantId; // customize as needed
                    $data['company_address'] = $faker->address;
                } else {
                    $data['company_name']    = null;
                    $data['gstin_number']    = null;
                    $data['pan_card']        = null;
                    $data['company_address'] = null;
                }

                // Create the user and assign the role
                $user = User::create($data);
                $user->assignRole($role);

                $this->command->info("Created user: {$user->name} with role {$role} for plant {$plantId}");
            }
        }
    }
}

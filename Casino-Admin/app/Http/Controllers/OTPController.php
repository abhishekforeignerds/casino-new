<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class OTPController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate(['mobile' => 'required|']);
        $mobile = preg_replace('/^\+91/', '', $request->mobile);
        $otp = rand(100000, 999999);
        Session::put('otp', $otp);
        Session::put('mobile', $mobile);

       
            $apiKey = env('D7NETWORKS_API_KEY');  // Updated API Key for D7Networks
            $message = "Your OTP for login is $otp. Do not share this with anyone.";
            $numbers = [$request->mobile];
           
            $user = User::where('mobile_number', $mobile)->first();

            if (!$user) {
                return response()->json(['error' => 'User not found!'], 404);
            }
            if ($user->status === 'pending_approval ' || $user->status === 'inactive') {

        
                return redirect()->route('login')->withErrors([
                    'email' => 'Your account is not active. Please contact Admin.',
                ]);
            }
            $response = Http::withHeaders([
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey,
            ])->post('https://api.d7networks.com/messages/v1/send', [
                "messages" => [
                    [
                        "channel"      => "sms",
                        "recipients"   => $numbers,
                        "content"      => $message,
                        "msg_type"     => "text",
                        "data_coding"  => "text",
                    ]
                ],
                "message_globals" => [
                    "originator" => "SignOTP",
                    "report_url" => "https://yourreporturl.com"
                ]
            ]);

            $result = $response->json();

         

            return response()->json(['message' => 'OTP sent successfully!']);

     
    }

    public function verifyOtp(Request $request)
    {
        $request->validate(['mobile' => 'required', 'otp' => 'required|digits:6']);
        $mobile = preg_replace('/^\+91/', '', $request->mobile);
        $user = User::where('mobile_number', $mobile)->first();
        if (Session::get('otp') == $request->otp && Session::get('mobile') == $request->mobile) {
            
           
            if (!$user) {
                return response()->json(['error' => 'User not found!'], 404);
            }

            Auth::login($user);
           

            // Check if the user has 'pending' or 'inactive' status
            if ($user->status === 'pending_approval' || $user->status === 'inactive') {
                Auth::logout();
        
                return redirect()->route('login')->withErrors([
                    'email' => 'Your account is not active. Please contact support.',
                ]);
            }
        
        
            return redirect()->intended(route('dashboard', absolute: false));
        } else {
            return response()->json(['error' => 'Invalid OTP'], 401);
        }
    }
}
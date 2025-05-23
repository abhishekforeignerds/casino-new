<?php

namespace App\Http\Controllers;

use App\Models\ContactSeller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactSellerController extends Controller
{
    public function index($seller_id)
    {
        $client_id = auth()->id();

        $messages = ContactSeller::where(function ($query) use ($client_id, $seller_id) {
            $query->where('seller_id', $seller_id)
                  ->where('client_id', $client_id);
        })->orWhere(function ($query) use ($client_id, $seller_id) {
            $query->where('seller_id', $client_id)
                  ->where('client_id', $seller_id);
        })->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        // Example logic to determine seller_id
        $seller_id = auth()->id() == 1 ? 1 : auth()->id();

        $message = ContactSeller::create([
            'seller_id' => $seller_id,
            'client_id' => auth()->id(),
            'po_id'     => $id,
            'message'   => $request->message,
        ]);

        // Call the notification method after the message is created.
        // You can adjust the notification text and URL based on your application's needs.
        $this->sendNotification(
            'Message sent successfully.',
            route('contact.seller.index', ['seller_id' => $seller_id])
        );

        return redirect()->back()->with('success', 'Message sent successfully.');
    }

    /**
     * Send a notification to the Super Admin.
     *
     * @param string $notification_text The text to display in the notification.
     * @param string $notification_url  The URL to redirect when notification is clicked.
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

        // Ensure a Super Admin exists before creating a notification.
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

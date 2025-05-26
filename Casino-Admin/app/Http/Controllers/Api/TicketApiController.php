<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketApiController extends Controller
{
    public function latest()
    {
        return Ticket::latest()->take(1)->get();
    }

     public function latestEscPos(Request $request)
    {
        // Fetch the most recent Ticket
        $ticket = Ticket::latest()->first();

        if (! $ticket) {
            return response('', 204);
        }

        // Build your ESC/POS command string:
        $esc  = "\x1B";              // ESC
        $newl = "\x0A";              // LF
        $data = $esc . "@";          // Initialize
        $data .= "Ticket #{$ticket->id}{$newl}";
        $data .= "Serial: {$ticket->serial_number}{$newl}";
        $data .= "Amount: ₹{$ticket->amount}{$newl}{$newl}";
        $data .= $esc . "d" . chr(4); // Feed 4 lines
        $data .= $esc . "i";          // Full cut

        // Return raw bytes + ID header
        return response($data, 200)
            ->header('Content-Type', 'application/octet-stream')
            ->header('X-Ticket-Id', $ticket->id);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'user_id',
        'serial_number',
        'bar_code_scanner',
        'amount',
        'card_name',
        'retailer_id',
    ];
}

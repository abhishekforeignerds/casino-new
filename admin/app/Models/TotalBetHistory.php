<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TotalBetHistory extends Model
{
    protected $table = 'total_bet_history';

    protected $fillable = [
        'user_id',
        'game_id',
        'card_type',
        'bet_amount',
        'withdraw_time',
        'ntrack',
        'ticket_serial',
        'card_bet_amounts',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'bet_amount' => 'decimal:2',
        'withdraw_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'card_bet_amounts' => 'array', // if JSON or serialized string, you can customize this
    ];
}

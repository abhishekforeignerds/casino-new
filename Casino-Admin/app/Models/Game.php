<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_spin_time',
        'min_bet',
        'maximum_bet',
        'game_name',
        'game_type',
        'game_category',
        'winning_percentage',
        'override_chance',
    ];
}

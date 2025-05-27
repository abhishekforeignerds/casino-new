<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class GameResults extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;
    use HasRoles;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $table = 'game_results';

    public $timestamps = false; // since we only have created_at

    protected $fillable = [
        'user_id',
        'game_id',
        'winning_number',
        'lose_number',
        'bet',
        'win_value',
    ];
    public function client()
{
    return $this->belongsTo(Users::class, 'user_id');
}
    public function games()
{
    return $this->belongsTo(Game::class, 'game_id');
}
}

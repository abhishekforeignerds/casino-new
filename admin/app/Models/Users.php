<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Users extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;
    use HasRoles;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $table = 'user';

    public $timestamps = false; // since we only have created_at

    protected $fillable = [
        'first_name',
        'last_name',
        'country',
        'phone',
        'email',
        'username',
        'password',
        'points',
        'winning_percentage',
        'override_chance',
        'stockit_id',
        'sub_admin_id',
        'retailer_id',
        'status',
    ];

    public function retailer(): BelongsTo
    {
        // Related model, foreign key on this table, owner key on related table
        return $this->belongsTo(\App\Models\User::class, 'retailer_id', 'id');
    }
    public function stockit(): BelongsTo
    {
        // Related model, foreign key on this table, owner key on related table
        return $this->belongsTo(\App\Models\User::class, 'stockit_id', 'id');
    }
}

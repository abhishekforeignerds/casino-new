<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;
    use HasRoles;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'raw_materials',
        'password','mobile_number', 'status','plant_assigned','updated_at','effective_date','company_name','gstin_number','pan_card','state_code','company_address','sub_admin_id','retailer_id','stockit_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function plant()
    {
        return $this->belongsTo(Plant::class, 'plant_assigned', 'id');
    }

    public function subAdmin()
    {
        return $this->belongsTo(User::class, 'sub_admin_id');
    }

    /**
     * The user who is this user’s stockit.
     */
    public function stockit()
    {
        return $this->belongsTo(User::class, 'stockit_id');
    }
}

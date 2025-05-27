<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;


class UserPointsSale extends Model
{
    use HasFactory;

    protected $table = 'user_points_sales';

    protected $fillable = [
        'from_id',
        'user_id',
        'amount',
        'reference_number',
    ];

    // Optional: relationships if needed
    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPointsClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_id',
        'user_id',
        'amount',
        'reference_number',
        'status',
    ];

    public function fromUser()
    {
        return $this->belongsTo(Users::class, 'from_id');
    }
}

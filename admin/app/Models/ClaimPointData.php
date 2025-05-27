<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClaimPointData extends Model
{
    use HasFactory;

    protected $table = 'claim_point_data'; // Explicitly define table name

    protected $fillable = [
        'user_id',
        'claim_point',
        'unclaim_point',
        'balance',
        'auto_claim',
    ];

    protected $casts = [
        'auto_claim' => 'boolean',
    ];

    // Optional: Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

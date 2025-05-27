<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fund extends Model
{
    protected $fillable = ['from_id', 'user_id', 'amount', 'reference_number'];
}
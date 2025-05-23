<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AllocatedRm extends Model
{
    use HasFactory;

    // Specify the table name
    protected $table = 'allocated_rm';

    // Define the fillable fields
    protected $fillable = [
        'po_id',
        'rm_code',
        'allocated_quantity',
        'reaining_quantity',
    ];
}

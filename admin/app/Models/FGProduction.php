<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FGProduction extends Model
{
    use HasFactory;

    protected $table = 'fg_production';

    protected $fillable = [
        'po_id',
        'item_code',
        'hsn_sac_code',
        'quantity',
        'unit',
        'item_description',
        'expected_prod_complete_date',
        'status',
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code', 'hsn_sac_code', 'quantity', 'unit', 'item_description','po_id'
    ];
}
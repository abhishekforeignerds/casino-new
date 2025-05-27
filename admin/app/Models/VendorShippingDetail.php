<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorShippingDetail extends Model
{
    use HasFactory;

    protected $fillable = ['po_id','tracking_number', 'file_url', 'expected_delivery_date'];
}

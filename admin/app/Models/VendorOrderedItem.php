<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorOrderedItem extends Model
{
    use HasFactory;

    protected $table = 'vendor_ordered_items';

    protected $fillable = [
        'item_code', 
        'hsn_sac_code', 
        'quantity', 
        'unit', 
        'item_description', 
        'po_id'
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(VendorPurchaseOrder::class, 'po_id');
    }
}
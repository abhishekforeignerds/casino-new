<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorPurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'vendor_purchase_orders';

    protected $fillable = [
        'po_number', 
        'client_id', 
        'plant_id', 
        'order_status', 
        'po_date', 
        'expected_delivery_date', 
        'file_url',
        'invoice_file'
    ];


    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    public function orderedItems()
    {
        return $this->hasMany(VendorOrderedItem::class, 'po_id');
    }
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
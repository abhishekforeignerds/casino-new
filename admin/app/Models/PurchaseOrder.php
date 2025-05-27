<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'po_number', 'client_id', 'plant_id', 'order_status', 
        'po_date', 'expected_delivery_date', 'file_url','status_reason'
    ];

    public function orderedItems()
    {
        return $this->hasMany(OrderedItem::class, 'id', 'ordered_items_id');
    }
    public function client()
{
    return $this->belongsTo(User::class, 'client_id');
}
public function plant()
{
    return $this->belongsTo(Plant::class, 'plant_id');
}
}
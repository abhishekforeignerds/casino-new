<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantFinishedGood extends Model
{
    use HasFactory;

    protected $fillable = [
        'plant_id',
        'finished_good_id',
        'item_code',
        'item_description',
        'hsn_sac_code',
        'status',
        'quantity',
        'unit',
        'reorder_level',
        'buffer_stock',
    ];

    public function plant()
    {
        return $this->belongsTo(Plant::class, 'plant_id', 'id');
    }
}
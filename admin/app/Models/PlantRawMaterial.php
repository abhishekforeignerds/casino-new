<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantRawMaterial extends Model
{
    use HasFactory;

    protected $table = 'plant_raw_material';

    protected $fillable = [
        'plant_id',
        'raw_material_id',
        'item_code',
        'item_description',
        'hsn_sac_code',
        'status',
        'quantity',
        'unit',
        'minimum_threshold',
        'buffer_stock',
    ];

    public function plant()
    {
        return $this->belongsTo(Plant::class, 'plant_id', 'id');
    }
}

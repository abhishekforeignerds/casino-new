<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinishedGood extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_code',
        'material_name',
        'hsn_sac_code',
        'initial_stock_quantity',
        'plant_allocated_quantity',
        'unit_of_measurement',
        'date_of_entry',
        'status',
        'reorder_level',
        'buffer_stock',
    ];

    // Cast raw_materials_used as an array
    protected $casts = [
        'raw_materials_used' => 'array',
    ];

    public function plants()
    {
        return $this->belongsToMany(Plant::class, 'finished_goods', 'id', 'plant_id');
    }
    public function rawMaterials()
{
    return $this->belongsToMany(RawMaterial::class, 'finished_good_raw_material')
                ->withPivot('quantity_required');
}


}

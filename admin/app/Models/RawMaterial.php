<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawMaterial extends Model
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
        'minimum_threshold',
        'buffer_stock',
    ];

    public function finishedGoods()
{
    return $this->belongsToMany(FinishedGood::class, 'finished_good_raw_material')
                ->withPivot('quantity_required');
}

}

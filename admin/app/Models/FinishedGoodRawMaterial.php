<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinishedGoodRawMaterial extends Model
{
    use HasFactory;

    protected $table = 'finished_good_raw_material';

    protected $fillable = [
        'fg_code', 
        'fg_item_description',
        'rm_code', 
        'rm_item_description', 
        'fg_gross_wt',
        'fg_net_wt',
        'scrap_net_wt',
        'quantity_required', 
        'unit',
        'price'
    ];

    public function finishedGood()
    {
        return $this->belongsTo(FinishedGood::class, 'fg_code', 'material_code');
    }
    
    public function rawMaterial()
    {
        return $this->belongsTo(RawMaterial::class, 'rm_code', 'material_code');
    }
    public function getRouteKeyName()
    {
        return 'fg_code'; // Or whichever column you want to use
    }

}

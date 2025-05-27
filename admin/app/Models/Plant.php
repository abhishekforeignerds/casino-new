<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    use HasFactory;
    protected $fillable = [
        'plant_name',
        'status',
        'capacity',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'finished_goods',
        'raw_materials'
    ];

    public function finishedGoods()
    {
        return $this->belongsToMany(FinishedGood::class, 'finished_goods', 'id', 'finished_good_id');
    }
    
    public function finishedGoodsnew()
    {
        return $this->belongsToMany(FinishedGood::class, 'finished_goods', 'plant_id', 'finished_good_id')
                    ->withPivot('id', 'finished_good_id'); // Correct pivot table definition
    }

    public function rawMaterials()
    {
        return $this->belongsToMany(RawMaterial::class, 'raw_materials', 'id', 'raw_material_id');
    }
    
    public function rawMaterialsnew()
    {
        return $this->belongsToMany(RawMaterial::class, 'raw_materials', 'plant_id', 'raw_material_id')
                    ->withPivot('id', 'raw_material_id'); // Correct pivot table definition
    }
    
    
    public function users()
    {
        return $this->hasMany(User::class, 'plant_assigned');
    }

    


}

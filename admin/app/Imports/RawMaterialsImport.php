<?php
namespace App\Imports;

use App\Models\RawMaterial;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class RawMaterialsImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
     * Define validation rules for each row.
     */
    public function rules(): array
    {
        return [
            'material_code'         => 'required|string|unique:raw_materials,material_code',
            'material_name'         => 'required|string',
            'status'                => 'required|string',
            'minimum_threshold'     => 'required|integer',
            'initial_stock_quantity'=> 'required|integer',
            'unit_of_measurement'   => 'required|in:Kgs|string',
            'date_of_entry'         => 'nullable|date',
        ];
    }

    /**
     * Map each CSV row to a new RawMaterial model.
     */
    public function model(array $row)
    {
        if ($row['initial_stock_quantity'] == 0) {
            $status = 'unavailable';
        } else if ($row['initial_stock_quantity'] < $row['minimum_threshold']) {
            $status = 'low_stock';
        } else if ($row['initial_stock_quantity'] > $row['minimum_threshold']) {
            $status = 'available';
        }
        
        $row['status'] = $status;

        return new RawMaterial([
            'material_code'             => $row['material_code'],
            'material_name'             => $row['material_name'],
            'hsn_sac_code'              => $row['material_code'],
            'initial_stock_quantity'    => $row['initial_stock_quantity'],
            'plant_allocated_quantity'  => $row['initial_stock_quantity'],
            'unit_of_measurement'       => $row['unit_of_measurement'],
            'date_of_entry'             => Carbon::now(),
            'raw_materials_used'        => $row['raw_materials_used'] ?? null,
            'status'                    => $row['status'],
            'minimum_threshold'         => $row['minimum_threshold'],
            'buffer_stock'              => $row['minimum_threshold'],
        ]);
    }
}

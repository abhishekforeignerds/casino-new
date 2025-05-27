<?php
namespace App\Imports;

use App\Models\PlantFinishedGood;
use App\Models\FinishedGood;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class PlantFinishedGoodsImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
     * Define validation rules for each row.
     */
    public function rules(): array
    {
        return [
            'item_code' => 'required|string|unique:plant_finished_goods,item_code',
            'item_description' => 'required',
            'hsn_sac_code' => 'nullable',
            'quantity' => 'required|integer',
            'minimum_threshold' => 'required|integer',
            'unit' => 'required',
            'created_at' => 'nullable|date',
            'status' => 'required',
            'plant_id'          => [
            'required',
            function($attribute, $value, $fail) {
                if (!\App\Models\Plant::where('id', $value)->exists()) {
                    $fail('Plant is not created yet.');
                }
            },
        ],
    ];
}

    /**
     * Map each CSV row to a new RawMaterial model.
     */
    public function model(array $row)
    {
        if ($row['quantity'] == 0) {
            $status = 'unavailable';
        } else if ($row['quantity'] < $row['minimum_threshold']) {
            $status = 'low_stock';
        } else if ($row['quantity'] > $row['minimum_threshold']) {
            $status = 'available';
        }
        
        $row['status'] = $status;
        $rawMaterial = FinishedGood::where('material_code', $row['item_code'])->first();

        if (!$rawMaterial) {
            // Create a new RawMaterial if not found
            $rawMaterial = FinishedGood::create([
                'material_code'             => $row['item_code'], // using item_code from CSV
                'material_name'             => $row['item_description'], // or use a dedicated 'material_name' field if available
                'hsn_sac_code'              => $row['item_code'], // adjust if needed
                'initial_stock_quantity'    => $row['quantity'],
                'plant_allocated_quantity'  => $row['quantity'],
                'unit_of_measurement'       => $row['unit'],
                'date_of_entry'             => Carbon::now(),
                'raw_materials_used'        => $row['raw_materials_used'] ?? null,
                'status'                    => $row['status'],
                'minimum_threshold'         => $row['minimum_threshold'],
                'buffer_stock'              => $row['minimum_threshold'],
            ]);
        }

        // Now create the PlantFinishedGood with the associated raw_material_id
        return new PlantFinishedGood([
            'finished_good_id'           => $rawMaterial->id,
            'item_code'                 => $row['item_code'],
            'item_description'          => $row['item_description'],
            'hsn_sac_code'              => $row['item_code'], // adjust if necessary
            'quantity'                  => $row['quantity'],
            'plant_allocated_quantity'  => $row['quantity'],
            'unit'                      => $row['unit'],
            'status'                    => $row['status'],
            'minimum_threshold'         => $row['minimum_threshold'],
            'buffer_stock'              => $row['minimum_threshold'],
            'plant_id'                  => $row['plant_id'],
        ]);

    }
}

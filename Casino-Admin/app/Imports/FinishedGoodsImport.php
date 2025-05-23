<?php
namespace App\Imports;

use App\Models\FinishedGood;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class FinishedGoodsImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
     * Define the validation rules for each row.
     */
    public function rules(): array
    {
        return [
            'material_code'         => 'required|string|unique:finished_goods,material_code',
            'material_name'         => 'required|string',
            'initial_stock_quantity'=> 'required|integer',
            'unit_of_measurement'   => 'required|in:pieces|string',
            'status'                => 'required|string',
            'reorder_level'         => 'required|integer',
        ];
    }

    /**
     * Convert each validated row into a FinishedGood model.
     */
    public function model(array $row) 
    {
        if ($row['initial_stock_quantity'] == 0) {
            $status = 'unavailable';
        } else if ($row['initial_stock_quantity'] < $row['reorder_level']) {
            $status = 'low_stock';
        } else if ($row['initial_stock_quantity'] > $row['reorder_level']) {
            $status = 'available';
        } 

        $row['status'] = $status;

        return new FinishedGood([
            'material_code'            => $row['material_code'],
            'material_name'            => $row['material_name'],
            'hsn_sac_code'             => $row['material_code'],
            'initial_stock_quantity'   => $row['initial_stock_quantity'],
            'unit_of_measurement'      => $row['unit_of_measurement'],
            'plant_allocated_quantity' => $row['initial_stock_quantity'],
            'date_of_entry'            => Carbon::now(),
            'status'                   => $row['status'],
            'reorder_level'            => $row['reorder_level'],
            'buffer_stock'             => $row['reorder_level'],
        ]);
    }

}

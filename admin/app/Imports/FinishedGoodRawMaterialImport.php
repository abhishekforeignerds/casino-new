<?php

namespace App\Imports;

use App\Models\FinishedGoodRawMaterial;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Validation\ValidationException;

class FinishedGoodRawMaterialImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
     * Define the validation rules for each row.
     */
    public function rules(): array
    {
        return [
            'fg_code'             => 'required|string',
            'fg_item_description' => 'required|string',
            'rm_code'             => 'required|string',
            'rm_item_description' => 'required|string',
            'fg_gross_wt'         => 'required',
            'fg_net_wt'           => 'required',
            'scrap_net_wt'        => 'required',
        ];
    }

    /**
     * Convert each validated row into a FinishedGoodRawMaterial model.
     */
    public function model(array $row)
    {
        // Remove commas from numeric values
        $fg_gross_wt  = str_replace(',', '', $row['fg_gross_wt']);
        $fg_net_wt    = str_replace(',', '', $row['fg_net_wt']);
        $scrap_net_wt = str_replace(',', '', $row['scrap_net_wt']);

        return new FinishedGoodRawMaterial([
            'fg_code'             => $row['fg_code'],
            'fg_item_description' => $row['fg_item_description'],
            'rm_code'             => $row['rm_code'],
            'rm_item_description' => $row['rm_item_description'],
            'fg_gross_wt'         => $fg_gross_wt,
            'fg_net_wt'           => $fg_net_wt,
            'scrap_net_wt'        => $scrap_net_wt,
            'quantity_required'   => null,
            'unit'                => 'gm',
            'price'               => null,
        ]);
    }
}

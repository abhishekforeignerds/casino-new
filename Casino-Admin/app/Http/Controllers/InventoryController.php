<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Validation\Rule;
use App\Models\FinishedGoodRawMaterial;
use App\Models\FinishedGood; // Replace with the actual FG model name
use App\Models\RawMaterial; // Replace with the actual RM model name
use App\Imports\FinishedGoodRawMaterialImport; 
use App\Models\Notification; 
use App\Models\PlantFinishedGood; 
use App\Models\User; 
use Maatwebsite\Excel\Facades\Excel;


class InventoryController extends Controller
{

    public function index()
    {
        // Fetch the FinishedGoodRawMaterial model along with the finishedGood and rawMaterial relationships
        $finishedGoodRawMaterials = FinishedGoodRawMaterial::with(['finishedGood', 'rawMaterial'])->get();
    
        // Filter out any items that do not have a finishedGood to avoid errors
        $finishedGoodRawMaterials = $finishedGoodRawMaterials->filter(function ($item) {
            return $item->finishedGood !== null;
        });
    
        // Group by finished good's material_code
        $groupedFinishedGoods = $finishedGoodRawMaterials->groupBy(function ($item) {
            return $item->finishedGood->material_code;  // Now safe because of the filter above
        })->map(function ($items) {
            return $items->reduce(function ($carry, $item) {
                // Store a representative id (first record's id)
                if (!isset($carry['id'])) {
                    $carry['id'] = $item->id;
                }
                // Append raw material details
                $carry['raw_materials'][] = [
                    'raw_material_code' => $item->rawMaterial->material_code,  // Use material_code for raw material
                    'quantity_required' => $item->fg_gross_wt,
                    'unit' => $item->unit,
                    'price' => $item->price,
                ];
                // Sum up the total quantity required
                $carry['total_quantity_required'] = (isset($carry['total_quantity_required']) ? $carry['total_quantity_required'] : 0) + $item->fg_gross_wt;
                // Calculate total price as price for each raw material (adjust if needed)
                $carry['total_price'] = (isset($carry['total_price']) ? $carry['total_price'] : 0) + $item->price;
                
                // Aggregate weight values (sum them)
                $carry['fg_gross_wt'] = (isset($carry['fg_gross_wt']) ? $carry['fg_gross_wt'] : 0) + $item->fg_gross_wt;
                $carry['fg_net_wt'] = (isset($carry['fg_net_wt']) ? $carry['fg_net_wt'] : 0) + $item->fg_net_wt;
                $carry['scrap_net_wt'] = (isset($carry['scrap_net_wt']) ? $carry['scrap_net_wt'] : 0) + $item->scrap_net_wt;
                
                return $carry;
            }, [
                'raw_materials' => [],
                'total_quantity_required' => 0,
                'total_price' => 0,
                'fg_gross_wt' => 0,
                'fg_net_wt' => 0,
                'scrap_net_wt' => 0,
            ]);
        });
    
        // Get the list of validated FG codes from raw materials
        $validatedFGs = FinishedGoodRawMaterial::pluck('fg_code');
    
        // Get finished goods with the required statuses
        $finishedGoods = FinishedGood::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();
    
        // Count of validated FG codes
        $finishedGoodsCount = FinishedGoodRawMaterial::distinct()->count('fg_code');
    
        // Count of total finished good inventory (assuming FinishedGood model represents the inventory)
        $finishedGoodInventory = FinishedGood::distinct()->count('id');
    
        // Calculate count of unvalidated finished goods
        $rm_or_fg_count  = $finishedGoodInventory - $finishedGoodsCount;
    
        // Count of raw materials
        $rawMaterialsCount = FinishedGoodRawMaterial::distinct()->count('rm_code');
    
        // Get the list of FG codes from PlantFinishedGood that are NOT in the validated list
        $unvalidatedFGs = FinishedGood::whereIn('status', ['available', 'low_stock', 'unavailable'])
            ->whereNotIn('material_code', $validatedFGs)
            ->pluck('material_code');
    
        return inertia('Inventory/View', [
            'groupedFinishedGoods' => $groupedFinishedGoods,
            'finishedGoods'        => $finishedGoodsCount,
            'rawMaterials'         => $rawMaterialsCount,
            'rm_or_fg_count'       => $rm_or_fg_count,
            'unvalidated_fg_codes' => $unvalidatedFGs,
        ]);
    }
    

    

    
    

    public function create()
    {
        $validatedFGs = FinishedGoodRawMaterial::pluck('fg_code');

        // Get finished goods with the required statuses
        $finishedGoods = FinishedGood::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();

        // Count of validated FG codes
        $finishedGoodsCount = FinishedGoodRawMaterial::distinct()->count('fg_code');

        // Count of total finished good inventory (assuming FinishedGood model represents the inventory)
        $finishedGoodInventory = FinishedGood::distinct()->count('id');

        // Calculate count of unvalidated finished goods
        $rm_or_fg_count  = $finishedGoodInventory - $finishedGoodsCount;

        // Count of raw materials
        $rawMaterialsCount = FinishedGoodRawMaterial::distinct()->count('rm_code');

        // Get the list of FG codes from PlantFinishedGood that are NOT in the validated list
        $unvalidatedFGs = FinishedGood::whereIn('status', ['available', 'low_stock', 'unavailable'])
        ->whereNotIn('material_code', $validatedFGs)
        ->pluck('material_code');

        $finishedGoods = FinishedGood::whereIn('status', ['available','unavailable', 'low_stock'])->get();
        $rawMaterials = RawMaterial::whereIn('status', ['available','unavailable', 'low_stock'])->get();
        return inertia('Inventory/Create', [
            'finishedGoods' => $finishedGoods,
            'rawMaterials' => $rawMaterials,
            'unvalidated_fg_codes' => $unvalidatedFGs,
        ]);
    }


    
    public function store(Request $request)
    {
        $finishedGoods = FinishedGood::all();
        $finishedGood = $finishedGoods->firstWhere('id', $request['fg_code']);
        $fg_code = $finishedGood ? $finishedGood->material_code : '';
        $validatedData = $request->validate([
            'fg_code' => [
                'required',
                // Validate that the fg_code exists in finished_goods table based on material_code
                Rule::exists('finished_goods', 'material_code'),
                // Validate that the fg_code is unique in finished_good_raw_material table
                Rule::unique('finished_good_raw_material', 'fg_code'),
            ],
            'rm_code' => 'required|exists:raw_materials,material_code',
            'fg_gross_wt' => 'required|numeric|min:0',
            'fg_net_wt' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value > $request->fg_gross_wt) {
                        $fail('The net weight cannot be greater than the gross weight.');
                    }
                },
            ],
        ], [
            'fg_code.exists' => 'The FG code is already associated with a raw material.',
            'fg_code.unique' => 'The FG code is already associated with a raw material.',
        ]);
    
    
    
        $finishedGood = $finishedGoods->firstWhere('material_code', $validatedData['fg_code']);

        // Retrieve the description, or set a default if not found.
        $fg_code = $finishedGood ? $finishedGood->material_code : '';
        $fg_desc = $finishedGood ? $finishedGood->material_name : '';
        
        // If you have a similar requirement for raw materials, you might do something like:
        $rawMaterial = RawMaterial::firstWhere('material_code', $validatedData['rm_code']);
        $rm_code = $rawMaterial ? $rawMaterial->material_code : '';
        $rm_desc = $rawMaterial ? $rawMaterial->material_name : '';
        

        // Create a new entry in the finished_good_raw_material table
        FinishedGoodRawMaterial::create([
            'fg_code' => $fg_code,
            'rm_code' => $rm_code,
            'fg_gross_wt' => $validatedData['fg_gross_wt'],
            'fg_net_wt' => $validatedData['fg_net_wt'],
            'fg_item_description' => $fg_desc,
            'rm_item_description' => $rm_desc,
            'scrap_net_wt' => $validatedData['fg_gross_wt']  -  $validatedData['fg_net_wt'],
        ]);
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'added',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'New RM for FG validation added successfully for Finish Good '. $fg_code .'',
            'notification_url'  => 'raw-materials',
        ]);

        // Redirect back with a success message
        return redirect()->route('inventory.index')->with('success', 'RM Setting created successfully.');
    }
    public function edit($id)
    {
        // Fetch all finished goods and raw materials
        $finishedGoods = FinishedGood::all();
        $rawMaterials = RawMaterial::all();

        // Find the FinishedGoodRawMaterial record to edit using the id parameter
        $finishedGoodRawMaterial = FinishedGoodRawMaterial::findOrFail($id);

        // Pass the record along with the lookup data to the Inertia view
        return inertia('Inventory/Edit', [
            'finishedGoodRawMaterial' => $finishedGoodRawMaterial,
            'finishedGoods' => $finishedGoods,
            'rawMaterials' => $rawMaterials,
        ]);
    }


    public function update(Request $request, $id)
    {
        // Retrieve the existing record for update
        $finishedGoodRawMaterial = FinishedGoodRawMaterial::findOrFail($id);

        // Validate the incoming data
        $validatedData = $request->validate([
            'fg_code' => [
                'required',
            ],
            'rm_code' => 'required|exists:raw_materials,material_code',
            'fg_gross_wt' => 'required|numeric|min:0',
            'fg_net_wt' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value > $request->fg_gross_wt) {
                        $fail('The net weight cannot be greater than the gross weight.');
                    }
                },
            ],
        ], [
            'fg_code.unique' => 'The FG code is already associated with a raw material.',
        ]);
    
        // Retrieve the finished good details
        $finishedGoods = FinishedGood::all();
        $finishedGood = $finishedGoods->firstWhere('material_code', $validatedData['fg_code']);
        $fg_code = $finishedGood ? $finishedGood->material_code : '';
        $fg_desc = $finishedGood ? $finishedGood->material_name : '';
    
        // Retrieve the raw material details
        $rawMaterial = RawMaterial::firstWhere('material_code', $validatedData['rm_code']);
        $rm_code = $rawMaterial ? $rawMaterial->material_code : '';
        $rm_desc = $rawMaterial ? $rawMaterial->material_name : '';
    
        // Update the existing finished good raw material entry
        $finishedGoodRawMaterial->update([
            'fg_code'             => $fg_code,
            'rm_code'             => $rm_code,
            'fg_gross_wt'         => $validatedData['fg_gross_wt'],
            'fg_net_wt'           => $validatedData['fg_net_wt'],
            'fg_item_description' => $fg_desc,
            'rm_item_description' => $rm_desc,
            'scrap_net_wt'        => $validatedData['fg_gross_wt'] - $validatedData['fg_net_wt'],
        ]);

        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'updated',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'New RM for FG validation updated successfully for Finish Good '. $fg_code .'',
            'notification_url'  => 'raw-materials',
        ]);
    
        // Redirect back with a success message
        return redirect()->route('inventory.index')->with('success', 'RM Setting updated successfully.');
    }
    
    public function importForm()
    {
        return inertia('Inventory/Import');
    }

    // Handle the CSV import
   
public function import(Request $request)
{
    $request->validate([
        'csv_file' => 'required|file|mimes:csv,txt,xlsx,xls|max:2048',
    ]);

    try {
        Excel::import(new FinishedGoodRawMaterialImport, $request->file('csv_file'));
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
    
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'imported',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'RM & FG Relation Imported successfully.',
            'notification_url'  => 'inventory',
        ]);
    } catch (ValidationException $e) {
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput();
    }

    return redirect()->route('inventory.index')
        ->with('success', 'FG & RM connection imported successfully.');
}
    

}
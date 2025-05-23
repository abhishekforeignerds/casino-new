<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use App\Models\Plant;
use App\Models\FinishedGood;
use App\Models\RawMaterial;
use App\Models\User;
use Spatie\Permission\Models\Role;
use App\Models\PlantFinishedGood;
use App\Models\PlantRawMaterial;
use App\Models\Notification;
use App\Models\FinishedGoodRawMaterial;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Carbon\Carbon;
use App\Imports\PlantRawMaterialsImport;
use App\Imports\PlantFinishedGoodsImport;
use Maatwebsite\Excel\Facades\Excel;


class PlantController extends Controller
{
    public function index()
    {
        $plants =  Plant::all();
        $allPlants = Plant::all()->count();
        $maintenancePlants = Plant::where('status', 'maintenance')->count();
        $capacity = Plant::where('status', 'active')->sum('capacity');
        $availablePlants = Plant::where('status', 'active')->count();
        $unavailablePlants = Plant::where('status', 'inactive')->count();
        return Inertia::render('Plants/View', ['plants' => $plants,'statusCounts' => [
                'maintenancePlants' => $maintenancePlants,
                'availablePlants' => $availablePlants,
                'unavailablePlants' => $unavailablePlants,
                'allPlants' => $allPlants,
                'capacity' => $capacity,
            ],]);
    }

    public function create()
    {
        $finished_goods = FinishedGood::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();
        $raw_materials = RawMaterial::where('status', ['available', 'low_stock', 'unavailable'])->get();
        $fgrm = FinishedGoodRawMaterial::all();
        return Inertia::render('Plants/Create', [
            'finished_goods' => $finished_goods,
            'fgrm' => $fgrm,
            'raw_materials' => $raw_materials,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plant_name' => 'required|string|unique:plants,plant_name',
            'status' => 'required',
            'capacity' => 'required|integer',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip' => 'required|digits:6',
            'country' => 'required|string',
            'finished_goods' => 'nullable|array',
            'raw_materials' => 'nullable|array',
        ]);

        // Ensure finished_goods and raw_materials are arrays, even if null
        $finishedGoodsInput = $request->finished_goods ?? [];
        $rawMaterialsInput = $request->raw_materials ?? [];

        $validated['finished_goods'] = json_encode($finishedGoodsInput);
        $validated['raw_materials'] = json_encode($rawMaterialsInput);

        $plant = Plant::create($validated);

        foreach ($finishedGoodsInput as $finished_good_id) {
            $finishedGood = FinishedGood::find($finished_good_id['id']);
            if ($finishedGood) {
                if ($finishedGood->plant_allocated_quantity >= $finished_good_id['quantity']) {
                    $finishedGood->plant_allocated_quantity -= $finished_good_id['quantity'];
                    if ($finishedGood->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($finishedGood->initial_stock_quantity < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finishedGood->initial_stock_quantity > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;
                    $finishedGood->save();

                    if ($finished_good_id['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($finished_good_id['quantity'] < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finished_good_id['quantity'] > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;

                    PlantFinishedGood::create([
                        'plant_id' => $plant->id,
                        'finished_good_id' => $finishedGood->id,
                        'item_code' => $finishedGood->material_code,
                        'item_description' => $finishedGood->material_name,
                        'hsn_sac_code' => $finishedGood->hsn_sac_code,
                        'status' =>  $status,
                        'quantity' => $finished_good_id['quantity'] ?? 0,
                        'unit' => $finishedGood->unit_of_measurement,
                        'reorder_level' => $finishedGood->reorder_level,
                        'buffer_stock' => $finishedGood->buffer_stock,
                    ]);
                } else if ($finishedGood->plant_allocated_quantity < $finished_good_id['quantity']) {
                    $finishedGood->initial_stock_quantity += ($finished_good_id['quantity'] - $finishedGood->plant_allocated_quantity);
                    $finishedGood->plant_allocated_quantity = 0;
                    if ($finishedGood->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($finishedGood->initial_stock_quantity < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finishedGood->initial_stock_quantity > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;
                    $finishedGood->save();

                    if ($finished_good_id['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($finished_good_id['quantity'] < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finished_good_id['quantity'] > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;
                    $finishedGood->save();

                    PlantFinishedGood::create([
                        'plant_id' => $plant->id,
                        'finished_good_id' => $finishedGood->id,
                        'item_code' => $finishedGood->material_code,
                        'item_description' => $finishedGood->material_name,
                        'hsn_sac_code' => $finishedGood->hsn_sac_code,
                        'status' => $status,
                        'quantity' => $finished_good_id['quantity'] ?? 0,
                        'unit' => $finishedGood->unit_of_measurement,
                        'reorder_level' => $finishedGood->reorder_level,
                        'buffer_stock' => $finishedGood->buffer_stock,
                    ]);
                }
            }
        }

        foreach ($rawMaterialsInput as $raw_material_id) {
            $rawMaterial = RawMaterial::find($raw_material_id['id']);
            if ($rawMaterial) {
                if ($rawMaterial->plant_allocated_quantity >= $raw_material_id['quantity']) {
                    $rawMaterial->plant_allocated_quantity -= $raw_material_id['quantity'];
                    if ($rawMaterial->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($rawMaterial->initial_stock_quantity < $rawMaterial->reorder_level) {
                        $status = 'low_stock';
                    } else if ($rawMaterial->initial_stock_quantity > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }
                    $rawMaterial->status = $status;
                    $rawMaterial->save();

                    if ($raw_material_id['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($raw_material_id['quantity'] < $rawMaterial->reorder_level) { // Fixed reference to rawMaterial instead of finishedGood
                        $status = 'low_stock';
                    } else if ($raw_material_id['quantity'] > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }

                    PlantRawMaterial::create([
                        'plant_id' => $plant->id,
                        'raw_material_id' => $rawMaterial->id,
                        'item_code' => $rawMaterial->material_code,
                        'item_description' => $rawMaterial->material_name,
                        'hsn_sac_code' => $rawMaterial->hsn_sac_code,
                        'status' => $status,
                        'quantity' => $raw_material_id['quantity'] ?? 0,
                        'unit' => $rawMaterial->unit_of_measurement,
                        'minimum_threshold' => $rawMaterial->minimum_threshold,
                        'buffer_stock' => $rawMaterial->buffer_stock,
                    ]);
                } else if ($rawMaterial->plant_allocated_quantity < $raw_material_id['quantity']) {
                    $rawMaterial->initial_stock_quantity += ($raw_material_id['quantity'] - $rawMaterial->plant_allocated_quantity);
                    $rawMaterial->plant_allocated_quantity = 0;
                    if ($rawMaterial->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($rawMaterial->initial_stock_quantity < $rawMaterial->reorder_level) {
                        $status = 'low_stock';
                    } else if ($rawMaterial->initial_stock_quantity > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }
                    $rawMaterial->status = $status;
                    $rawMaterial->save();

                    if ($raw_material_id['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($raw_material_id['quantity'] < $rawMaterial->reorder_level) { // Fixed reference to rawMaterial instead of finishedGood
                        $status = 'low_stock';
                    } else if ($raw_material_id['quantity'] > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }

                    PlantRawMaterial::create([
                        'plant_id' => $plant->id,
                        'raw_material_id' => $rawMaterial->id,
                        'item_code' => $rawMaterial->material_code,
                        'item_description' => $rawMaterial->material_name,
                        'hsn_sac_code' => $rawMaterial->hsn_sac_code,
                        'status' => $status,
                        'quantity' => $raw_material_id['quantity'] ?? 0,
                        'unit' => $rawMaterial->unit_of_measurement,
                        'minimum_threshold' => $rawMaterial->minimum_threshold,
                        'buffer_stock' => $rawMaterial->buffer_stock,
                    ]);
                }
            }
        }

        $plantHead = User::whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })->first();

        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();

        $managerImports = User::whereHas('roles', function ($query) {
            $query->where('name', 'Manager Imports');
        })->first();
        if ($plantHead->id > 0) {
            $this->sendNotification(
                $managerImports->id ?? auth()->id(),
                $plantHead->id ?? 1,
                'created',
                'created',
                'New '. $validated['plant_name'] .' added successfully. ',
                'plants'
            );
        }
        
        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $superAdmin->id ?? 1,
            'created',
            'created',
            'New '. $validated['plant_name'] .' added successfully. ',
            'plants'
        );

        return redirect()->route('plants.index')->with('success', 'Plant created successfully.');
    }


    public function edit($id)
    {
        $plant = Plant::findOrFail($id);
        

        $selectedFinishedGoods = json_decode($plant->finished_goods, true) ?? [];
        $selectedRawMaterials = json_decode($plant->raw_materials, true) ?? [];
    
        // Get all available finished goods
        $allFinishedGoods = FinishedGood::all();
        $rawMaterials = RawMaterial::all();
        $fgrm = FinishedGoodRawMaterial::all();

        return Inertia::render('Plants/Edit', [
            'plant' => $plant,
            'finishedGoods' => $allFinishedGoods, // Pass all finished goods
            'rawMaterials' => $rawMaterials, // Pass all finished goods
            'selectedFinishedGoods' => $selectedFinishedGoods, // Pass selected ones separately
            'selectedRawMaterials' => $selectedRawMaterials, // Pass selected ones separately
            'fgrm' => $fgrm, // Pass selected ones separately
        ]);
    }
    
    
    
    public function view($id)
    {
        $plant = Plant::findOrFail($id);
    
        // Decode finished goods and raw materials JSON data
        $finishedGoodsData = json_decode($plant->finished_goods, true) ?? [];
        $rawMaterialsData = json_decode($plant->raw_materials, true) ?? [];
    
        // Extract flat arrays of IDs
        $finishedGoodsIds = array_column($finishedGoodsData, 'id');
        $rawMaterialsIds = array_column($rawMaterialsData, 'id');
    
        // Fetch finished good names based on the extracted IDs
        $selectedFinishedGoods = FinishedGood::whereIn('id', $finishedGoodsIds)
            ->pluck('material_name')
            ->toArray();
    
        // Fetch raw material names based on the extracted IDs
        $selectedRawMaterials = RawMaterial::whereIn('id', $rawMaterialsIds)
            ->pluck('material_name')
            ->toArray();
    
        return Inertia::render('Plants/ViewPlant', [
            'plant' => $plant,
            'selectedFinishedGoods' => $selectedFinishedGoods,
            'selectedRawMaterials' => $selectedRawMaterials,
        ]);
    }
    
    

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'plant_name' => 'required|string|unique:plants,plant_name,'.$id,
            'status' => 'required',
            'capacity' => 'required|integer',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip' => 'required|digits:6',
            'country' => 'required|string',
            // You can allow these to be nullable so that if they are not passed, you get an empty array
            'finished_goods' => 'nullable|array',
            'raw_materials' => 'nullable|array',
        ]);

        // Find the plant and decode the previously stored JSON arrays
        $plant = Plant::findOrFail($id);
        $previousFinishedGoods = json_decode($plant->finished_goods, true) ?? [];
        $previousRawMaterials = json_decode($plant->raw_materials, true) ?? [];

        // Restore previous allocated quantities for finished goods
        foreach ($previousFinishedGoods as $prevGood) {
            $finishedGood = FinishedGood::find($prevGood['id']);
            if ($finishedGood) {
                $finishedGood->plant_allocated_quantity += $prevGood['quantity'];
                $finishedGood->save();
            }
        }

        // Restore previous allocated quantities for raw materials
        foreach ($previousRawMaterials as $prevMaterial) {
            $rawMaterial = RawMaterial::find($prevMaterial['id']);
            if ($rawMaterial) {
                $rawMaterial->plant_allocated_quantity += $prevMaterial['quantity'];
                $rawMaterial->save();
            }
        }

        // Clear the stored finished_goods and raw_materials to avoid duplication
        $plant->update([
            'finished_goods' => null,
            'raw_materials' => null,
        ]);

        // Ensure input arrays are safe for iteration even if null
        $finishedGoodsInput = $request->finished_goods ?? [];
        $rawMaterialsInput = $request->raw_materials ?? [];

        // Prepare new finished goods and raw materials data
        $validated['finished_goods'] = json_encode($finishedGoodsInput);
        $validated['raw_materials'] = json_encode($rawMaterialsInput);

        // Update plant details
        $plant->update($validated);

        // Send notifications as needed
        $plantHead = User::whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })->first();
        $managerImports = User::whereHas('roles', function ($query) {
            $query->where('name', 'Manager Imports');
        })->first();

        if ($plantHead->id > 0) {
            $this->sendNotification(
                $managerImports->id ?? auth()->id(),
                $plantHead->id ?? 1,
                'updated',
                'updated',
                ''. $validated['plant_name'] .' updated successfully. ',
                'plants'
            );
        }
        
        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $superAdmin->id ?? 1,
            'updated',
            'updated',
            ''. $validated['plant_name'] .' updated successfully. ',
            'plants'
        );

        // Clear existing plant finished goods and raw materials records to prevent duplication
        PlantFinishedGood::where('plant_id', $plant->id)->delete();
        PlantRawMaterial::where('plant_id', $plant->id)->delete();

        // Process the updated finished goods
        foreach ($finishedGoodsInput as $finished_good) {
            $finishedGood = FinishedGood::find($finished_good['id']);
            if ($finishedGood) {
                if ($finishedGood->plant_allocated_quantity >= $finished_good['quantity']) {
                    // Deduct new allocated quantities
                    $finishedGood->plant_allocated_quantity -= $finished_good['quantity'];
                    if ($finishedGood->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($finishedGood->initial_stock_quantity < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finishedGood->initial_stock_quantity > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;
                    $finishedGood->save();

                    if ($finished_good['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($finished_good['quantity'] < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finished_good['quantity'] > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;

                    // Create new entry for plant finished good
                    PlantFinishedGood::create([
                        'plant_id' => $plant->id,
                        'finished_good_id' => $finishedGood->id,
                        'item_code' => $finishedGood->material_code,
                        'item_description' => $finishedGood->material_name,
                        'hsn_sac_code' => $finishedGood->hsn_sac_code,
                        'status' => $status,
                        'quantity' => $finished_good['quantity'],
                        'unit' => $finishedGood->unit_of_measurement,
                        'reorder_level' => $finishedGood->reorder_level,
                        'buffer_stock' => $finishedGood->buffer_stock,
                    ]);
                } else if ($finishedGood->plant_allocated_quantity < $finished_good['quantity']) {
                    $finishedGood->initial_stock_quantity += ($finished_good['quantity'] - $finishedGood->plant_allocated_quantity);
                    $finishedGood->plant_allocated_quantity = 0;
                    // No need to deduct again here since plant_allocated_quantity is now 0

                    if ($finishedGood->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($finishedGood->initial_stock_quantity < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finishedGood->initial_stock_quantity > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;
                    $finishedGood->save();

                    if ($finished_good['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($finished_good['quantity'] < $finishedGood->reorder_level) {
                        $status = 'low_stock';
                    } else if ($finished_good['quantity'] > $finishedGood->reorder_level) {
                        $status = 'available';
                    }
                    $finishedGood->status = $status;

                    PlantFinishedGood::create([
                        'plant_id' => $plant->id,
                        'finished_good_id' => $finishedGood->id,
                        'item_code' => $finishedGood->material_code,
                        'item_description' => $finishedGood->material_name,
                        'hsn_sac_code' => $finishedGood->hsn_sac_code,
                        'status' => $status,
                        'quantity' => $finished_good['quantity'],
                        'unit' => $finishedGood->unit_of_measurement,
                        'reorder_level' => $finishedGood->reorder_level,
                        'buffer_stock' => $finishedGood->buffer_stock,
                    ]);
                }
            }
        }

        // Process the updated raw materials
        foreach ($rawMaterialsInput as $raw_material) {
            $rawMaterial = RawMaterial::find($raw_material['id']);
            if ($rawMaterial) {
                if ($rawMaterial->plant_allocated_quantity >= $raw_material['quantity']) {
                    // Deduct new allocated quantities
                    $rawMaterial->plant_allocated_quantity -= $raw_material['quantity'];
                    if ($rawMaterial->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($rawMaterial->initial_stock_quantity < $rawMaterial->reorder_level) {
                        $status = 'low_stock';
                    } else if ($rawMaterial->initial_stock_quantity > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }
                    $rawMaterial->status = $status;
                    $rawMaterial->save();

                    if ($raw_material['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($raw_material['quantity'] < $rawMaterial->reorder_level) {
                        $status = 'low_stock';
                    } else if ($raw_material['quantity'] > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }

                    // Create new entry for plant raw material
                    PlantRawMaterial::create([
                        'plant_id' => $plant->id,
                        'raw_material_id' => $rawMaterial->id,
                        'item_code' => $rawMaterial->material_code,
                        'item_description' => $rawMaterial->material_name,
                        'hsn_sac_code' => $rawMaterial->hsn_sac_code,
                        'status' => $status,
                        'quantity' => $raw_material['quantity'],
                        'unit' => $rawMaterial->unit_of_measurement,
                        'minimum_threshold' => $rawMaterial->minimum_threshold,
                        'buffer_stock' => $rawMaterial->buffer_stock,
                    ]);
                } else if ($rawMaterial->plant_allocated_quantity < $raw_material['quantity']) {
                    $rawMaterial->initial_stock_quantity += ($raw_material['quantity'] - $rawMaterial->plant_allocated_quantity);
                    $rawMaterial->plant_allocated_quantity = 0;

                    if ($rawMaterial->initial_stock_quantity == 0) {
                        $status = 'unavailable';
                    } else if ($rawMaterial->initial_stock_quantity < $rawMaterial->reorder_level) {
                        $status = 'low_stock';
                    } else if ($rawMaterial->initial_stock_quantity > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }
                    $rawMaterial->status = $status;
                    $rawMaterial->save();

                    if ($raw_material['quantity'] == 0) {
                        $status = 'unavailable';
                    } else if ($raw_material['quantity'] < $rawMaterial->reorder_level) {
                        $status = 'low_stock';
                    } else if ($raw_material['quantity'] > $rawMaterial->reorder_level) {
                        $status = 'available';
                    }
                    
                    PlantRawMaterial::create([
                        'plant_id' => $plant->id,
                        'raw_material_id' => $rawMaterial->id,
                        'item_code' => $rawMaterial->material_code,
                        'item_description' => $rawMaterial->material_name,
                        'hsn_sac_code' => $rawMaterial->hsn_sac_code,
                        'status' => $status,
                        'quantity' => $raw_material['quantity'],
                        'unit' => $rawMaterial->unit_of_measurement,
                        'minimum_threshold' => $rawMaterial->minimum_threshold,
                        'buffer_stock' => $rawMaterial->buffer_stock,
                    ]);
                }
            }
        }

        return redirect()->route('plants.index')->with('success', 'Plant updated successfully.');
    }

    

    public function updateassignplant(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plant_id' => 'required|exists:plants,id',
            'effective_date' => 'required',
        ]);
      
    
        // Find the user and update the assigned_plant column
        $user = User::findOrFail($validated['user_id']);
      
        $true = $user->update([
            'plant_assigned' => $validated['plant_id'],
            'effective_date' => $validated['effective_date'],
        ]);
    
    
        return redirect()->route('plants.assignPlant')->with('success', 'Plant assigned successfully.');
    }
    

    public function destroy($id)
    {
        $plant = Plant::findOrFail($id);
        $plant->delete();
        return redirect()->route('plants.index')->with('success', 'Plant deleted successfully.');
    }

    public function assignPlant()
    {
        $plants = Plant::where('status', 'active')->get();


        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Plant head']);
        })
        ->where('status', 'active') // Filter by active status
        ->with(['roles', 'plant'])
        ->get();
        
        return Inertia::render('Plants/AssignPlant', ['plants' => $plants, 'users' => $users]);
    }
    public function suspend($id)
    {
        // Find the user by ID or fail if not found
        $user = Plant::findOrFail($id);

        // Update the user's status to 'inactive'
        $user->update([
            'status' => 'inactive',
        ]);

        // Redirect back with a success message
        return redirect()->route('plants.index')->with('success', 'Finished Good suspended successfully.');
    }
    public function finishedGoodsList()
    {
        $finishedGoods = PlantFinishedGood::with(['plant'])->get();
        

        $allFinishedGoods = $finishedGoods->count();
        $availableFinishedGoods = PlantFinishedGood::where('status', 'available')->count();
        $lowStockFinishedGoods = PlantFinishedGood::whereIn('status', ['low_stock','unavailable'])->count();
        $unavailableFinishedGoods = PlantFinishedGood::where('status', 'unavailable')->count();

        return Inertia::render('Plants/FinishedGoods', [
            'finishedGoods' => $finishedGoods,
            'statusCounts' => [
                'unavailableFinishedGoods' => $unavailableFinishedGoods,
                'lowStockFinishedGoods' => $lowStockFinishedGoods,
                'availableFinishedGoods' => $availableFinishedGoods,
                'allFinishedGoods' => $allFinishedGoods,
            ],
        ]);
    }

    public function rawMaterialsList()
    {
        $rawMaterials = PlantRawMaterial::with(['plant'])->get();
        $allRawMaterials = PlantRawMaterial::all()->count();
        $activeRawMaterials = PlantRawMaterial::where('status', 'available')->count();
        $lowStockRawMaterials = PlantRawMaterial::whereIn('status', ['low_stock','unavailable'])->count();
        $unavailableRawMaterials = PlantRawMaterial::where('status', 'unavailable')->count();


        return Inertia::render('Plants/RawMaterials', [
            'rawMaterials' => $rawMaterials,
            'statusCounts' => [
            'activeRawMaterials' => $activeRawMaterials,
            'lowStockRawMaterials' => $lowStockRawMaterials,
            'allRawMaterials' => $allRawMaterials,
        ],
        ]);
    }


  
    






    public function editFgList($id)
    {
        $finishedGood = PlantFinishedGood::with('plant')->findOrFail($id);

        $plants =  Plant::where('status', 'active')->get(); 
            return Inertia::render('Plants/FinishedGoods/Edit', [
                'finishedGood' => $finishedGood,
                'plants' => $plants,
            ]);
    }
    public function updateFgList(Request $request, $id)
    {
        $validated = $request->validate([
            'item_code' => 'required',
            'item_description' => 'required',
            'hsn_sac_code' => 'nullable',
            'quantity' => 'required|integer',
            'unit' => 'required',
            'created_at' => 'required|date',
            'status' => 'required',
            'plant_id' => 'required',
        ]);
       
        $finishedGood = PlantFinishedGood::findOrFail($id);
        if ($validated['quantity'] == 0) {
            $status = 'unavailable';
        } else if ($validated['quantity'] < $finishedGood->reorder_level) {
            $status = 'low_stock';
        } else if ($validated['quantity'] > $finishedGood->reorder_level) {
   
            $status = 'available';
        } 

        $validated['status'] = $status;
        $finishedGood->update($validated);
        return redirect()->route('plants.finishedGoodsList')->with('success', 'Finished Good updated successfully.');
    }

    public function editRmList($id)
    {
        $rawMaterial = PlantRawMaterial::with('plant')->findOrFail($id);

        $plants =  Plant::where('status', 'active')->get(); 
        return Inertia::render('Plants/RawMaterials/Edit', [
            'rawMaterial' => $rawMaterial,
            'plants' => $plants,
        ]);
    }

    public function updateRmList(Request $request, $id)
    {
        $validated = $request->validate([
            'item_code' => 'required',
            'item_description' => 'required',
            'hsn_sac_code' => 'required',
            'quantity' => 'required|integer',
            'unit' => 'required',
            'created_at' => 'required|date',
            'status' => 'required',
            'plant_id' => 'required',
        ]);

       
        $rawMaterial = PlantRawMaterial::findOrFail($id);
        if ($validated['quantity'] == 0) {
            $status = 'unavailable';
        } else if ($validated['quantity'] < $rawMaterial->minimum_threshold) {
            $status = 'low_stock';
        } else if ($validated['quantity'] > $rawMaterial->minimum_threshold) {
   
            $status = 'available';
        } 

        $validated['status'] = $status;

   
        $rawMaterial->update($validated);

        return redirect()->route('plants.rawMaterialsList')->with('success', 'Raw Material updated successfully.');
    }
    
    public function viewrm($id)
    {
        $rawMaterial = PlantRawMaterial::with('plant')->findOrFail($id);

        return Inertia::render('Plants/RawMaterials/ViewRawMaterial', [
            'rawMaterial' => $rawMaterial,
        ]);
    }
    public function createrm()
    {
        $plants =  Plant::where('status', 'active')->get(); 
        return Inertia::render('Plants/RawMaterials/Create', [
            'plants' => $plants,
        ]);
    }

    public function storerm(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'required|string|unique:plant_raw_material,item_code',
            'item_description' => 'required',
            'hsn_sac_code' => 'nullable',
            'quantity' => 'required|integer',
            'minimum_threshold' => 'required|integer',
            'unit' => 'required',
            'created_at' => 'nullable|date',
            'status' => 'required',
            'plant_id' => 'required',
        ]);

        if ($request->quantity == 0) {
            $status = 'unavailable';
        } else if ($request->quantity < $request->minimum_threshold) {
            $status = 'low_stock';
        } else if ($request->quantity > $request->minimum_threshold) {
            $status = 'available';
        } 

        $finishedGoodData = [
            'material_code'         => $request->item_code,
            'material_name'         => $request->item_description,  // assuming you have a material name field coming from the request
            'hsn_sac_code'          => $request->item_code,    // if using material_code as hsn_sac_code
            'initial_stock_quantity'=> $request->quantity,
            'plant_allocated_quantity' => $request->quantity,
            'unit_of_measurement'   => $request->unit,
            'date_of_entry'         => Carbon::now(),
            'status'                => $status,
            'minimum_threshold'     => $request->minimum_threshold,
            'buffer_stock'          => $request->minimum_threshold,
        ];
        
        // Use firstOrCreate to get the record if it exists or create it if not
        $finishedGood = RawMaterial::firstOrCreate(
            ['material_code' => $request->item_code],
            $finishedGoodData
        );
        
        $finished_good_id = $finishedGood->id;
        

        $plantFinishedGoodData = [
            'item_code'                => $request->item_code,
            'item_description'         => $request->item_description,
            'hsn_sac_code'             => $request->item_code, // if mapping the item code as hsn_sac_code
            'quantity'                 => $request->quantity,
            'unit'                     => $request->unit,
            'status'                   => $status,
            'plant_id'                 => $request->plant_id,
            'raw_material_id'         => $finished_good_id, // from above
            'plant_allocated_quantity' => $request->initial_stock_quantity,
        ];

       
    
        PlantRawMaterial::create($plantFinishedGoodData);

        $plantHead = User::whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })->first();

        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();

        $managerImports = User::whereHas('roles', function ($query) {
            $query->where('name', 'Manager Imports');
        })->first();
        if ($plantHead->id > 0) {
            $this->sendNotification(
                $managerImports->id ?? auth()->id(),
                $plantHead->id ?? 1,
                'created',
                'created',
               'New Raw Material added successfully.',
                'plants/raw-materials'
            );
        }
        $this->sendNotification(
            $plantHead->id ?? auth()->id(),
            $superAdmin->id ?? 1,
            'created',
            'created',
            'New Raw Material added successfully.',
            'plants/raw-materials'
        );
        return redirect()->route('plants.rawMaterialsList')->with('success', 'Raw Material created successfully.');
    }

    public function editrm($id)
    {
        // Retrieve the finished good (raw material) record using the provided ID
        $finishedGood = RawMaterial::findOrFail($id);
        
        // Get all active plants
        $plants = Plant::where('status', 'active')->get();

        // Render the edit page with the current finished good data and plants list
        return Inertia::render('Plants/RawMaterials/Edit', [
            'finishedGood' => $finishedGood,
            'plants' => $plants,
        ]);
    }

    public function updaterm(Request $request, $id)
    {
        // Retrieve the record that needs to be updated
        $finishedGood = RawMaterial::findOrFail($id);

        // Validate incoming request data
        $validated = $request->validate([
            'item_code'          => 'required|unique:plant_raw_material,item_code,' . $id,
            'item_description'   => 'required',
            'hsn_sac_code'       => 'nullable',
            'quantity'           => 'required|integer',
            'minimum_threshold'  => 'required|integer',
            'unit'               => 'required',
            'created_at'         => 'nullable|date',
            'status'             => 'required',
        ]);
        //         echo '<pre>';
        // print_r($validated);die;
        // Determine the status based on quantity and minimum threshold
        if ($request->quantity == 0) {
            $status = 'unavailable';
        } elseif ($request->quantity < $request->minimum_threshold) {
            $status = 'low_stock';
        } else {
            $status = 'available';
        }

        // Data for the finished good (raw material) update
        $finishedGoodData = [
            'material_code'           => $request->item_code,
            'material_name'           => $request->item_description,
            'hsn_sac_code'            => $request->item_code, // mapping item_code as hsn_sac_code
            'initial_stock_quantity'  => $request->quantity,
            'plant_allocated_quantity'=> $request->quantity,
            'unit_of_measurement'     => $request->unit,
            'date_of_entry'           => Carbon::now(),
            'status'                  => $status,
            'minimum_threshold'       => $request->minimum_threshold,
            'buffer_stock'            => $request->minimum_threshold,
        ];

        // Update the finished good record
        $finishedGood->update($finishedGoodData);

        // Update the associated PlantRawMaterial record if exists
        $plantRawMaterial = PlantRawMaterial::where('raw_material_id', $finishedGood->id)->first();
        if ($plantRawMaterial) {
            $plantFinishedGoodData = [
                'item_code'                => $request->item_code,
                'item_description'         => $request->item_description,
                'hsn_sac_code'             => $request->item_code,
                'quantity'                 => $request->quantity,
                'unit'                     => $request->unit,
                'status'                   => $status,
                'plant_id'                 => $request->plant_id,
                'plant_allocated_quantity' => $request->quantity,
            ];
            $plantRawMaterial->update($plantFinishedGoodData);
        }

        return redirect()->route('plants.rawMaterialsList')
                        ->with('success', 'Finished Good updated successfully.');
    }

    public function createfg()
    {
        $finishedGoods =  FinishedGood::where('status', 'available')->get();
        $plants =  Plant::where('status', 'active')->get(); 
        return inertia('Plants/FinishedGoods/Create',[
            'plants' => $plants,
            'finishedGoods' => $finishedGoods,
        ]);
    }

    public function storefg(Request $request)
    {
        $request->validate([
            'item_code' => 'required|string|unique:plant_finished_goods,item_code',
            'item_description' => 'required',
            'hsn_sac_code' => 'nullable',
            'quantity' => 'required|integer',
            'reorder_level' => 'required|integer',
            'unit' => 'required|in:pieces',
            'status' => 'required',
            'plant_id' => 'required',
        ]);

        if ($request->quantity == 0) {
            $status = 'unavailable';
        } else if ($request->quantity < $request->reorder_level) {
            $status = 'low_stock';
        } else if ($request->quantity > $request->reorder_level) {
            $status = 'available';
        }

        $finishedGoodData = [
            'material_code'         => $request->item_code,
            'material_name'         => $request->item_description,  // assuming you have a material name field coming from the request
            'hsn_sac_code'          => $request->item_code,    // if using material_code as hsn_sac_code
            'initial_stock_quantity'=> $request->quantity,
            'plant_allocated_quantity' => $request->quantity,
            'unit_of_measurement'   => $request->unit,
            'date_of_entry'         => Carbon::now(),
            'status'                => $status,
            'reorder_level'         => $request->reorder_level,
            'buffer_stock'          => $request->reorder_level,
        ];
        
        // Use firstOrCreate to get the record if it exists or create it if not
        $finishedGood = FinishedGood::firstOrCreate(
            ['material_code' => $request->item_code],
            $finishedGoodData
        );
        
            $finished_good_id = $finishedGood->id;

            $plantFinishedGoodData = [
            'item_code'                => $request->item_code,
            'item_description'         => $request->item_description,
            'hsn_sac_code'             => $request->item_code, // if mapping the item code as hsn_sac_code
            'quantity'                 => $request->quantity,
            'unit'                     => $request->unit,
            'status'                   => $status,
            'plant_id'                 => $request->plant_id,
            'reorder_level'            => $request->reorder_level,
            'buffer_stock'            => $request->buffer_stock,
            'finished_good_id'         => $finished_good_id, // from above
            'plant_allocated_quantity' => $request->initial_stock_quantity,
        ];

        // Create the PlantFinishedGood record
        PlantFinishedGood::create($plantFinishedGoodData);
        $this->sendNotification(
            $plantHead->id ?? auth()->id(),
            $superAdmin->id ?? 1,
            'created',
            'created',
            'New Finish Good added successfully. Check RM FG Validation',
            'inventory'
        );
        return redirect()->route('plants.finishedGoodsList')->with('success', 'Finished Good created successfully.');
    }

    public function viewfg($id)
    {
        $finishedGood = PlantFinishedGood::with('plant')->findOrFail($id);



        return Inertia::render('Plants/FinishedGoods/ViewFinishedGood', [
            'finishedGood' => $finishedGood,
        ]);
    }

     /**
     * Private method to send notifications.
     *
     * @param int    $fromId            ID of the user sending the notification.
     * @param int    $toId              ID of the recipient.
     * @param string $type              Notification type.
     * @param string $purpose           Notification purpose.
     * @param string $notification_text Notification message.
     * @param string $notification_url  URL for more details.
     */
    private function sendNotification(
        int $fromId,
        int $toId,
        string $type,
        string $purpose,
        string $notification_text,
        string $notification_url
    ) {
        Notification::create([
            'from_id'           => $fromId ?? auth()->id(),
            'to_id'             => $toId ?? 1,
            'type'              => $type,
            'purpose'           => $purpose,
            'status'            => 'unread',
            'notification_text' => $notification_text,
            'notification_url'  => $notification_url,
        ]);
    }


    
    public function importrmForm()
    {
        return inertia('Plants/RawMaterials/Import');
    }

    // Handle the CSV import
    public function importrm(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt,xlsx,xls|max:2048',
        ]);

        try {
            Excel::import(new PlantRawMaterialsImport, $request->file('csv_file'));
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
                'notification_text' => 'Raw Material Imported successfully.',
                'notification_url'  => 'plants/raw-materials',
            ]);

        } catch (ValidationException $e) {
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
                'notification_text' => 'Raw Material Import was unsuccessfull.',
                'notification_url'  => 'plants/raw-materials',
            ]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        }

        return redirect()->route('plants.rawMaterialsList')
            ->with('success', 'Raw Materials imported successfully.');
    }
    public function importfgForm()
    {
        return inertia('Plants/FinishedGoods/Import');
    }

    // Handle the CSV import
    public function importfg(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt,xlsx,xls|max:2048',
        ]);


        try {
            Excel::import(new PlantFinishedGoodsImport, $request->file('csv_file'));
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
                'notification_text' => 'Finish Goods Imported successfully.',
                'notification_url'  => 'plants/games',
            ]);

        } catch (ValidationException $e) {
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
                'notification_text' => 'Finish Goods Import was unsuccessfull.',
                'notification_url'  => 'plants/games',
            ]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        }

        return redirect()->route('plants.finishedGoodsList')
            ->with('success', 'Raw Materials imported successfully.');
    }
}
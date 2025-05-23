<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RawMaterial;
use App\Models\Notification;
use App\Models\User;
use App\Models\Plant;
use App\Models\VendorOrderedItem;
use App\Models\VendorPurchaseOrder;
use App\Imports\RawMaterialsImport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class RawMaterialsController extends Controller
{
    public function index()
    {
        $rawMaterials = RawMaterial::all();
        $allRawMaterials = RawMaterial::where('status', '!=', 'deleted')->count();
        $lowStockRawMaterials = RawMaterial::whereIn('status', ['unavailable', 'low_stock'])->count();
        $unavailableRawMaterials = RawMaterial::where('status', 'unavailable')->count();

        return Inertia::render('RawMaterials/View', [
            'rawMaterials' => $rawMaterials,
            'statusCounts' => [
            'unavailableRawMaterials' => $unavailableRawMaterials,
            'lowStockRawMaterials' => $lowStockRawMaterials,
            'allRawMaterials' => $allRawMaterials,
        ],
        ]);
    }

    public function create()
    {
        return Inertia::render('RawMaterials/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'material_code' => 'required|string|unique:raw_materials,material_code',
            'material_name' => 'required|string',
            'status' => 'required|string',
            'minimum_threshold' => 'required|integer',
            'buffer_stock' => 'nullable|integer',
            'hsn_sac_code' => 'nullable',
            'initial_stock_quantity' => 'required|integer',
            'unit_of_measurement' => 'required|in:Kgs|string',
            'date_of_entry' => 'nullable|date',
        ]);

        if ($request->initial_stock_quantity == 0) {
            $status = 'unavailable';
        } else if ($request->initial_stock_quantity < $request->minimum_threshold) {
            $status = 'low_stock';
        } else if ($request->initial_stock_quantity > $request->minimum_threshold) {
            $status = 'available';
        } 
        $validated['status'] = $status;
        $validated['plant_allocated_quantity'] = $request->initial_stock_quantity;
        $validated['hsn_sac_code'] = $request->material_code;
        $validated['buffer_stock'] = $request->minimum_threshold;
        $validated['date_of_entry'] = Carbon::now();

        RawMaterial::create($validated);

        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
    
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'created',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'Raw Material added successfully.',
            'notification_url'  => 'raw-materials',
        ]);

        return redirect()->route('raw-materials.index')->with('success', 'Raw Material created successfully.');
    }

    public function edit($id)
    {
        $rawMaterial = RawMaterial::findOrFail($id);

        return Inertia::render('RawMaterials/Edit', [
            'rawMaterial' => $rawMaterial,
        ]);
    }
    public function view($id)
    {
        $rawMaterial = RawMaterial::findOrFail($id);

        return Inertia::render('RawMaterials/ViewRawMaterial', [
            'rawMaterial' => $rawMaterial,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'material_code' => 'required|unique:raw_materials,material_code,' . $id,
            'material_name' => 'required',
            'status' => 'required',
            'minimum_threshold' => 'required',
            'buffer_stock' => 'required',
            'hsn_sac_code' => 'required|unique:raw_materials,hsn_sac_code,' . $id,
            'initial_stock_quantity' => 'required|integer',
            'unit_of_measurement' => 'required|in:Kgs',
            'date_of_entry' => 'required|date',
        ]);
       
        if ($request->initial_stock_quantity == 0) {
            $status = 'unavailable';
        } else if ($request->initial_stock_quantity < $request->minimum_threshold) {
            $status = 'low_stock';
        } else if ($request->initial_stock_quantity > $request->minimum_threshold) {
            $status = 'available';
        } 
        $validated['status'] = $status;
        $rawMaterial = RawMaterial::findOrFail($id);
        $rawMaterial->update($validated);
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
            'notification_text' => 'Raw Material Updated successfully.',
            'notification_url'  => 'raw-materials',
        ]);

        return redirect()->route('raw-materials.index')->with('success', 'Raw Material updated successfully.');
    }

    public function destroy($id)
    {
        $rawMaterial = RawMaterial::findOrFail($id);
        $rawMaterial->delete();
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
    
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'deleted',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'Raw Material Deleted successfully.',
            'notification_url'  => 'raw-materials',
        ]);

        return redirect()->route('raw-materials.index')->with('success', 'Raw Material deleted successfully.');
    }

    public function suspend($id)
    {
        // Find the user by ID or fail if not found
        $rm = RawMaterial::findOrFail($id);

        // Update the user's status to 'inactive'
        $rm->delete();
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
    
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'deleted',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'Raw Material Deleted successfully.',
            'notification_url'  => 'raw-materials',
        ]);
        // Redirect back with a success message
        return redirect()->route('raw-materials.index')->with('success', 'Raw Material suspended successfully.');
    }

    public function importForm()
    {
        return inertia('RawMaterials/Import');
    }

    // Handle the CSV import
    public function import(Request $request)
{
    $request->validate([
        'csv_file' => 'required|file|mimes:csv,txt,xlsx,xls|max:2048',
    ]);

    try {
        Excel::import(new RawMaterialsImport, $request->file('csv_file'));
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
            'notification_url'  => 'raw-materials',
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
            'notification_url'  => 'raw-materials',
        ]);
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput();
    }

    return redirect()->route('raw-materials.index')
        ->with('success', 'Raw Materials imported successfully.');
}

    public function lowStockAlert(Request $request)
    {
        // Retrieve low-stock/unavailable raw materials with the needed fields.
        $materials = RawMaterial::whereIn('status', ['low_stock', 'unavailable'])
            ->get(['material_code', 'hsn_sac_code', 'material_name']);

           
        // Retrieve active vendors (clients) having the Vendor role.
        $vendors = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('status', 'active')->get();

        // Build a list of material codes from the low stock materials.
        $lowStockCodes = $materials->pluck('material_code')->unique()->toArray();
      
        // Build a list of all material codes available across all vendors.
        $allVendorMaterialCodes = [];
        foreach ($vendors as $vendor) {
            $vendorRawMaterials = $vendor->raw_materials ? json_decode($vendor->raw_materials, true) : [];
            foreach ($vendorRawMaterials as $vMaterial) {
                $allVendorMaterialCodes[] = $vMaterial['id'];
            }
        }
        $allVendorMaterialCodes = array_unique($allVendorMaterialCodes);

        // Check for any low stock material that isn't mapped to any vendor.
        $missingMaterials = [];
        foreach ($lowStockCodes as $code) {
            if (!in_array($code, $allVendorMaterialCodes)) {
                $missingMaterials[] = $code;
            }
        }
      
        if (!empty($missingMaterials)) {
            return redirect()->back()->with([
                'error' => 'These material codes are not mapped to any vendor: ' . implode(', ', $missingMaterials)
            ]);
        }
       
        // Group low stock materials per vendor.
        $vendorOrders = [];
        foreach ($vendors as $vendor) {
            $vendorRawMaterials = $vendor->raw_materials ? json_decode($vendor->raw_materials, true) : [];
            // Build a mapping: material id => vendor minimum quantity.
            $vendorMaterialMap = [];
            foreach ($vendorRawMaterials as $vMaterial) {
                $vendorMaterialMap[$vMaterial['id']] = (float)$vMaterial['quantity'];
            }

            $orderedItems = [];
            foreach ($materials as $material) {
                // Check if this vendor supplies the material.
                if (isset($vendorMaterialMap[$material->material_code])) {
                    $minQty = $vendorMaterialMap[$material->material_code];
                    // For low-stock alerts we assume ordering the vendor's minimum order quantity.
                    $finalQty = $minQty;

                    $orderedItems[] = [
                        'item_code'        => $material->material_code,
                        'hsn_sac_code'     => $material->hsn_sac_code,
                        'quantity'         => (int)$finalQty,
                        'unit'             => 'Kgs',  // adjust if needed
                        'item_description' => $material->material_name,
                    ];
                }
            }

            // Only add an order for this vendor if at least one material is supplied.
            if (count($orderedItems)) {
                $vendorOrders[] = [
                    'vendor'        => $vendor,
                    'ordered_items' => $orderedItems
                ];
            }
        }

        // Create a PO for each vendor order group.
        $createdPOs = [];
        foreach ($vendorOrders as $order) {
            // Generate a unique order signature from the ordered items.
            // Sorting items ensures the signature remains consistent.
            $orderedItemsSorted = $order['ordered_items'];
            usort($orderedItemsSorted, function ($a, $b) {
                return strcmp($a['item_code'], $b['item_code']);
            });
            $orderSignature = '';
            foreach ($orderedItemsSorted as $item) {
                $orderSignature .= $item['item_code'] . '-' . $item['quantity'] . ';';
            }
            $orderHash = md5($orderSignature);

            // Check if a PO with the same order hash already exists.
            $existingPO = VendorPurchaseOrder::where('order_hash', $orderHash)
                ->where('order_status', 'pr_requsted')
                ->first();
            if ($existingPO) {
                // Skip creating a duplicate PO.
                continue;
            }

            // Generate a unique PO number (here using time and a random number).
            $poNumber = 'PO' . time() . rand(100, 999);
            $vendor = $order['vendor'];
            $poData = [
                'po_number'              => $poNumber,
                'client_id'              => $vendor->id,                 // using vendor id as client_id
                'plant_id'               => $vendor->plant_assigned,       // adjust as needed
                'order_status'           => 'pr_requsted',
                'po_date'                => now()->toDateString(),         // today's date
                'expected_delivery_date' => now()->toDateString(),         // today's date
                'file_url'               => '/purchase_orders/default.pdf',// default file path
                'order_hash'             => $orderHash,                    // store the order signature to prevent duplicates
            ];

            $purchaseOrder = VendorPurchaseOrder::create($poData);

            foreach ($order['ordered_items'] as $item) {
                VendorOrderedItem::create([
                    'item_code'        => $item['item_code'],
                    'hsn_sac_code'     => $item['hsn_sac_code'] ?? null,
                    'quantity'         => $item['quantity'],
                    'unit'             => $item['unit'],
                    'item_description' => $item['item_description'] ?? null,
                    'po_id'            => $purchaseOrder->id,
                ]);
            }

            $createdPOs[] = $purchaseOrder;
        }

        return redirect()->back()->with('success', 'Vendor PO drafted successfully.');
    }



    
}

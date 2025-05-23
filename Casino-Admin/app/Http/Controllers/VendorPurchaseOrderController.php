<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VendorPurchaseOrder;
use App\Models\VendorOrderedItem;
use App\Models\RawMaterial;
use App\Models\PlantRawMaterial;
use App\Models\FinishedGood;
use App\Models\PlantFinishedGood;
use App\Models\FinishedGoodRawMaterial;
use App\Models\VendorShippingDetail;
use App\Models\Plant;
use App\Models\User;
use App\Models\Notification;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class VendorPurchaseOrderController extends Controller
{
    /**
     * Display a listing of the purchase orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles->pluck('name')->toArray();
        $allowedRoles = ['Super Admin', 'Manager Imports', 'Vendor'];
        $hasAllowed = count(array_intersect($roles, $allowedRoles)) > 0;
        $currentUserId = $user->id;
        $currentUserPlantId = $user->plant_assigned;
        $userRole = $user->roles->first()->name;

        if ($hasAllowed) {
            $purchaseOrders = VendorPurchaseOrder::with(['orderedItems', 'client', 'plant'])->get();
            $allpurchaseOrders = VendorPurchaseOrder::with('orderedItems')->where('order_status', '!=', 'deleted')->count();
            $pendingpurchaseOrders = VendorPurchaseOrder::where('order_status', 'pending')->count();
            $completedpurchaseOrders = VendorPurchaseOrder::where('order_status', 'completed')->count();
        } else {
            $purchaseOrders = VendorPurchaseOrder::with(['orderedItems', 'client', 'plant'])
                ->where('plant_id', $currentUserPlantId)
                ->get();
            $allpurchaseOrders = VendorPurchaseOrder::with('orderedItems')
                ->where('order_status', '!=', 'deleted')
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $pendingpurchaseOrders = VendorPurchaseOrder::where('order_status', 'pending')
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $completedpurchaseOrders = VendorPurchaseOrder::where('order_status', 'completed')
                ->where('plant_id', $currentUserPlantId)
                ->count();
        }

        if ($userRole === 'Vendor') {
            $currentallpurchaseOrders = VendorPurchaseOrder::with('orderedItems')
                ->where('client_id', $currentUserId)
                ->count();
            $currentpendingpurchaseOrders = VendorPurchaseOrder::where('order_status', 'pending')
                ->where('client_id', $currentUserId)
                ->count();
            $currentcompletedpurchaseOrders = VendorPurchaseOrder::where('order_status', 'completed')
                ->where('client_id', $currentUserId)
                ->count();
        } elseif ($hasAllowed) {
            $currentallpurchaseOrders = VendorPurchaseOrder::with('orderedItems')->count();
            $currentpendingpurchaseOrders = VendorPurchaseOrder::where('order_status', 'pending')->count();
            $currentcompletedpurchaseOrders = VendorPurchaseOrder::where('order_status', 'completed')->count();
        } else {
            $currentallpurchaseOrders = VendorPurchaseOrder::with('orderedItems')
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $currentpendingpurchaseOrders = VendorPurchaseOrder::where('order_status', 'pending')
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $currentcompletedpurchaseOrders = VendorPurchaseOrder::where('order_status', 'completed')
                ->where('plant_id', $currentUserPlantId)
                ->count();
        }

        $activeUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('status', 'active')->count();

        return Inertia::render('VendorPurchaseOrders/View', [
            'purchaseOrders' => $purchaseOrders,
            'statusCounts' => [
                'allpurchaseOrders' => $allpurchaseOrders,
                'pendingpurchaseOrders' => $pendingpurchaseOrders,
                'completedpurchaseOrders' => $completedpurchaseOrders,
                'currentallpurchaseOrders' => $currentallpurchaseOrders,
                'currentpendingpurchaseOrders' => $currentpendingpurchaseOrders,
                'currentcompletedpurchaseOrders' => $currentcompletedpurchaseOrders,
            ],
        ]);
    }


    /**
     * Show the form for creating a new purchase order.
     */
    public function create()
    {
        $orderedItems  = VendorOrderedItem::all();
        $allowedRoles = [
            'Plant head', 
            'Store Manager', 
            'Production Manager', 
            'Client', 
            'Vendor', 
            'Security Guard'
        ];
        
        $plantsQuery = Plant::where('status', 'active');
        
        foreach ($allowedRoles as $role) {
            $plantsQuery->whereHas('users.roles', function ($query) use ($role) {
                $query->where('name', $role);
            });
        }
        
        $plants = $plantsQuery->get();
        $finishedGoods = RawMaterial::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();
        $clients       = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('status', 'active')->get();

        // For each vendor, decode their raw_materials JSON and map it to finishedGoods data.
        $clients->each(function ($client) use ($finishedGoods) {
            // Decode vendor's raw_materials or default to an empty array.
            $vendorMaterials = $client->raw_materials ? json_decode($client->raw_materials, true) : [];
            $mappedMaterials = [];
            foreach ($vendorMaterials as $material) {
                // Match vendor material id with finishedGoods material_code.
                $match = $finishedGoods->firstWhere('material_code', $material['id']);
                if ($match) {
                    $mappedMaterials[] = [
                        'material_code'     => $match->material_code,
                        'hsn_sac_code'      => $match->hsn_sac_code,
                        'material_name'     => $match->material_name,
                        'material_quantity' => $material['quantity'], // vendor's minimum order quantity
                    ];
                }
            }
            // Attach the mapped materials to the vendor as vendor_materials.
            $client->vendor_materials = $mappedMaterials;
        });

        return Inertia::render('VendorPurchaseOrders/Create', [
            'orderedItems'  => $orderedItems,
            'clients'       => $clients,
            'plants'        => $plants,
            'finishedGoods' => $finishedGoods,
        ]);
    }


    /**
     * Store a newly created purchase order in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'po_number'          => 'required|string|unique:vendor_purchase_orders',
            'client_id'          => 'required|integer',
            'plant_id'           => 'required|integer',
            'order_status'       => 'required',
            'po_date' => [
                'required',
                'date',
                'after_or_equal:today', // Ensures po_date is today or a future date
            ],
            'expected_delivery_date' => [
                'nullable',
                'date',
                'after_or_equal:today',
            ],
            'file_url'           => 'required',
            'ordered_items'      => 'required|array',
            'ordered_items.*.item_code'         => 'required|string',
            'ordered_items.*.hsn_sac_code'        => 'required|string',
            'ordered_items.*.quantity'            => 'required|integer|min:1',
            'ordered_items.*.unit'                => 'required|string',
            'ordered_items.*.item_description'    => 'required|string',
        ]);

        $filePath = null;
        if ($request->hasFile('file_url')) {
            $filePath = time() . '.' . $request->file_url->extension();
            $request->file_url->move(public_path('purchase_orders'), $filePath);
        }

        // Create the Purchase Order
        $purchaseOrder = VendorPurchaseOrder::create([
            'po_number'             => $request->po_number,
            'client_id'             => $request->client_id,
            'plant_id'              => $request->plant_id,
            'order_status'          => $request->order_status,
            'po_date'               => $request->po_date,
            'expected_delivery_date'=> $request->expected_delivery_date,
            'file_url'              => '/purchase_orders/' . $filePath,
        ]);

        // Insert Ordered Items
        foreach ($request->ordered_items as $item) {
            VendorOrderedItem::create([
                'item_code'        => $item['item_code'],
                'hsn_sac_code'     => $item['hsn_sac_code'] ?? null,
                'quantity'         => $item['quantity'],
                'unit'             => $item['unit'],
                'item_description' => $item['item_description'] ?? null,
                'po_id'            => $purchaseOrder->id,
            ]);
        }

        // Get necessary users for notification
        $purchaseOrder = VendorPurchaseOrder::findOrFail($purchaseOrder->id);
        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $storeManager = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Store Manager');
            })->first();
            $superAdmin = User::whereHas('roles', function ($query) {
                $query->where('name', 'Super Admin');
            })
            ->first();

        // Send notification that a vendor purchase order has been generated.
        $this->sendNotification(
            $storeManager->id ?? auth()->id(),
            $plantHead->id ?? 1,
            'pr_requested',
            'pending',
            'Vendor Purchase Order request raises successfully. PO Number ' . $purchaseOrder->po_number . ' for Plant ' . $purchaseOrder->plant->plant_name . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );
        $this->sendNotification(
            $storeManager->id ?? auth()->id(),
            $superAdmin->id ?? 1,
            'pr_requested',
            'pending',
            'Vendor Purchase Order request raises successfully. PO Number ' . $purchaseOrder->po_number . ' for Plant ' . $purchaseOrder->plant->plant_name . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Purchase Order created successfully.');
    }

    /**
     * Display the specified purchase order.
     */
    public function view($id)
    {
        $purchaseOrder = VendorPurchaseOrder::with(['orderedItems', 'client'])->findOrFail($id);
        $orderedItems = VendorOrderedItem::where('po_id', $id)->get();
        $trackingDetails = VendorShippingDetail::where('po_id', $id)->first();
        $trackingDetailsCount = VendorShippingDetail::where('po_id', $id)->count();
        $plantDetails = Plant::find($purchaseOrder->plant_id);
        $clients = User::whereHas('roles', function ($query) {
            $query->where('name', 'Vendor');
        })->where('status', 'active')->get();

        return Inertia::render('VendorPurchaseOrders/ViewPo', [
            'purchaseOrder' => [
                'id'                    => $purchaseOrder->id,
                'po_number'             => $purchaseOrder->po_number,
                'po_date'               => $purchaseOrder->po_date,
                'expected_delivery_date'=> $purchaseOrder->expected_delivery_date,
                'file_url'              => $purchaseOrder->file_url,
                'client_id'             => $purchaseOrder->client_id,
                'status'                => $purchaseOrder->order_status,
                'invoice_file'          => $purchaseOrder->invoice_file,
                'invoice_uploaded'      => $purchaseOrder->invoice_file ? true : false,
                'shipping_details_uploaded' => $trackingDetailsCount ? true : false,
            ],
            'orderedItems'    => $orderedItems,
            'trackiingdetails'=> $trackingDetails,
            'plantDetails'    => $plantDetails,
            'clients'         => $clients,
        ]);
    }

    /**
     * Show the form for editing the specified purchase order.
     */
    public function edit($id)
{
    $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
    $orderedItems = VendorOrderedItem::where('po_id', $id)->get();
    $finishedGoods = RawMaterial::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();
    $allowedRoles = [
        'Plant head', 
        'Store Manager', 
        'Production Manager', 
        'Client', 
        'Vendor', 
        'Security Guard'
    ];
    
    $plantsQuery = Plant::where('status', 'active');
    
    foreach ($allowedRoles as $role) {
        $plantsQuery->whereHas('users.roles', function ($query) use ($role) {
            $query->where('name', $role);
        });
    }
    
    $plants = $plantsQuery->get();
    $clients = User::whereHas('roles', function ($query) {
        $query->where('name', 'Vendor');
    })->where('status', 'active')->get();

    // Map each vendor's raw materials
    $clients->each(function ($client) use ($finishedGoods) {
        $vendorMaterials = $client->raw_materials ? json_decode($client->raw_materials, true) : [];
        $mappedMaterials = [];
        foreach ($vendorMaterials as $material) {
            $match = $finishedGoods->firstWhere('material_code', $material['id']);
            if ($match) {
                $mappedMaterials[] = [
                    'material_code'     => $match->material_code,
                    'hsn_sac_code'      => $match->hsn_sac_code,
                    'material_name'     => $match->material_name,
                    'material_quantity' => $material['quantity'], // vendor's minimum order quantity
                ];
            }
        }
        $client->vendor_materials = $mappedMaterials;
    });

    return Inertia::render('VendorPurchaseOrders/Edit', [
        'purchaseOrder' => $purchaseOrder,
        'orderedItems'  => $orderedItems,
        'clients'       => $clients,
        'plants'        => $plants,
        'finishedGoods' => $finishedGoods,
    ]);
}


    public function update(Request $request, $id)
    {
        $request->validate([
            'po_number'          => 'required|string|unique:purchase_orders,po_number,' . $id,
            'client_id'          => 'required|integer',
            'plant_id'           => 'required|integer',
            'order_status'       => 'nullable',
            'po_date' => [
                'required',
                'date',
                'after_or_equal:today', // Ensures po_date is today or a future date
            ],
            'expected_delivery_date' => [
                'nullable',
                'date',
                'after_or_equal:today',
            ],
            'file_url'           => 'nullable',
            'ordered_items'      => 'required|array',
            'ordered_items.*.item_code'         => 'required|string',
            'ordered_items.*.hsn_sac_code'        => 'nullable|string',
            'ordered_items.*.quantity'            => 'required|integer|min:1',
            'ordered_items.*.unit'                => 'required|string',
            'ordered_items.*.item_description'    => 'nullable|string',
        ]);

        // Update the Purchase Order
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $status = $request->order_status ? $request->order_status : 'pending';
        $purchaseOrder->update([
            'po_number'             => $request->po_number,
            'client_id'             => $request->client_id,
            'plant_id'              => $request->plant_id,
            'order_status'          => $status,
            'po_date'               => $request->po_date,
            'expected_delivery_date'=> $request->expected_delivery_date,
            'file_url'              => $request->file_url,
        ]);

        // Update or Create Ordered Items and Handle Deletions
        foreach ($request->ordered_items as $item) {
            if (isset($item['_deleted']) && $item['_deleted']) {
                VendorOrderedItem::where('id', $item['id'])->delete();
            } else {
                if (isset($item['id']) && $item['id']) {
                    $orderedItem = VendorOrderedItem::find($item['id']);
                    if ($orderedItem) {
                        $orderedItem->update([
                            'item_code'        => $item['item_code'],
                            'hsn_sac_code'     => $item['hsn_sac_code'] ?? null,
                            'quantity'         => $item['quantity'],
                            'unit'             => $item['unit'],
                            'item_description' => $item['item_description'] ?? null,
                        ]);
                    }
                } else {
                    VendorOrderedItem::create([
                        'po_id'            => $purchaseOrder->id,
                        'item_code'        => $item['item_code'],
                        'hsn_sac_code'     => $item['hsn_sac_code'] ?? null,
                        'quantity'         => $item['quantity'],
                        'unit'             => $item['unit'],
                        'item_description' => $item['item_description'] ?? null,
                    ]);
                }
            }
        }

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Purchase Order updated successfully.');
    }

    /**
     * Remove the specified purchase order from storage.
     */
    public function destroy($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->delete();

        return redirect()->route('purchase_orders.index')
            ->with('success', 'Purchase Order deleted successfully.');
    }

    public function updateStatus($id, Request $request)
    {
        $validated = $request->validate([
            'order_status'  => 'required|in:pending,initiated,completed,cancelled,rejected,on_hold',
            'status_reason' => 'required|string',
        ]);

        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        if ($request->order_status == 'initiated') {
            $orderedItems = VendorOrderedItem::where('po_id', $id)->get();

            foreach ($orderedItems as $orderedItem) {
                $itemCode = $orderedItem->item_code;
                $quantity = $orderedItem->quantity;
                $finishedGood = FinishedGood::where('material_code', $itemCode)->first();

                if ($finishedGood) {
                    if ($finishedGood->initial_stock_quantity < $finishedGood->minimum_threshold) {
                        $finishedGood->status = 'low_stock';
                    }
                    $finishedGood->initial_stock_quantity -= $quantity;
                    $finishedGood->save();
                }
            }

            foreach ($orderedItems as $orderedItem) {
                $itemCode = $orderedItem->item_code;
                $quantity = $orderedItem->quantity;
                $plantFinishedGood = PlantFinishedGood::where('item_code', $itemCode)->first();

                if ($plantFinishedGood) {
                    $plantFinishedGood->quantity -= $quantity;
                    $plantFinishedGood->save();
                }
            }
        }
        $purchaseOrder->update([
            'order_status'  => $request->order_status,
            'status_reason' => $request->status_reason,
        ]);

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Purchase order status updated successfully.');
    }

    public function suspend($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'deleted',
        ]);

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order suspended successfully.');
    }

    public function accept($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'accepted',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $managerImports = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Manager Imports');
            })->first();

        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $plantHead->id ?? 1,
            'accepted',
            'completed',
            'Vendor Purchase Order accepted successfully. PO Number ' . $purchaseOrder->po_number . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order accepted.');
    }

    public function plantheadapproved($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'plant_head_approved',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $superAdmin = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Super Admin');
            })->first();

        $this->sendNotification(
            $plantHead->id ?? auth()->id(),
            $superAdmin->id ?? 1,
            'plant_head_approved',
            'completed',
            'Vendor Purchase Order approved by Plant Head successfully. PO Number ' . $purchaseOrder->po_number . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order approved by Plant Head.');
    }

    public function adminapproved($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'pending',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $managerImports = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Manager Imports');
            })->first();
        $vendor = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Vendor');
            })->first();

        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $vendor->id ?? 1,
            'adminapproved',
            'completed',
            'Vendor Purchase Order approved by Admin successfully. PO Number ' . $purchaseOrder->po_number . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order approved by Admin.');
    }

    public function dispatch($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'dispatched',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $managerImports = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Manager Imports');
            })->first();

        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $plantHead->id ?? 1,
            'dispatched',
            'dispatched',
            'Vendor Purchase Order dispatched successfully. PO Number ' . $purchaseOrder->po_number . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order dispatched successfully.');
    }

    public function received($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'received',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $managerImports = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Manager Imports');
            })->first();

        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $plantHead->id ?? 1,
            'received',
            'completed',
            'Vendor Purchase Order received successfully. PO Number ' . $purchaseOrder->po_number . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order received successfully.');
    }

    public function reject($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'rejected',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $managerImports = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Manager Imports');
            })->first();

        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $plantHead->id ?? 1,
            'rejected',
            'rejected',
            'Vendor Purchase Order rejected successfully. PO Number ' . $purchaseOrder->po_number . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order rejected successfully.');
    }

    public function fulfill($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $orderedItems = VendorOrderedItem::where('po_id', $id)->get();

        foreach ($orderedItems as $material) {
            $rawMaterial = RawMaterial::where('material_code', $material['item_code'])->first();
            if ($rawMaterial) {
                $rawMaterial->initial_stock_quantity += $material['quantity'];
                $rawMaterial->save();

                if ($rawMaterial->initial_stock_quantity > 0 && $rawMaterial->initial_stock_quantity < $rawMaterial->minimum_threshold) {
                    $rawMaterial->status = 'low_stock';
                    $rawMaterial->save();
                }
                if ($rawMaterial->initial_stock_quantity > $rawMaterial->minimum_threshold) {
                    $rawMaterial->status = 'available';
                    $rawMaterial->save();
                }
            }
        }

        // Update PlantRawMaterial
        foreach ($orderedItems as $material) {
            $plantRawMaterial = PlantRawMaterial::where('item_code', $material['item_code'])->first();
            if ($plantRawMaterial) {
                $plantRawMaterial->quantity += $material['quantity'];
                $plantRawMaterial->save();

                if ($plantRawMaterial->quantity > 0) {
                    $plantRawMaterial->status = 'available';
                    $plantRawMaterial->save();
                }
            }
        }

        $purchaseOrder->update([
            'order_status' => 'fulfilled',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();
        $managerImports = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Manager Imports');
            })->first();

        $this->sendNotification(
            $managerImports->id ?? auth()->id(),
            $plantHead->id ?? 1,
            'fulfill',
            'completed',
            'Vendor Purchase Order fulfilled successfully. PO Number ' . $purchaseOrder->po_number . '.',
            'vendor-purchase-orders/' . $purchaseOrder->id . '/view'
        );

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order fulfilled successfully.');
    }

    public function uploadShippingdetails($id)
    {
        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'order_status' => 'deleted',
        ]);

        return redirect()->route('vendor-purchase-orders.index')
            ->with('success', 'Vendor Purchase Order deleted successfully.');
    }

    public function invoicePo(Request $request, $id)
    {
        $request->validate([
            'invoice_file' => 'required|file|mimes:pdf',
        ]);

        $filePath = null;
        if ($request->hasFile('invoice_file')) {
            $file = $request->file('invoice_file');
            $filePath = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('vendor_purchase_orders'), $filePath);
        }

        $purchaseOrder = VendorPurchaseOrder::findOrFail($id);
        $purchaseOrder->update([
            'invoice_file' => '/vendor_purchase_orders/' . $filePath,
        ]);

        return redirect()->back()->with('success', 'Invoice added/updated successfully.');
    }

    public function downloadPo($id)
    {
        $purchaseOrder = VendorPurchaseOrder::with(['client'])->findOrFail($id);
        $orderedItems = VendorOrderedItem::where('po_id', $id)->get();
        $plantDetails = Plant::find($purchaseOrder->plant_id);

        $pdf = Pdf::loadView('pdf.purchase-order', [
            'purchaseOrder' => $purchaseOrder,
            'orderedItems'  => $orderedItems,
            'plantDetails'  => $plantDetails,
        ]);

        return $pdf->download('purchase-order-' . $purchaseOrder->po_number . '.pdf');
    }

    // public function updateStatusNew(Request $request)
    // {
    //     $validated = $request->validate([
    //         'partial_materials'         => 'required|array',
    //         'partial_materials.*.code'  => 'required|string',
    //         'partial_materials.*.value' => 'required|numeric',
    //     ]);
    
    //     // Extract material codes from the validated partial materials.
    //     $codes = collect($validated['partial_materials'])->pluck('code')->toArray();
    
    //     // Retrieve raw materials based on these codes.
    //     $materials = RawMaterial::whereIn('material_code', $codes)
    //         ->get(['material_code', 'hsn_sac_code', 'material_name']);
    
    //     // Also retrieve the other collections as usual.
    //     $orderedItems  = VendorOrderedItem::all();
    //     $plants        = Plant::where('status', 'available')->get();
    //     $finishedGoods = RawMaterial::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();
    //     $clients       = User::whereHas('roles', function ($query) {
    //         $query->where('name', 'Vendor');
    //     })->where('status', 'available')->get();
    
    //     // For each material, first find the vendor's minimum order quantity (client quantity)
    //     // then compute final_quantity based on the validated partial quantity.
    //     $materials->transform(function ($material) use ($validated, $clients) {
    //         // Find vendor's minimum order quantity for this material.
    //         $material->material_quantity = null;
    //         foreach ($clients as $client) {
    //             $vendorMaterials = $client->raw_materials ? json_decode($client->raw_materials, true) : [];
    //             foreach ($vendorMaterials as $vMaterial) {
    //                 if ($vMaterial['id'] === $material->material_code) {
    //                     $material->material_quantity = (float)$vMaterial['quantity'];
    //                     break 2; // Stop once a match is found
    //                 }
    //             }
    //         }
        
    //         // Look for the partial quantity submitted for this material.
    //         $partialQuantity = null;
    //         foreach ($validated['partial_materials'] as $pMat) {
    //             if ($pMat['code'] === $material->material_code) {
    //                 $partialQuantity = (float)$pMat['value'];
    //                 break;
    //             }
    //         }
        
    //         // Compute the final quantity based on vendor minimum and submitted partial quantity.
    //         if (!is_null($partialQuantity) && !is_null($material->material_quantity)) {
    //             $clientQty = $material->material_quantity;
    //             if ($partialQuantity < $clientQty) {
    //                 $material->final_quantity = $clientQty;
    //             } else {
    //                 // Round to nearest multiple of the vendor's minimum order quantity.
    //                 $multiple = round($partialQuantity / $clientQty) * $clientQty;
    //                 $material->final_quantity = $multiple;
    //             }
    //         } else {
    //             $material->final_quantity = null;
    //         }
        
    //         return $material;
    //     });
    
    //     return Inertia::render('RawMaterials/Pogenerate', [
    //         'materials'     => $materials,      // Each material now has: material_code, hsn_sac_code, material_name, and final_quantity
    //         'orderedItems'  => $orderedItems,
    //         'clients'       => $clients,
    //         'plants'        => $plants,
    //         'finishedGoods' => $finishedGoods,
    //     ]);
    // }
    
    public function updateStatusNew(Request $request)
{
    // Validate incoming request data
    $validated = $request->validate([
        'partial_materials'         => 'required|array',
        'partial_materials.*.code'  => 'required|string',
        'partial_materials.*.value' => 'required|numeric',
    ]);
 
    $partialMaterials = $validated['partial_materials'];

    // Retrieve available vendors with the Vendor role
    $vendors = User::whereHas('roles', function ($query) {
        $query->where('name', 'Vendor');
    })->where('status', 'active')->get();

    // Build a list of all material codes available across all vendors.
    $allVendorMaterialCodes = [];
    foreach ($vendors as $vendor) {
        $vendorRawMaterials = $vendor->raw_materials ? json_decode($vendor->raw_materials, true) : [];
        foreach ($vendorRawMaterials as $vMaterial) {
            $allVendorMaterialCodes[] = $vMaterial['id'];
        }
    }
    $allVendorMaterialCodes = array_unique($allVendorMaterialCodes);

    // Check for any partial material that isn't mapped to any vendor.
    $missingMaterials = [];
    foreach ($partialMaterials as $pMat) {
        if (!in_array($pMat['code'], $allVendorMaterialCodes)) {
            $missingMaterials[] = $pMat['code'];
        }
    }

    if (!empty($missingMaterials)) {
        return redirect()->back()->with([
            'success' => 'These material codes are not mapped to any vendor: ' . implode(', ', $missingMaterials)
        ]);
    }

    // If all codes are found, proceed to group partial materials per vendor.
    $vendorOrders = [];

    foreach ($vendors as $vendor) {
        $vendorRawMaterials = $vendor->raw_materials ? json_decode($vendor->raw_materials, true) : [];
        // Build a mapping: material id => vendor minimum quantity
        $vendorMaterialMap = [];
        foreach ($vendorRawMaterials as $vMaterial) {
            $vendorMaterialMap[$vMaterial['id']] = (float)$vMaterial['quantity'];
        }

        $orderedItems = [];
        foreach ($partialMaterials as $pMat) {
            // Check if this vendor supplies the material.
            if (isset($vendorMaterialMap[$pMat['code']])) {
                $minQty = $vendorMaterialMap[$pMat['code']];
                $partialQty = (float)$pMat['value'] / 1000;

             
                // Use minimum if submitted value is less than minimum,
                // else use the smallest multiple of minimum that is at least the submitted value.
                $finalQty = ($partialQty < $minQty)
                    ? $minQty
                    : $minQty * ceil($partialQty / $minQty);
              
                // Retrieve additional material info (hsn_sac_code, material_name) if needed.
                $material = RawMaterial::where('material_code', $pMat['code'])
                    ->first(['material_code', 'hsn_sac_code', 'material_name']);

                if ($material) {
                    $orderedItems[] = [
                        'item_code'        => $material->material_code,
                        'hsn_sac_code'     => $material->hsn_sac_code,
                        'quantity'         => (int)$finalQty,
                        'unit'             => 'kg',
                        'needed_quantity'  => $partialQty,
                        'item_description' => $material->material_name,
                    ];
                }
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
    // Here we force default values: client_id and plant_id are set from the vendor and dates to today.
    $createdPOs = [];
    foreach ($vendorOrders as $order) {
        // Generate a unique order signature from the ordered items.
        // Sort items by item code to ensure consistent order in the signature.
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
            // Optionally, you could skip this vendor order, or add a message indicating duplication.
            continue;
        }

        // Generate a unique PO number (here using time and a random number)
        $poNumber = 'PO' . time() . rand(100, 999);
        $vendor = $order['vendor'];
        $poData = [
            'po_number'              => $poNumber,
            'client_id'              => $vendor->id,        // using vendor id for client_id in this example
            'plant_id'               => $vendor->plant_assigned,  // using vendor's plant_id (adjust as needed)
            'order_status'           => 'pr_requsted',
            'po_date'                => now()->toDateString(), // today’s date
            'expected_delivery_date' => now()->toDateString(), // today’s date
            'file_url'               => '/purchase_orders/default.pdf', // a default file path
            'order_hash'             => $orderHash, // store the order signature to prevent duplicates
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

        // Optionally: Trigger notification(s) as in your original store() method.
    }

    return redirect()->back()->with('success', 'Vendor Po drafted successfully.');
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
}

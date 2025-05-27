<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;

use App\Models\FGProduction;
use App\Models\PurchaseOrder;
use App\Models\OrderedItem;
use App\Models\RawMaterial;
use App\Models\Notification;
use App\Models\AllocatedRm;
use App\Models\FinishedGood;
use App\Models\PlantFinishedGood;
use App\Models\PlantRawMaterial;
use App\Models\FinishedGoodRawMaterial;
use App\Models\ContactSeller;
use App\Models\Plant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Validation\Rule;


class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the purchase orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles->pluck('name')->toArray();
        $allowedRoles = ['Super Admin', 'Manager Imports', 'Client'];
        $hasAllowed = count(array_intersect($roles, $allowedRoles)) > 0;
        $currentUserId = $user->id;
        $currentUserPlantId = $user->plant_assigned;
        $userRole = $user->roles->first()->name;

        if ($hasAllowed) {
            $purchaseOrders = PurchaseOrder::with(['orderedItems', 'client', 'plant'])->get();
            $allpurchaseOrders = PurchaseOrder::with('orderedItems')->where('order_status', '!=', 'deleted')->count();
            $pendingpurchaseOrders = PurchaseOrder::whereIn('order_status', ['in_progress', 'pending'])->count();
            $completedpurchaseOrders = PurchaseOrder::where('order_status', 'completed')->count();
        } else {
            $purchaseOrders = PurchaseOrder::with(['orderedItems', 'client', 'plant'])
                ->where('plant_id', $currentUserPlantId)
                ->get();
            $allpurchaseOrders = PurchaseOrder::with('orderedItems')
                ->where('order_status', '!=', 'deleted')
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $pendingpurchaseOrders = PurchaseOrder::whereIn('order_status', ['in_progress', 'pending'])
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $completedpurchaseOrders = PurchaseOrder::where('order_status', 'completed')
                ->where('plant_id', $currentUserPlantId)
                ->count();
        }

        if ($userRole === 'Client') {
            $currentallpurchaseOrders = PurchaseOrder::with('orderedItems')
                ->where('client_id', $currentUserId)
                ->count();
            $currentpendingpurchaseOrders = PurchaseOrder::whereIn('order_status', ['in_progress', 'pending'])
                ->where('client_id', $currentUserId)
                ->count();
            $currentcompletedpurchaseOrders = PurchaseOrder::where('order_status', 'completed')
                ->where('client_id', $currentUserId)
                ->count();
        } elseif ($hasAllowed) {
            $currentallpurchaseOrders = PurchaseOrder::with('orderedItems')->count();
            $currentpendingpurchaseOrders = PurchaseOrder::whereIn('order_status', ['in_progress', 'pending'])->count();
            $currentcompletedpurchaseOrders = PurchaseOrder::where('order_status', 'completed')->count();
        } else {
            $currentallpurchaseOrders = PurchaseOrder::with('orderedItems')
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $currentpendingpurchaseOrders = PurchaseOrder::whereIn('order_status', ['in_progress', 'pending'])
                ->where('plant_id', $currentUserPlantId)
                ->count();
            $currentcompletedpurchaseOrders = PurchaseOrder::where('order_status', 'completed')
                ->where('plant_id', $currentUserPlantId)
                ->count();
        }

        $activeUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'Client');
        })->where('status', 'active')->count();

        return Inertia::render('PurchaseOrders/View', [
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

    public function completed($id)
    {
        // Find the user by ID or fail if not found
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Update the user's status to 'inactive'
        $purchaseOrder->update([
            'order_status' => 'completed',
        ]);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })
        ->first();
        $managerImports = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Manager Imports');
        })
        ->first();
        Notification::create([
            'from_id'           => $plantHead->id ?? auth()->id(),
            'to_id'             => $plantHead->id ?? 1,
            'type'              => 'completed',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is completed',
            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
        ]);
        // Redirect back with a success message
        return redirect()->route('client-purchase-orders.index')->with('success', 'Client Purchase Order completed successfully.');
    }

    /**
     * Show the form for creating a new purchase order.
     */
    public function create()
    {
        $orderedItems = OrderedItem::all();
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
        
        $inventryFgs = FinishedGoodRawMaterial::pluck('fg_code');
        $finishedGoods = PlantFinishedGood::whereIn('status', ['available', 'low_stock', 'unavailable'])->get();
        
        $finishedGoods = $finishedGoods->filter(function ($item) use ($inventryFgs) {
            return $inventryFgs->contains($item->item_code);
        });
        
        $clients =User::whereHas('roles', function ($query) {
            $query->where('name', 'Client');
        })->where('status', 'active')->get();
        return Inertia::render('PurchaseOrders/Create', [
            'orderedItems' => $orderedItems,
            'clients' => $clients,
            'plants' => $plants,
            'finishedGoods' => $finishedGoods,
        ]);
    }

    /**
     * Store a newly created purchase order in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'po_number' => 'required|string|unique:purchase_orders',
            'client_id' => 'required|integer',
            'plant_id' => 'required|integer',
            'order_status' => 'required',
           'po_date' => [
                'required',
                'date',
                'after_or_equal:today', // Ensures po_date is today or a future date
            ],
            'expected_delivery_date' => [
                'nullable',
                'date',
                function ($attribute, $value, $fail) {
                    $poDate = request('po_date');
                    if ($poDate && \Carbon\Carbon::parse($value)->lt(\Carbon\Carbon::parse($poDate)->addDays(20))) {
                        $fail('The expected delivery date must be at least 20 days after the PO date.');
                    }
                },
            ],

            'file_url' => 'required|mimes:pdf',
            'ordered_items' => 'required|array',
            'ordered_items.*.item_code' => 'required|string',
            'ordered_items.*.hsn_sac_code' => 'required|string',
            'ordered_items.*.quantity' => 'required|integer|min:1',
            'ordered_items.*.unit' => 'required|string',
            'ordered_items.*.item_description' => 'required|string',
        ]);

        $filePath = null;
        if ($request->hasFile('file_url')) {
    
            $filePath = time() . '.' . $request->file_url->extension();
            $request->file_url->move(public_path('purchase_orders'), $filePath);
            
        }
        
        // Create the Purchase Order
        $purchaseOrder = PurchaseOrder::create([
            'po_number' => $request->po_number,
            'client_id' => $request->client_id,
            'plant_id' => $request->plant_id,
            'order_status' => $request->order_status,
            'po_date' => $request->po_date,
            'expected_delivery_date' => $request->expected_delivery_date,
            'file_url' => '/purchase_orders/'.$filePath,
        ]);

        // Insert Ordered Items
        foreach ($request->ordered_items as $item) {
            OrderedItem::create([
                'item_code' => $item['item_code'],
                'hsn_sac_code' => $item['hsn_sac_code'] ?? null,
                'quantity' => $item['quantity'],
                'unit' => $item['unit'],
                'item_description' => $item['item_description'] ?? null,
                'po_id' => $purchaseOrder->id, // Associate with purchase order
            ]);
        }
        
        $purchaseOrder = PurchaseOrder::findOrFail($purchaseOrder->id);

        // $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
        // ->whereHas('roles', function ($query) {
        //     $query->where('name', 'Plant Head');
        // })
        // ->first();
        $plantHead = User::whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })
        ->first();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })
        ->first();
        $managerImports = User::whereHas('roles', function ($query) {
            $query->where('name', 'Manager Imports');
        })
        ->first();

        Notification::create([
            'from_id'           => auth()->id(),
            'to_id'             => $plantHead->id ?? 1,
            'type'              => 'pending',
            'purpose'              => 'pending',
            'status'            => 'unread',
            'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is generated.',
            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
        ]);
        Notification::create([
            'from_id'           => auth()->id(),
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'pending',
            'purpose'              => 'pending',
            'status'            => 'unread',
            'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is generated.',
            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
        ]);

        return redirect()->route('client-purchase-orders.index')->with('success', 'Purchase Order created successfully.');
    }


    /**
     * Display the specified purchase order.
     */
    public function view($id)
    {
       

        $messages = ContactSeller::with(['seller.roles', 'client.roles'])->where('po_id', $id)->get();

        // Find the PurchaseOrder by ID
        $purchaseOrder = PurchaseOrder::with(['orderedItems', 'client'])->findOrFail($id);
    
        // Get ordered items that belong to the specific purchase order
        $orderedItems = OrderedItem::where('po_id', $id)->get();
    
        // Get plant details based on the plant_id in the purchase order
        $plantDetails = Plant::find($purchaseOrder->plant_id);
      
        $clients =User::whereHas('roles', function ($query) {
            $query->where('name', 'Client');
        })->where('status', 'active')->get();
        //   echo '<pre>';
        // print_r($clients);die;
        return Inertia::render('PurchaseOrders/ViewPo', [
            'purchaseOrder' => $purchaseOrder,
            'orderedItems' => $orderedItems,
            'plantDetails' => $plantDetails,
            'messages' => $messages,
            'clients' => $clients,
        ]);
    }

    /**
     * Show the form for editing the specified purchase order.
     */
    public function edit($id)
{
    $purchaseOrder = PurchaseOrder::findOrFail($id);
    $orderedItems = OrderedItem::where('po_id', $id)->get();
    $finishedGoods =  PlantFinishedGood::whereIn('status', ['available', 'low_stock','unavailable'])->get();
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
        $query->where('name', 'Client');
    })->where('status', 'active')->get();
    
    return Inertia::render('PurchaseOrders/Edit', [
        'purchaseOrder' => $purchaseOrder,
        'orderedItems' => $orderedItems,
        'clients' => $clients,
        'plants' => $plants,
        'finishedGoods' => $finishedGoods,
    ]);
}

public function update(Request $request, $id)
{
    $request->validate([
        'po_number' => 'required|string|unique:purchase_orders,po_number,' . $id,
        'client_id' => 'required|integer',
        'plant_id' => 'required|integer',
        'order_status' => 'required',
        'po_date' => [
                'required',
                'date', // Ensures po_date is today or a future date
            ],
            'expected_delivery_date' => [
    'nullable',
    'date',
    function ($attribute, $value, $fail) {
        $poDate = request('po_date');
        if ($poDate && \Carbon\Carbon::parse($value)->lt(\Carbon\Carbon::parse($poDate)->addDays(20))) {
            $fail('The expected delivery date must be at least 20 days after the PO date.');
        }
    },
],

        'file_url' => 'nullable',
        'ordered_items' => 'required|array',
        'ordered_items.*.item_code' => 'required|string',
        'ordered_items.*.hsn_sac_code' => 'nullable|string',
        'ordered_items.*.quantity' => 'required|integer|min:1',
        'ordered_items.*.unit' => 'required|string',
        'ordered_items.*.item_description' => 'nullable|string',
    ]);

    // Update the Purchase Order
    $purchaseOrder = PurchaseOrder::findOrFail($id);
    $purchaseOrder->update([
        'po_number' => $request->po_number,
        'client_id' => $request->client_id,
        'plant_id' => $request->plant_id,
        'order_status' => $request->order_status,
        'po_date' => $request->po_date,
        'expected_delivery_date' => $request->expected_delivery_date,
        'file_url' => $request->file_url,
    ]);

    // Update or Create Ordered Items and Handle Deletions
    foreach ($request->ordered_items as $item) {
        if (isset($item['_deleted']) && $item['_deleted']) {
            // If the item is marked as deleted, delete it from the database
            OrderedItem::where('id', $item['id'])->delete();
        } else {
            // Check if the item has an ID (i.e., is it an existing item or new)
            if (isset($item['id']) && $item['id']) {
                // Existing item - Update it
                $orderedItem = OrderedItem::find($item['id']);
                if ($orderedItem) {
                    $orderedItem->update([
                        'item_code' => $item['item_code'],
                        'hsn_sac_code' => $item['hsn_sac_code'] ?? null,
                        'quantity' => $item['quantity'],
                        'unit' => $item['unit'],
                        'item_description' => $item['item_description'] ?? null,
                    ]);
                }
            } else {
                // New item - Create it
                OrderedItem::create([
                    'po_id' => $purchaseOrder->id,
                    'item_code' => $item['item_code'],
                    'hsn_sac_code' => $item['hsn_sac_code'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'],
                    'item_description' => $item['item_description'] ?? null,
                ]);
            }
        }
    }

    return redirect()->route('client-purchase-orders.index')->with('success', 'Purchase Order updated successfully.');
}





    /**
     * Remove the specified purchase order from storage.
     */
    public function destroy($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
        $purchaseOrder->delete();

        return redirect()->route('purchase_orders.index')->with('success', 'Purchase Order deleted successfully.');
    }

    public function approve($id)
    {
        $purchaseOrder = PurchaseOrder::with(['orderedItems', 'client'])->findOrFail($id);
    
        $orderedItems = OrderedItem::where('po_id', $id)->get();
    
        $plantDetails = Plant::find($purchaseOrder->plant_id);
        $plantfgs = PlantFinishedGood::where('plant_id', $purchaseOrder->plant_id)->get();
        

        $groupedFinishedGoods = FinishedGoodRawMaterial::with(['finishedGood', 'rawMaterial'])->get();
    
      
        $groupedFinishedGoods = $groupedFinishedGoods->groupBy(function ($item) {
            return $item->finishedGood->material_code;  // Group by finished good's material_code
        })->map(function ($items) {
            return $items->reduce(function ($carry, $item) {
                $carry['raw_materials'][] = [
                    'raw_material_code' => $item->rawMaterial->material_code,  // Use material_code for raw material
                    'quantity_required' => $item->fg_gross_wt,
                    'unit' => $item->unit,
                ];
                $carry['total_quantity_required'] = isset($carry['total_quantity_required']) 
                    ? $carry['total_quantity_required'] + $item->fg_gross_wt 
                    : $item->fg_gross_wt;
                return $carry;
            }, ['raw_materials' => [], 'total_quantity_required' => 0]);
        });
// echo '<pre>';
//       print_r($groupedFinishedGoods);die;

        return Inertia::render('PurchaseOrders/ApprovePo', [
            'purchaseOrder' => $purchaseOrder,
            'orderedItems' => $orderedItems,
            'plantDetails' => $plantDetails,
            'plantfgs' => $plantfgs,
            'groupedFinishedGoods' => $groupedFinishedGoods,
        ]);
    }
    public function releaseInit($id, Request $request)
    {
        $validStatuses = [
            'pending_for_approval', 'production_initiated', 'completed', 'cancelled', 'rejected', 'on_hold', 
            'in_progress', 'ready_to_release', 'insufficient_fg', 'insufficient_rm','account_referred',
            'ready_dispatched','dispatched','add_fg','add_rm','added_fg','added_rm'
        ];
        
        $validated = $request->validate([
            'order_status' => ['required|string|', Rule::in($validStatuses)],
            'status_reason' => 'required|string',
        ]);


        $purchaseOrder = PurchaseOrder::findOrFail($id);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })
        ->first();
        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Store Manager');
        })
        ->first();
        $productionManager = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Production Manager');
        })
        ->first();
        if ($request->order_status == 'ready_to_release') {

            Notification::create([
                'from_id'           => $plantHead->id ?? auth()->id(),
                'to_id'             => $storeManageruser->id ?? 1,
                'type'              => 'ready_to_release',
                'status'            => 'unread',
                'purpose'            => 'pending',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is ready to release.',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);

            $purchaseOrder->update([
                'order_status' => $request->order_status,
                'status_reason' => $request->status_reason,
            ]);
    
            return redirect()->route('client-purchase-orders.index')->with('success', 'Purchase order Release initiated successfully.');
        } 

    }
    public function updateStatus($id, Request $request)
    {
        $validStatuses = [
            'pending_for_approval', 'production_initiated', 'completed', 'cancelled', 'rejected', 'on_hold', 
            'in_progress', 'release_initiated', 'insufficient_fg', 'insufficient_rm','account_referred',
            'ready_dispatched','dispatched','add_fg','add_rm','added_fg','added_rm'
        ];
        
        $validated = $request->validate([
            'order_status' => ['required', Rule::in($validStatuses)],
            'status_reason' => 'required|string',
        ]);


        $purchaseOrder = PurchaseOrder::findOrFail($id);
        if ($purchaseOrder->order_status === $validated['order_status']) {
            return redirect()->back()->with('error', 'Status is required.');
        }
        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })
        ->first();
        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Store Manager');
        })->first();
        $superAdmin = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })
        ->first();
        $productionManager = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Production Manager');
        })
        ->first();
        $securityGuard = User::where('plant_assigned', $purchaseOrder->plant_id)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Security Guard');
        })
        ->first();
        if ($request->order_status == 'in_progress') {
            $orderedItems = OrderedItem::where('po_id', $id)
            ->whereNotIn('status', ['in_progress','account_referred', 'ready_dispatched', 'dispatched', 'completed'])
            ->get();

        //     echo '<pre>';
        // print_r($orderedItems);die;

        

            $groupedFinishedGoods = FinishedGoodRawMaterial::with(['finishedGood', 'rawMaterial'])->get();
        
            // Group by finished_good_id (but now we use material_code) and sum the quantity_required for each group
            $groupedFinishedGoods = $groupedFinishedGoods->groupBy(function ($item) {
                return $item->finishedGood->material_code;  // Group by finished good's material_code
            })->map(function ($items) {
                return $items->reduce(function ($carry, $item) {
                    $carry['raw_materials'][] = [
                        'raw_material_code' => $item->rawMaterial->material_code,  // Use material_code for raw material
                        'quantity_required' => $item->quantity_required,
                        'unit' => $item->unit,
                    ];
                    $carry['total_quantity_required'] = isset($carry['total_quantity_required']) 
                        ? $carry['total_quantity_required'] + $item->quantity_required 
                        : $item->quantity_required;
                    return $carry;
                }, ['raw_materials' => [], 'total_quantity_required' => 0]);
            });

            foreach ($orderedItems as $orderedItem) {
                $itemCode = $orderedItem->item_code;
                $quantity = $orderedItem->quantity;

                $finishedGood = FinishedGood::where('material_code', $itemCode)
                                            ->first();

                
                if ($finishedGood) {
                    
                        $finishedGood->initial_stock_quantity -= $quantity;
                        $finishedGood->save();
                    
                
                }
                if ($finishedGood->initial_stock_quantity <= $finishedGood->reorder_level) {
                    $finishedGood->status = 'low_stock';
                    $finishedGood->save();
    
                    Notification::create([
                        'from_id'           => $plantHead->id ?? auth()->id(),
                        'to_id'             => $storeManageruser->id ?? 1,
                        'type'              => 'low_stock',
                        'purpose'           => 'low_stock',
                        'status'            => 'unread',
                        'notification_text' => $finishedGood->material_code . ' ' . $finishedGood->material_name . ' is on low stock',
                        'notification_url'  => 'finished-goods/' . $finishedGood->id . '/approve',
                    ]);
                }
            
        
                if ($finishedGood->initial_stock_quantity == 0) {
                    $finishedGood->status = 'unavailable';
                    $finishedGood->save();

                    Notification::create([
                        'from_id'           => $plantHead->id ?? auth()->id(),
                        'to_id'             => $storeManageruser->id ?? 1,
                        'type'              => 'unavailable',
                        'purpose'              => 'low_stock',
                        'status'            => 'unread',
                        'notification_text' => $finishedGood->material_code . ' ' . $finishedGood->material_name . ' is Unavailable',
                        'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                    ]);
                }
                
        
            }

            foreach ($orderedItems as $orderedItem) {
                $itemCode = $orderedItem->item_code;
                $quantity = $orderedItem->quantity;

                $plantfinishedGood = PlantFinishedGood::where('item_code', $itemCode)
                                            ->first();
                $plant = Plant::where('id', $plantfinishedGood->plant_id)
                                            ->first();

                $plant_finished_goods = json_decode($plant->finished_goods);
                $plantfinishedGood = PlantFinishedGood::where('item_code', $itemCode)->first();
                $plant = Plant::where('id', $plantfinishedGood->plant_id)->first();

                $plant_finished_goods = json_decode($plant->finished_goods);

                // Loop through each finished good in the array
                foreach ($plant_finished_goods as $finishedGood) {
                
                    if ($finishedGood->id == $plantfinishedGood->finished_good_id) {

                        $finishedGood->quantity -= $quantity; 

                        break;
                    }
                }

                // Encode the array back into JSON and update the plant record
                $plant->finished_goods = json_encode($plant_finished_goods);
                $plant->save();


                if ($plantfinishedGood) {
                    if ($orderedItem->unit == 'Kgs') {
                        $plantfinishedGood->quantity -= $quantity;
                        $plantfinishedGood->save();

                        if ($plantfinishedGood->quantity == 0) {
                            $plantfinishedGood->status = 'unavailable';
                            $plantfinishedGood->save();
        
                            
                            Notification::create([
                                'from_id'           => $plantHead->id ?? auth()->id(),
                                'to_id'             => $storeManageruser->id ?? 1,
                                'type'              => 'unavailable',
                                'purpose'              => 'low_stock',
                                'status'            => 'unread',
                                'notification_text' => $plantfinishedGood->item_code . ' ' . $plantfinishedGood->item_description . ' is Unavailable in Plant '.$plantfinishedGood->plant_id,
                                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                            ]);
                        }
                    } else {
                        if (isset($groupedFinishedGoods[$itemCode])) {
                            $increment = ($quantity * $groupedFinishedGoods[$itemCode]['total_quantity_required']) ;
                            $increment = ( $increment / 1000 );
                        } 
                    
                        $plantfinishedGood->quantity -= $quantity;
                        $plantfinishedGood->save();
                    }

            
                    if ($plantfinishedGood->quantity == 0) {
                        $plantfinishedGood->status = 'unavailable';
                        $plantfinishedGood->save();

                        
                        Notification::create([
                            'from_id'           => $plantHead->id ?? auth()->id(),
                            'to_id'             => $storeManageruser->id ?? 1,
                            'type'              => 'unavailable',
                            'purpose'              => 'low_stock',
                            'status'            => 'unread',
                            'notification_text' => $plantfinishedGood->item_code . ' ' . $plantfinishedGood->item_description . ' is Unavailable in Plant '.$plantfinishedGood->plant_id,
                            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                        ]);
                    }
                }
                Notification::create([
                    'from_id'           => $storeManageruser->id ?? auth()->id(),
                    'to_id'             => $plantHead->id ?? 1,
                    'type'              => 'fg_issued',
                    'purpose'              => 'move_forward',
                    'status'            => 'unread',
                    'notification_text' => 'FG is issued for Purchase Order with PO Number '.$purchaseOrder->po_number ,
                    'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                ]);
                Notification::create([
                    'from_id'           => $storeManageruser->id ?? auth()->id(),
                    'to_id'             => $superAdmin->id ?? 1,
                    'type'              => 'fg_issued',
                    'purpose'              => 'move_forward',
                    'status'            => 'unread',
                    'notification_text' => 'FG is issued for Purchase Order with PO Number '.$purchaseOrder->po_number ,
                    'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                ]);
            }
           
        } else  if ($request->order_status == 'release_initiated') {

            Notification::create([
                'from_id'           => $plantHead->id ?? auth()->id(),
                'to_id'             => $storeManageruser->id ?? 1,
                'type'              => 'release_initiated',
                'status'            => 'unread',
                'purpose'            => 'pending',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is ready to release.',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        } 
        else if($request->order_status == 'account_referred'){
            Notification::create([
                'from_id'           => $plantHead->id ?? auth()->id(),
                'to_id'             => $plantHead->id ?? 1,
                'type'              => 'account_referred',
                'status'            => 'unread',
                'purpose'            => 'pending',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' need to generate and upload invoice.',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        }
        else if($request->order_status == 'ready_dispatched'){
            Notification::create([
                'from_id'           => $plantHead->id ?? auth()->id(),
                'to_id'             => $securityGuard->id ?? 1,
                'type'              => 'ready_dispatched',
                'status'            => 'unread',
                'purpose'            => 'move_forward',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is ready to dispatched',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        }
        else if($request->order_status == 'dispatched'){
            Notification::create([
                'from_id'           => $plantHead->id ?? auth()->id(),
                'to_id'             => $plantHead->id ?? 1,
                'type'              => 'dispatched',
                'purpose'              => 'dispatched',
                'status'            => 'unread',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is dispatched',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        }
        else if($request->order_status == 'completed'){
            Notification::create([
                'from_id'           => $plantHead->id ?? auth()->id(),
                'to_id'             => $plantHead->id ?? 1,
                'type'              => 'completed',
                'purpose'              => 'completed',
                'status'            => 'unread',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' is completed',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        }
        else if($request->order_status == 'insufficient_fg'){
            Notification::create([
                'from_id'           => $storeManageruser->id ?? auth()->id(),
                'to_id'             => $plantHead->id ?? 1,
                'type'              => 'insufficient_fg',
                'purpose'              => 'low_stock',
                'status'            => 'unread',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' has insuffient FG.',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        }
        else if($request->order_status == 'add_fg'){
            Notification::create([
                'from_id'           => $plantHead->id ?? auth()->id(),
                'to_id'             => $productionManager->id ?? 1,
                'type'              => 'add_fg',
                'type'              => 'low_stock',
                'status'            => 'unread',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' need to Issue Fg',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        }
        else if($request->order_status == 'add_rm'){
            Notification::create([
                'from_id'           => $productionManager->id ?? auth()->id(),
                'to_id'             => $plantHead->id ?? 1,
                'type'              => 'add_rm',
                'purpose'              => 'low_stock',
                'status'            => 'unread',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' need to Issue RM',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
            Notification::create([
                'from_id'           => $productionManager->id ?? auth()->id(),
                'to_id'             => $storeManageruser->id ?? 1,
                'type'              => 'add_rm',
                'purpose'              => 'low_stock',
                'status'            => 'unread',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' need to Issue RM',
                'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
            ]);
        }

        $purchaseOrder->update([
            'order_status' => $request->order_status,
            'status_reason' => $request->status_reason,
        ]);

        $orderedItems = OrderedItem::where('po_id', $id)->get();
        $protectedStatuses = ['in_progress', 'account_referred', 'ready_dispatched', 'dispatched'];

        // Check if all items have the same status
        $firstStatus = $orderedItems->first()->status;
        $allSameStatus = $orderedItems->every(function ($item) use ($firstStatus) {
            return $item->status === $firstStatus;
        });

        if ($allSameStatus) {
            // Update all if their status is the same
            foreach ($orderedItems as $orderedItem) {
                $orderedItem->status = $request->order_status;
                $orderedItem->save();
            }
        } else {
            // Otherwise, skip protected statuses
            foreach ($orderedItems as $orderedItem) {
                if (!in_array($orderedItem->status, $protectedStatuses)) {
                    $orderedItem->status = $request->order_status;
                    $orderedItem->save();
                }
            }
        }

        

        return redirect()->route('client-purchase-orders.index')->with('success', 'Purchase order status updated successfully.');
    }
    public function initiateProd($id, Request $request)
    {
        // Validate the incoming request.
        $validatedData = $request->validate([
            'materials' => 'required|array',
            'materials.*.code' => 'required|string|exists:raw_materials,material_code',
            'materials.*.value' => 'required|numeric|min:0',
            'finished_goods' => 'required|array',
            'finished_goods.*.code' => 'required|string|exists:finished_goods,material_code',
            'finished_goods.*.value' => 'required|numeric|min:0',
        ]);

        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Retrieve the plant head and store manager for notifications.
        $plantHead = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();

        $productionManager = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Production Manager');
            })->first();
        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant_id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })->first();

        // First pass: Check for any shortfalls without modifying any quantities.
        $insufficientMaterials = [];

        // Check plant raw materials (PlantRawMaterial) stock.
        foreach ($request->materials as $material) {
            $plantMaterial = PlantRawMaterial::where('item_code', $material['code'])->first();
            if ($plantMaterial) {
                // Assume the material value is in grams and we convert to Kgs.
                $requiredQuantity = (int)$material['value'] / 1000;
                $availableQuantity = $plantMaterial->quantity;
                $shortage = max(0, $requiredQuantity - $availableQuantity);

                if ($shortage > 0) {
                    $insufficientMaterials[] = [
                        'code'      => $material['code'],
                        'shortfall' => $shortage,
                        'source'    => 'Plant', // Indicates shortage from plant raw materials
                        'unit'      => 'Kgs',    // Unit of measure
                    ];
                }
            }
        }

        // If any shortages were found, return without modifying any quantities.
        if (!empty($insufficientMaterials)) {
            return back()->withErrors([
                'insufficient_materials' => json_encode($insufficientMaterials),
            ]);
        }

        // Second pass: Since all stocks are sufficient, perform updates inside a DB transaction.
        DB::transaction(function () use ($request, $id, $purchaseOrder, $plantHead, $storeManageruser) {
            // 1. Update FinishedGoodRawMaterial (RawMaterial) quantities.
            foreach ($request->materials as $material) {
                $rawMaterial = RawMaterial::where('material_code', $material['code'])->first();
                if ($rawMaterial) {
                    $requiredQuantity = (int)$material['value'] / 1000;
                    // Deduct required quantity plus an extra unit as per your logic.
                    $rawMaterial->initial_stock_quantity -= ($requiredQuantity);
                    $rawMaterial->save();

                    // Update status based on new stock levels.
                    if ($rawMaterial->initial_stock_quantity <= 0) {
                        $rawMaterial->status = 'unavailable';

                        Notification::create([
                            'from_id'           => $storeManageruser->id ?? auth()->id(),
                            'to_id'             => $plantHead->id ?? 1,
                            'type'              => 'add_rm',
                            'status'            => 'unread',
                            'purpose'           => 'low_stock',
                            'notification_text' => 'Purchase Order with PO Number ' . $purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' needs to issue RM',
                            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                        ]);
                    } else if ($rawMaterial->initial_stock_quantity < $rawMaterial->minimum_threshold) {
                        $rawMaterial->status = 'low_stock';

                        Notification::create([
                            'from_id'           => $storeManageruser->id ?? auth()->id(),
                            'to_id'             => $plantHead->id ?? 1,
                            'type'              => 'add_rm',
                            'status'            => 'unread',
                            'purpose'           => 'low_stock',
                            'notification_text' => 'Purchase Order with PO Number ' . $purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' needs to issue RM',
                            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                        ]);
                    }
                    $rawMaterial->save();
                    $rawMaterial = RawMaterial::where('material_code', $material['code'])->first();
                    // Insert a record into allocated_rm table for Plant -rawmaterial.
                   
                }
            }

            // 2. Update plant raw materials (PlantRawMaterial) quantities.
            foreach ($request->materials as $material) {
                $plantMaterial = PlantRawMaterial::where('item_code', $material['code'])->first();
                if ($plantMaterial) {
                    $requiredQuantity = (int)$material['value'] / 1000;
                    $plantMaterial->quantity -= ($requiredQuantity);
                    $plantMaterial->save();

                    if ($plantMaterial->quantity < $plantMaterial->minimum_threshold) {
                        $plantMaterial->status = 'low_stock';
                        $plantMaterial->save();
                    } else if ($plantMaterial->quantity == 0) {
                        $plantMaterial->status = 'unavailable';
                        $plantMaterial->save();
                    }
                }
                $plantMaterial = PlantRawMaterial::where('item_code', $material['code'])->first();
                AllocatedRm::create([
                    'po_id'              => $id,
                    'rm_code'            => $material['code'],
                    'allocated_quantity' => $requiredQuantity,
                    'reaining_quantity'  => $plantMaterial->quantity,
                ]);
            }

            // 3. Process finished goods and insert new FGProduction records.
            foreach ($request->finished_goods as $finished_good) {
                $finishedGood = FinishedGood::where('material_code', $finished_good['code'])->first();
                if ($finishedGood) {
                    // Retrieve order items associated with this finished good.
                    // Assuming a field named 'item_code' in OrderedItem that stores the finished good's material code.
                    $orderItems = OrderedItem::where('item_code', $finishedGood->material_code)->get();
    
                    // Filter out items with status 'in_progress'
                    $orderItemsToProcess = $orderItems->reject(function ($orderItem) {
                        return $orderItem->status === 'in_progress';
                    });
    
                    // Only proceed if there are order items to process.
                    if ($orderItemsToProcess->isNotEmpty()) {
                        FGProduction::create([
                            'po_id'                       => $id,
                            'item_code'                   => $finishedGood->material_code,
                            'hsn_sac_code'                => $finishedGood->hsn_sac_code,
                            'quantity'                    => $finished_good['value'],
                            'unit'                        => 'pieces',
                            'item_description'            => $finishedGood->material_name,
                            'expected_prod_complete_date' => now()->addDays(7),
                            'status'                      => 'pending',
                        ]);
    
                        Notification::create([
                            'from_id'           => $productionManager->id ?? auth()->id(),
                            'to_id'             => $plantHead->id ?? 1,
                            'type'              => 'add_rm',
                            'status'            => 'unread',
                            'purpose'           => 'low_stock',
                            'notification_text' => 'Purchase Order with PO Number ' . $purchaseOrder->po_number . ' for Plant - ' . $purchaseOrder->plant->plant_name . ' Production is Initiated',
                            'notification_url'  => 'ongoing-production',
                        ]);
                    }
                }
            }

            // 4. Update the purchase order status.
            $purchaseOrder->update([
                'order_status' => 'production_initiated',
            ]);
        });

        return redirect()->route('client-purchase-orders.index')
                ->with('success', 'Purchase order status updated successfully.');
    }



public function suspend($id)
{
    // Find the user by ID or fail if not found
    $purchaseOrder = PurchaseOrder::findOrFail($id);

    // Update the user's status to 'inactive'
    $purchaseOrder->update([
        'order_status' => 'deleted',
    ]);

    // Redirect back with a success message
    return redirect()->route('client-purchase-orders.index')->with('success', 'Purchase Order deleted successfully.');
}
public function download($id)
    {

        // Retrieve purchase order data (similar to your view method)
        $purchaseOrder = PurchaseOrder::with(['client'])->findOrFail($id);
        $orderedItems = OrderedItem::where('po_id', $id)->get();
        $plantDetails = Plant::find($purchaseOrder->plant_id);

        // Load the Blade view and pass the data
        $pdf = Pdf::loadView('pdf.purchase-order', [
            'purchaseOrder' => $purchaseOrder,
            'orderedItems'   => $orderedItems,
            'plantDetails'   => $plantDetails,
        ]);

        // Optionally, you can set paper size and orientation:
        // $pdf->setPaper('A4', 'portrait');

        // Download the generated PDF file with a custom filename
        return $pdf->download('purchase-order-' . $purchaseOrder->po_number . '.pdf');
    }

public function downloadInvoice($id)
{
// Group finished good raw materials to calculate the per unit cost for each finished good.
$groupedFinishedGoods = FinishedGoodRawMaterial::with(['finishedGood', 'rawMaterial'])->get();
    
// Group by finished good's material_code and sum the quantity_required and calculate total cost for 1 unit.
$groupedFinishedGoods = $groupedFinishedGoods->groupBy(function ($item) {
    return $item->finishedGood->material_code;  // Group by finished good's material_code
})->map(function ($items) {
    return $items->reduce(function ($carry, $item) {
        // Push raw material details into an array
        $carry['raw_materials'][] = [
            'raw_material_code'  => $item->rawMaterial->material_code,
            'quantity_required'  => $item->quantity_required,
            'unit'               => $item->unit,
            'price'              => $item->price,
        ];
        // Sum up the total quantity required (for reference if needed)
        $carry['total_quantity_required'] = (isset($carry['total_quantity_required']) 
            ? $carry['total_quantity_required'] 
            : 0) + $item->quantity_required;
        // Calculate total cost for one unit by multiplying quantity_required with price for each raw material
        $carry['total_price'] = (isset($carry['total_price']) 
            ? $carry['total_price'] 
            : 0) + ($item->price);
        
        return $carry;
    }, ['raw_materials' => [], 'total_quantity_required' => 0, 'total_price' => 0]);
});

// Retrieve purchase order data
$purchaseOrder = PurchaseOrder::with(['client'])->findOrFail($id);
$orderedItems = OrderedItem::where('po_id', $id)->get();
$plantDetails = Plant::find($purchaseOrder->plant_id);

// Load the Blade view and pass all the needed data, including the grouped finished goods.
$pdf = Pdf::loadView('pdf.purchase-order-invoice', [
    'purchaseOrder'         => $purchaseOrder,
    'orderedItems'          => $orderedItems,
    'plantDetails'          => $plantDetails,
    'groupedFinishedGoods'  => $groupedFinishedGoods,
]);

// Optionally set the paper size and orientation
// $pdf->setPaper('A4', 'portrait');

// Return the generated PDF for download with a custom filename.
return $pdf->download('purchase-order-' . $purchaseOrder->po_number . '.pdf');
}


}

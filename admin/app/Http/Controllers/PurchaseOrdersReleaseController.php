<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\FGProduction;
use App\Models\PurchaseOrder;
use App\Models\OrderedItem;
use App\Models\RawMaterial;
use App\Models\Notification;
use App\Models\FinishedGood;
use App\Models\PlantFinishedGood;
use App\Models\PlantRawMaterial;
use App\Models\FinishedGoodRawMaterial;
use App\Models\ContactSeller;
use App\Models\Plant;
use App\Models\AllocatedRm;
use App\Models\User;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Validation\Rule;


class PurchaseOrdersReleaseController extends Controller
{
    public function issueFg($id, Request $request)
    {
       
        $validStatuses = [
            'pending_for_approval', 'initiated', 'completed', 'cancelled', 'rejected', 'on_hold', 
            'in_progress', 'ready_to_release', 'insufficient_fg', 'insufficient_rm','account_referred',
            'ready_dispatched','dispatched','add_fg','add_rm','added_fg','added_rm'
        ];
        
        $validated = $request->validate([
            'item_ids' => 'required|array',
        ]);

        $orderedItems = OrderedItem::whereIn('id', $validated['item_ids'])->get();   
        foreach ($orderedItems as $orderedItem) {
            if ($orderedItem->status == 'in_progress') {
                $orderedItem->status = 'account_referred';
                $orderedItem->save();
                return redirect()->route('client-purchase-orders.index')
                ->with('success', 'Purchase order status updated successfully.');
            } elseif ($orderedItem->status == 'account_referred') {
                $orderedItem->status = 'ready_dispatched';
                $orderedItem->save();
                return redirect()->route('client-purchase-orders.index')
                ->with('success', 'Purchase order status updated successfully.');
            } elseif ($orderedItem->status == 'ready_dispatched') {
                $orderedItem->status = 'dispatched';
                $orderedItem->save();
                return redirect()->route('client-purchase-orders.index')
                ->with('success', 'Purchase order status updated successfully.');
            } elseif ($orderedItem->status == 'dispatched') {
                $orderedItem->status = 'completed';
                $orderedItem->save();
                return redirect()->route('client-purchase-orders.index')
                ->with('success', 'Purchase order status updated successfully.');
            }
           
            
        }
        


        $purchaseOrder = PurchaseOrder::findOrFail($id);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })
        ->first();

        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Store Manager');
        })
        ->first();

        $productionManager = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Production Manager');
        })
        ->first();

        
        $orderedItems = OrderedItem::whereIn('id', $validated['item_ids'])->get();


     
        

        

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
                        'from_id'           => $plantHead->id ?? 1,
                        'to_id'             => $storeManageruser->id ?? auth()->id(),
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
                        'from_id'           => $plantHead->id ?? 1,
                        'to_id'             => $storeManageruser->id ?? auth()->id(),
                        'type'              => 'unavailable',
                        'purpose'              => 'low_stock',
                        'status'            => 'unread',
                        'notification_text' => $finishedGood->material_code . ' ' . $finishedGood->material_name . ' is Unavailable',
                        'notification_url'  => 'finished-goods/' . $finishedGood->id . '/approve',
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
                                'from_id'           => $plantHead->id ?? 1,
                                'to_id'             => $storeManageruser->id ?? auth()->id(),
                                'type'              => 'unavailable',
                                'purpose'              => 'low_stock',
                                'status'            => 'unread',
                                'notification_text' => $plantfinishedGood->item_code . ' ' . $plantfinishedGood->item_description . ' is Unavailable in Plant '.$plantfinishedGood->plant_id,
                                'notification_url'  => 'plants/' . $plantfinishedGood->plant_id . '/approve',
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
                            'from_id'           => $plantHead->id ?? 1,
                            'to_id'             => $storeManageruser->id ?? auth()->id(),
                            'type'              => 'unavailable',
                            'purpose'              => 'low_stock',
                            'status'            => 'unread',
                            'notification_text' => $plantfinishedGood->item_code . ' ' . $plantfinishedGood->item_description . ' is Unavailable in Plant '.$plantfinishedGood->plant_id,
                            'notification_url'  => 'plants/' . $plantfinishedGood->plant_id . '/approve',
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
            }
        

        // $purchaseOrder->update([
        //     'order_status' => 'in_progress',
        //     'status_reason' => 'Fg available and issused',
        // ]);

        

        
        foreach ($orderedItems as $orderedItem) {
            $orderedItem->status = 'in_progress';
            $orderedItem->save();
        }
        return redirect()->route('client-purchase-orders.index')
        ->with('success', 'Purchase order status updated successfully.');
    }
    public function insufficientFg($id, Request $request)
    {
        
        $validStatuses = [
            'pending_for_approval', 'initiated', 'completed', 'cancelled', 'rejected', 'on_hold', 
            'in_progress', 'ready_to_release', 'insufficient_fg', 'insufficient_rm','account_referred',
            'ready_dispatched','dispatched','add_fg','add_rm','added_fg','added_rm'
        ];
        
        $validated = $request->validate([
            'rm_item_ids' => 'required|array',
            'order_status' => 'required',
            'status_reason' => 'required',
        ]);
        // print_r($validated);die;


        $purchaseOrder = PurchaseOrder::findOrFail($id);

        $plantHead = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Plant Head');
        })
        ->first();
        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Store Manager');
        })
        ->first();
        $productionManager = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
        ->whereHas('roles', function ($query) {
            $query->where('name', 'Production Manager');
        })
        ->first();
      
        $orderedItems = OrderedItem::whereIn('id', $validated['rm_item_ids'])->get();

        if($request->order_status == 'insufficient_fg'){
            Notification::create([
                'from_id'           => $storeManageruser->id ?? auth()->id(),
                'to_id'             => $plantHead->id ?? 1,
                'type'              => 'insufficient_fg',
                'purpose'              => 'low_stock',
                'status'            => 'unread',
                'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant ' . $purchaseOrder->plant->plant_name . ' has insuffient FG.',
                'notification_url'  => 'plants/games',
            ]);
        }

        $purchaseOrder->update([
            'order_status' => $request->order_status,
            'status_reason' => $request->status_reason,
        ]);



        
        if ($orderedItems->every(function ($item) {
            return $item->status === 'in_progress';
        })) {
            // If every item is in progress, update them all
            foreach ($orderedItems as $orderedItem) {
                $orderedItem->status = $request->order_status;
                $orderedItem->save();
            }
        } else {
            // Otherwise, only update the items that are not 'in_progress'
            foreach ($orderedItems as $orderedItem) {
                if ($orderedItem->status !== 'in_progress') {
                    $orderedItem->status = $request->order_status;
                    $orderedItem->save();
                }
            }
        }
        return redirect()->route('client-purchase-orders.index')
        ->with('success', 'Purchase order status updated successfully.');

    }


    public function initiateProd($id, Request $request)
    {
        // Validate the incoming request.
        $validatedData = $request->validate([
            'partial_materials' => 'required|array',
            'partial_materials.*.code' => 'required|string|exists:raw_materials,material_code',
            'partial_materials.*.value' => 'required|numeric|min:0',
            'partial_finished_goods' => 'required|array',
            'partial_finished_goods.*.code' => 'required|string|exists:finished_goods,material_code',
            'partial_finished_goods.*.value' => 'required|numeric|min:0',
        ]);
   
        $purchaseOrder = PurchaseOrder::findOrFail($id);
    
        $plantHead = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })
            ->first();
        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Plant Head');
            })
            ->first();
    
        // First pass: Check for any shortfalls without modifying the database.
        $partialinsufficient_materials = [];
    
        // Check plant raw materials (PlantRawMaterial) stock.
        foreach ($validatedData['partial_materials'] as $material) {
            $plantMaterial = PlantRawMaterial::where('item_code', $material['code'])->first();
            if ($plantMaterial) {
                $requiredQuantity = (int)$material['value'] / 1000;
                $availableQuantity = $plantMaterial->quantity;
                $shortage = max(0, $requiredQuantity - $availableQuantity);
    
                if ($shortage > 0) {
                    $partialinsufficient_materials[] = [
                        'code'      => $material['code'],
                        'shortfall' => $shortage,
                        'source'    => 'Plant',
                        'unit'      => 'Kgs',
                    ];
                }
            }
        }
       
        // If any shortages were found, return without modifying any quantities.
        if (!empty($partialinsufficient_materials)) {
            return back()->withErrors([
                'partialinsufficient_materials' => json_encode($partialinsufficient_materials),
            ]);
        }
    
        // Second pass: Since all stocks are sufficient, perform updates inside a DB transaction.
        DB::transaction(function () use ($validatedData, $id) {
            // Update inventory (RawMaterial) quantities.
            foreach ($validatedData['partial_materials'] as $material) {
                $rawMaterial = RawMaterial::where('material_code', $material['code'])->first();
                if ($rawMaterial) {
                    $requiredQuantity = (int)$material['value'] / 1000;
                    // Deduct the required quantity plus an extra unit (as per your logic)
                    $rawMaterial->initial_stock_quantity -= ($requiredQuantity);
                    $rawMaterial->save();
    
                    // Update status based on new stock levels.
                    if ($rawMaterial->initial_stock_quantity <= 0) {
                        $rawMaterial->status = 'unavailable';
                        $purchaseOrder = PurchaseOrder::findOrFail($id);
    
                        $plantHead = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
                            ->whereHas('roles', function ($query) {
                                $query->where('name', 'Plant Head');
                            })
                            ->first();
                        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
                            ->whereHas('roles', function ($query) {
                                $query->where('name', 'Plant Head');
                            })
                            ->first();
                        Notification::create([
                            'from_id'           => $storeManageruser->id ?? auth()->id(),
                            'to_id'             => $plantHead->id ?? 1,
                            'type'              => 'add_rm',
                            'status'            => 'unread',
                            'purpose'           => 'low_stock',
                            'notification_text' => 'Purchase Order with PO Number ' . $purchaseOrder->po_number . ' for Plant ' . $purchaseOrder->plant->plant_name . ' need to Issue RM',
                            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                        ]);
                        
                    } else if ($rawMaterial->initial_stock_quantity < $rawMaterial->minimum_threshold) {
                        $rawMaterial->status = 'low_stock';
                        $purchaseOrder = PurchaseOrder::findOrFail($id);
    
                        $plantHead = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
                            ->whereHas('roles', function ($query) {
                                $query->where('name', 'Plant Head');
                            })
                            ->first();
                        $storeManageruser = User::where('plant_assigned', $purchaseOrder->plant->plant_name)
                            ->whereHas('roles', function ($query) {
                                $query->where('name', 'Plant Head');
                            })
                            ->first();
                        Notification::create([
                            'from_id'           => $storeManageruser->id ?? auth()->id(),
                            'to_id'             => $plantHead->id ?? 1,
                            'type'              => 'add_rm',
                            'status'            => 'unread',
                            'purpose'           => 'low_stock',
                            'notification_text' => 'Purchase Order with PO Number ' . $purchaseOrder->po_number . ' for Plant ' . $purchaseOrder->plant->plant_name . ' need to Issue RM',
                            'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
                        ]);
                    }
                    
                    // Insert a record into allocated_rm table
                    AllocatedRm::create([
                        'po_id'              => $id,
                        'rm_code'            => $material['code'],
                        'allocated_quantity' => $requiredQuantity,
                        'reaining_quantity'  => $rawMaterial->initial_stock_quantity,
                    ]);
                }
            }
    
            // Update plant raw materials (PlantRawMaterial) quantities.
            foreach ($validatedData['partial_materials'] as $material) {
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
            }
        
            // Process finished goods and insert new FGProduction records.
            foreach ($validatedData['partial_finished_goods'] as $finished_good) {
                $finishedGood = FinishedGood::where('material_code', $finished_good['code'])->first();
                if ($finishedGood) {
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
                }
            }
        
            // Update the purchase order status.
            $purchaseOrder = PurchaseOrder::findOrFail($id);  
            $purchaseOrder->update([
                'order_status' => 'production_initiated',
            ]);
        });
    
        return redirect()->route('client-purchase-orders.index')
            ->with('success', 'Purchase order status updated successfully.');
    }
}    

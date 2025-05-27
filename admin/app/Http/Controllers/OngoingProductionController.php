<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FGProduction;
use App\Models\FinishedGoodRawMaterial;
use App\Models\PurchaseOrder;
use App\Models\OrderedItem;
use App\Models\FinishedGood;
use App\Models\Notification;
use App\Models\User;
use App\Models\PlantFinishedGood;
use Inertia\Inertia;

class OngoingProductionController extends Controller
{
    /**
     * Display a listing of ongoing productions.
     */
    public function index()
    {
        // Retrieve all ongoing production records
        $ongoingProds = FGProduction::all();

        // Optionally, calculate counts similar to your plants example.
        $totalProduction = FGProduction::count();
        $completeCount   = FGProduction::where('status', 'completed')->count();
        $ongoingCount = FGProduction::where('status', '!=', 'completed')->count();


       return Inertia::render('OngoingProd/View', [
    'ongoingProds' => $ongoingProds,
    'statusCounts' => [
        'totalProduction' => $totalProduction,
        'completeCount'   => $completeCount,
        'ongoingCount'    => $ongoingCount,
    ],
]);

    }

    /**
     * Mark a production as complete.
     */
    public function complete($po_id)
{
    $groupedFinishedGoods = FinishedGoodRawMaterial::with(['finishedGood', 'rawMaterial'])->get();

    $groupedFinishedGoods = $groupedFinishedGoods->groupBy(function ($item) {
        return $item->finishedGood->material_code;  // Group by finished good's material_code
    })->map(function ($items) {
        return $items->reduce(function ($carry, $item) {
            $carry['raw_materials'][] = [
                'raw_material_code' => $item->rawMaterial->material_code,  // Use material_code for raw material
                'quantity_required' => $item->fg_gross_wt,
                'unit'              => $item->unit,
            ];
            $carry['total_quantity_required'] = isset($carry['total_quantity_required']) 
                ? $carry['total_quantity_required'] + $item->fg_gross_wt 
                : $item->fg_gross_wt;
            return $carry;
        }, ['raw_materials' => [], 'total_quantity_required' => 0]);
    });
    
    $productions = FGProduction::where('po_id', $po_id)->get();

    if ($productions->isEmpty()) {
        return redirect()->back()->with('error', 'No production records found for this PO.');
    }

    // Loop for FinishedGood: Increase quantity
    foreach ($productions as $production) {
        $finishedGood = FinishedGood::where('material_code', $production['item_code'])->first();
        if ($finishedGood) {
           
              
                $finishedGood->initial_stock_quantity += $production['quantity'];
                $finishedGood->save();

                if ($finishedGood->initial_stock_quantity != 0) {
                    $finishedGood->status = 'low_stock';
                    $finishedGood->save();
    
                 
                }

                if ($finishedGood->initial_stock_quantity > $finishedGood->reorder_level) {
                    $finishedGood->status = 'available';
                    $finishedGood->save();
       
                  
                }
        
        }
    }

    // Loop for PlantFinishedGood: Increase quantity
    foreach ($productions as $production) {
        $plantFinishedGood = PlantFinishedGood::where('item_code', $production['item_code'])->first();
        if ($plantFinishedGood) {
          
                $plantFinishedGood->quantity += $production['quantity'];
                $plantFinishedGood->save();

                if ($plantFinishedGood->quantity != 0) {
                    $plantFinishedGood->status = 'available';
                    $plantFinishedGood->save();

                    
                  
                }
          
            
        }
    }

    // Update the status of each production record to 'complete'
    foreach ($productions as $production) {
        $production->update(['status' => 'completed']);
    }

    // Optionally, update the Purchase Order status as well
    $purchaseOrder = PurchaseOrder::findOrFail($po_id);

    $production_items = $productions->pluck('item_code')->toArray();

    // Retrieve ordered items using the production item codes
    $orderedItems = OrderedItem::whereIn('item_code', $production_items)->get();

    $purchaseOrder->update(['order_status' => 'added_fg']);
    foreach ($orderedItems as $orderedItem) {
        $orderedItem->status = 'added_fg';
        $orderedItem->save();
    }

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
    $prodManageruser = User::where('plant_assigned', $purchaseOrder->plant_id)
    ->whereHas('roles', function ($query) {
        $query->where('name', 'Production Manager');
    })
    ->first();
    // print_r($storeManageruser);die;
    Notification::create([
        'from_id'           => auth()->id(),
        'to_id'             => $plantHead->id ?? 1,
        'type'              => 'added_fg',
        'type'              => 'completed',
        'purpose'              => 'completed',
        'status'            => 'unread',
        'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant ' . $purchaseOrder->plant->plant_name . ' Fg added from Production.',
        'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
    ]);
    Notification::create([
        'from_id'           => auth()->id(),
        'to_id'             => $storeManageruser->id ?? 1,
        'type'              => 'added_fg',
        'type'              => 'completed',
        'purpose'              => 'completed',
        'status'            => 'unread',
        'notification_text' => 'Purchase Order with PO Number '.$purchaseOrder->po_number . ' for Plant ' . $purchaseOrder->plant->plant_name . ' Fg added from Production.',
        'notification_url'  => 'client-purchase-orders/' . $purchaseOrder->id . '/approve',
    ]);
  
    return redirect()->back()->with('success', 'Production marked as completed.');
}

    
}
<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\FGProduction;
use App\Models\VendorPurchaseOrder;
use App\Models\PurchaseOrder;
use App\Models\OrderedItem;
use App\Models\RawMaterial;
use App\Models\FinishedGood;
use App\Models\PlantFinishedGood;
use App\Models\PlantRawMaterial;
use App\Models\FinishedGoodRawMaterial;
use App\Models\ContactSeller;
use App\Models\Plant;
use App\Models\User;
use Carbon\Carbon;

use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class InventoryReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Inventory');
    }

    public function inventoryReport(Request $request)
    {
        $request->validate([
            'stock_type'  => 'required|string|in:raw_material,finished_good',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date',
            'status'      => 'required|string',
        ]);

        $stockType = $request->input('stock_type');
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate   = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
        $status    = $request->input('status');

        if ($stockType === 'raw_material') {
            $query = RawMaterial::select('material_name', 'initial_stock_quantity', 'unit_of_measurement', 'plant_allocated_quantity','created_at');
        } else {
            $query = FinishedGood::select('material_name', 'initial_stock_quantity', 'unit_of_measurement', 'plant_allocated_quantity','created_at');
        }

        // Apply date range filter
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        // Apply status filter if provided
        if (!empty($status)) {
            $query->where('status', $status);
        }

        $materials = $query->get();

        return inertia('Reports/Inventory', ['inventoryData' => $materials]);
    }
    public function poReport(Request $request)
{
    $request->validate([
        'po_type'    => 'required|string|in:vendor,client',
        'start_date' => 'required|date',
        'end_date'   => 'required|date',
        'status'     => 'required|string',
    ]);

    $poType = $request->input('po_type');
    $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
    $endDate   = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
    $status    = $request->input('status');

    if ($poType === 'vendor') {
        $query = VendorPurchaseOrder::with('client')
            ->select('client_id', 'po_number', 'order_status', 'po_date', 'expected_delivery_date', 'created_at');
    } else {
        $query = PurchaseOrder::with('client')
            ->select('client_id', 'po_number', 'order_status', 'po_date', 'expected_delivery_date', 'created_at');
    }

    // Apply date range filter
    if ($startDate && $endDate) {
        $query->whereBetween('created_at', [$startDate, $endDate]);
    } elseif ($startDate) {
        $query->where('created_at', '>=', $startDate);
    } elseif ($endDate) {
        $query->where('created_at', '<=', $endDate);
    }

    // Apply status filter if provided
    if (!empty($status)) {
        $query->where('order_status', $status);
    }

    $podata = $query->get();

    return inertia('Reports/Po', ['podata' => $podata]);
}

    public function production()
    {
        $finishedGoods =  FinishedGood::all();
        return Inertia::render('Reports/Production',[
            'finishedGoods' => $finishedGoods,
        ]);
    }


    public function productionReport(Request $request)
    {
        $request->validate([
            'product_type' => 'required|string',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date',
            'status' => 'required|string',
        ]);

        $startDate   = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate     = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
        $productType = $request->input('product_type');
        $orderStatus = $request->input('status');

        // Build the query for FGProduction records
        $query = FGProduction::select(
            'po_id',
            'item_code',
            'hsn_sac_code',
            'quantity',
            'unit',
            'item_description',
            'expected_prod_complete_date',
            'status',
            'created_at'
        );

        // Apply date range filter based on the created_at column
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        // Apply product type filter using the item_description column
        if (!empty($productType)) {
            $query->where('item_description', $productType);
        }

        // Apply order status filter
        if (!empty($orderStatus)) {
            $query->where('status', $orderStatus);
        }

        $productionData = $query->get();

        return Inertia::render('Reports/Production', ['productionData' => $productionData,  'finishedGoods'  => FinishedGood::all(),]);
    }


    public function po()
    {
        return Inertia::render('Reports/Po');
    }
}

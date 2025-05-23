<?php

namespace App\Http\Controllers;


use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\FGProduction;
use App\Models\PurchaseOrder;
use App\Models\UserPointsSale;
use App\Models\UserPointsClaim;
use App\Models\VendorPurchaseOrder;
use App\Models\OrderedItem;
use App\Models\RawMaterial;
use App\Models\FinishedGood;
use App\Models\PlantFinishedGood;
use App\Models\AllocatedRm;
use App\Models\PlantRawMaterial;
use App\Models\FinishedGoodRawMaterial;
use App\Models\ContactSeller;
use App\Models\Plant;
use App\Models\Notification;
use App\Models\User;
use App\Models\Users;
use App\Models\Game;
use App\Models\GameResults;
use App\Models\ClaimPointData;

use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
        $allowedRoles = ['Super Admin', 'Manager Imports', 'Client'];
        $hasAllowed = count(array_intersect($roles, $allowedRoles)) > 0;
        
        
        $notifications = Notification::orderBy('created_at', 'desc')->limit(4)->get();
        $notificationscount = Notification::where('status', 'unread')->count();

        if ($roles[0] === 'Retailer') {
            $currentPlayers = Users::where('retailer_id', auth()->id())->pluck('id');
        } elseif ($roles[0] === 'Stockit') {
            $currentPlayers = Users::where('stockit_id', auth()->id())->pluck('id');
        } else { // Super Admin
            $currentPlayers = Users::where('sub_admin_id', auth()->id())->pluck('id');
        }

        $currentUser = User::where('id', auth()->id())->first();
        $players = Users::whereIn('id', $currentPlayers)->count();
        $playersToday = Users::whereIn('id', $currentPlayers)->whereDate('created_at', Carbon::today())->count();

        $games = Game::all()->count();
        $gamestoday = Game::whereDate('created_at', Carbon::today())->count();

        $totalBet = ClaimPointData::whereIn('user_id', $currentPlayers)->sum('balance');
        $totalWin = GameResults::whereIn('user_id', $currentPlayers)->sum('win_value');



        $totalBetToday = ClaimPointData::whereDate('created_at', Carbon::today())->whereIn('user_id', $currentPlayers)->sum('balance');
   
    
        $totalWinToday = GameResults::whereDate('created_at', Carbon::today())->whereIn('user_id', $currentPlayers)->sum('win_value');

        $totalSaleToday = UserPointsSale::whereDate('created_at', Carbon::today())->sum('amount');

        $totalClaimToday = ClaimPointData::whereDate('created_at', Carbon::today())->whereIn('user_id', $currentPlayers)->sum('claim_point');
            $todayUnclaim = ClaimPointData::whereDate('created_at', Carbon::today())->whereIn('user_id', $currentPlayers)->sum('unclaim_point');

        if ($roles[0] == 'Retailer') {
            $currentPlayers = Users::where('retailer_id', auth()->id())->pluck('id');
        } elseif ($roles[0] == 'Stockit') {
            $currentPlayers = Users::where('stockit_id', auth()->id())->pluck('id');
        } elseif ($roles[0] == 'Super Admin') {
            $currentPlayers = Users::where('sub_admin_id', auth()->id())->pluck('id');
        }
        
        $gameResults = GameResults::with(['client.retailer', 'games'])
        ->whereIn('user_id', $currentPlayers)
        ->get()
        ->groupBy('game_id');
    
        
        // $results = GameResult::with('user')->get()->groupBy('game_id');

        $plant_id = $currentUser->plant_assigned;
        $allPlants = Plant::all()->count();
        $maintenancePlants = Plant::where('status', 'maintenance')->count();
        $productionInProgress = FGProduction::where('status', 'in_progress')->count();
        $capacity = Plant::where('status', 'active')->sum('capacity');
        $availablePlants = Plant::where('status', 'active')->count();
        $unavailablePlants = Plant::where('status', 'inactive')->count();
        

        if ($hasAllowed) {
            $purchaseOrders = PurchaseOrder::with(['client', 'plant'])->get()->groupBy('plant_id');
        } else {
            $purchaseOrders = PurchaseOrder::with(['client', 'plant'])
                ->where('plant_id', $user->plant_assigned)
                ->get()
                ->groupBy('plant_id');
        }
        if ($hasAllowed) {
            $vendorpurchaseOrders = VendorPurchaseOrder::with(['client', 'plant'])->get()->groupBy('plant_id');
        } else {
            $vendorpurchaseOrders = VendorPurchaseOrder::with(['client', 'plant'])
                ->where('plant_id', $user->plant_assigned)
                ->get()
                ->groupBy('plant_id');
        }

        $productionPoIds = FGProduction::pluck('po_id');

        $productionPos = PurchaseOrder::with(['client', 'plant'])
            ->where('plant_id', $user->plant_assigned)
            ->whereIn('id', $productionPoIds)
            ->get()
            ->groupBy('plant_id');

        

        $finishedGoods = FinishedGood::all();
        $allFinishedGoods = $finishedGoods->count();
        $lowStockFinishedGoods = FinishedGood::where('status', 'low_stock')->count();
        $availableFinishedGoods = FinishedGood::where('status', 'available')->count();
        $unavailableFinishedGoods = FinishedGood::where('status', 'unavailable')->count();

        $allRawMaterials = RawMaterial::all()->count();
        $lowStockRawMaterials = RawMaterial::where('status', 'low_stock')->count();
        $unavailableRawMaterials = RawMaterial::where('status', 'unavailable')->count();
        $availableRawMaterials = RawMaterial::where('status', 'available')->count();

        $allpurchaseOrders = PurchaseOrder::with('orderedItems')->count();
        $pendingpurchaseOrders = PurchaseOrder::where('order_status', 'pending_for_approval')->count();
        $completedpurchaseOrders = PurchaseOrder::where('order_status', 'completed')->count();
        $schduledpurchaseOrders = PurchaseOrder::where('order_status', 'ready_to_dispatch')->count();
        $activePurchaseOrders = PurchaseOrder::whereNotIn('order_status', ['pending', 'rejected', 'cancelled', 'completed'])->count();

        $dispatchedpurchaseOrders = PurchaseOrder::whereIn('order_status', ['dispatched', 'completed'])
        ->whereDate('updated_at', Carbon::today())
        ->count();
        $currentUserId = auth()->id();

        $currentallpurchaseOrders = PurchaseOrder::with('orderedItems')
            ->where('client_id', $currentUserId)
            ->count();
        
        $currentpendingpurchaseOrders = PurchaseOrder::where('order_status', 'pending_for_approval')
            ->where('client_id', $currentUserId)
            ->count();
        $currentInProgressOrders = PurchaseOrder::whereNotIn('order_status', ['pending_for_approval', 'completed'])
            ->where('client_id', $currentUserId)
            ->count();
        
        $currentcancelledOrders = PurchaseOrder::where('order_status', 'cancelled')
            ->where('client_id', $currentUserId)
            ->count();
        $currentdispatchedOrders = PurchaseOrder::where('order_status', 'dispatched')
            ->where('plant_id', $plant_id)
            ->whereDate('updated_at', Carbon::today())
            ->count();
        
        $currentcompletedpurchaseOrders = PurchaseOrder::where('order_status', 'completed')
            ->where('client_id', $currentUserId)
            ->count();


        $currentallVendorpurchaseOrders = VendorPurchaseOrder::where('client_id', $currentUserId)->whereNotIn('order_status', ['pr_requsted', 'plant_head_approved'])
            ->count();
        
        $currentpendingVendorpurchaseOrders = VendorPurchaseOrder::where('order_status', 'pending')
            ->where('client_id', $currentUserId)
            ->count();
        $currentInProgressVendorOrders = VendorPurchaseOrder::whereNotIn('order_status', ['pending_for_approval', 'completed'])
            ->where('client_id', $currentUserId)
            ->count();
        
        $currentcancelledVendorOrders = VendorPurchaseOrder::where('order_status', 'rejected')
            ->where('client_id', $currentUserId)
            ->count();
        $currentdispatchedVendorOrders = VendorPurchaseOrder::where('order_status', 'dispatched')
            ->where('plant_id', $plant_id)
            ->whereDate('updated_at', Carbon::today())
            ->count();
        
        $currentcompletedVendorpurchaseOrders = VendorPurchaseOrder::where('order_status', 'completed')
            ->where('client_id', $currentUserId)
            ->count();
        $currentInvoiceVendorpurchaseOrderscount = VendorPurchaseOrder::whereNotNull('invoice_file')
        ->where('client_id', $currentUserId)
            ->where('invoice_file', '!=', '')
            ->count();
        

        $ongoingProds = FGProduction::all();



        $plantRawMaterialCount = PlantRawMaterial::where('plant_id', $plant_id)->count();
        $plantFinishGoodCount = PlantFinishedGood::where('plant_id', $plant_id)->count();
        $lowStockRawMaterialstable = PlantRawMaterial::where('status', 'low_stock')->where('plant_id', $plant_id)->get();
        $lowStockFinishGoodtable = PlantFinishedGood::where('status', 'low_stock')->where('plant_id', $plant_id)->get();

        $allocatedRmtable = AllocatedRm::all();
        // echo '<pre>';
        // print_r($lowStockRawMaterialstable);die;
        $purchaseorderstable = PurchaseOrder::where('plant_id', $plant_id)->get();

        $productionsOrders = FGProduction::orderBy('created_at', 'desc')->get();
        // echo '<pre>';
        // print_r($productionsOrders);die;
        
        $allocatedRmTotal = AllocatedRm::sum('allocated_quantity');


        return Inertia::render('Dashboard', 
        [
            'gameResults' => $gameResults,
            'productionPos' => $productionPos,
            'vendorpurchaseOrders' => $vendorpurchaseOrders,
            'notifications' => $notifications,
            'ongoingProds' => $ongoingProds,
            'lowStockRawMaterialstable' => $lowStockRawMaterialstable,
            'lowStockFinishGoodtable' => $lowStockFinishGoodtable,
            'purchaseorderstable' => $purchaseorderstable,
            'allocatedRmtable' => $allocatedRmtable,
            'productionsOrders' => $productionsOrders,
            'statusCounts' => [
            'maintenancePlants' => $maintenancePlants,
            'availablePlants' => $availablePlants,
            'notificationscount' => $notificationscount,
            'unavailablePlants' => $unavailablePlants,
            'allPlants' => $allPlants,
            'capacity' => $capacity,
            'unavailableFinishedGoods' => $unavailableFinishedGoods,
            'availableFinishedGoods' => $availableFinishedGoods,
            'lowStockFinishedGoods' => $lowStockFinishedGoods,
            'allFinishedGoods' => $allFinishedGoods,
            'unavailableRawMaterials' => $unavailableRawMaterials,
            'availableRawMaterials' => $availableRawMaterials,
            'lowStockRawMaterials' => $lowStockRawMaterials,
            'allRawMaterials' => $allRawMaterials,
            'allpurchaseOrders' => $allpurchaseOrders,
            'pendingpurchaseOrders' => $pendingpurchaseOrders,
            'completedpurchaseOrders' => $completedpurchaseOrders,
            'dispatchedpurchaseOrders' => $dispatchedpurchaseOrders,
            'currentallpurchaseOrders' => $currentallpurchaseOrders,
            'currentpendingpurchaseOrders' => $currentpendingpurchaseOrders,
            'currentcompletedpurchaseOrders' => $currentcompletedpurchaseOrders,
            'schduledpurchaseOrders' => $schduledpurchaseOrders,
            'activePurchaseOrders' => $activePurchaseOrders,
            'productionInProgress'=> $productionInProgress,
            'plantRawMaterialCount'=> $plantRawMaterialCount,
            'allocatedRmTotal'=> $allocatedRmTotal,
            'plantFinishGoodCount'=> $plantFinishGoodCount,
            'currentdispatchedOrders'=> $currentdispatchedOrders,
            'currentcancelledOrders'=> $currentcancelledOrders,
            'currentInProgressOrders'=> $currentInProgressOrders,
            'currentallVendorpurchaseOrders'=> $currentallVendorpurchaseOrders,
            'currentpendingVendorpurchaseOrders'=> $currentpendingVendorpurchaseOrders,
            'currentcancelledVendorOrders'=> $currentcancelledVendorOrders,
            'currentInvoiceVendorpurchaseOrderscount'=> $currentInvoiceVendorpurchaseOrderscount,
            'normalUsers'=> $players,
            'games'=> $games,
            'totalBet'=> $totalBet,
            'totalWin'=> $totalWin,
            'playersToday'=> $playersToday,
            'gamestoday'=> $gamestoday,
            'totalBetToday'=> $totalBetToday,
            'totalWinToday'=> $totalWinToday,
            'totalSaleToday'=> $totalSaleToday,
            'totalClaimToday'=> $totalClaimToday,
            'todayUnclaim'=> $todayUnclaim,
            
        ]
        
        ,]
    );
    }
    public function notifications(){
        
        $notifications = Notification::orderBy('created_at', 'desc')->get();
        Notification::where('status', 'unread')->update(['status' => 'read']);
        $notificationscount = Notification::where('status', 'unread')->count();
        return Inertia::render('Notifications', [
            'notifications' => $notifications,
            'statusCounts' => [
            'notificationscount' => $notificationscount,
           
        ]
        ]);
    } 

    public function dailyMrp()
    {
        // Retrieve the current daily task time; default to '02:00' if not set.
        $dailyTaskTime = \App\Models\Setting::where('key', 'daily_task_time')->value('value') ?? '02:00';

        // Retrieve other dashboard data...
        $plantRawMaterialCount = PlantRawMaterial::where('plant_id', $plant_id)->count();
        // ...

        return Inertia::render('DailyMrp', [
            // Other data for the dashboard...
            'dailyTaskTime' => $dailyTaskTime,
        ]);
    }

}

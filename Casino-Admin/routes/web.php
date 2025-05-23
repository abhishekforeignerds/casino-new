<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'auth' => [
            'user' => auth()->user()
        ],
    
    ]);
})->middleware(['auth', 'verified']);

use App\Http\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');
Route::get('/notifications', [DashboardController::class, 'notifications'])
    ->middleware(['auth', 'verified'])
    ->name('notifications');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

use App\Http\Controllers\UserController;
use App\Http\Controllers\User\SubadminController;
use App\Http\Controllers\User\StockitController;
use App\Http\Controllers\User\RetailerController;

// Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('users', UserController::class);

    Route::get('users/{id}/view', [UserController::class, 'view'])->name('users.view');
    Route::get('users/{id}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
    Route::get('users/{id}/addfund', [UserController::class, 'addfund'])->name('users.addfund');
    Route::put('users/{id}/storefund', [UserController::class, 'storefund'])->name('users.storefund');
});
// Route::middleware(['auth', 'dynamic.permission'])->group(function () {
//     Route::resource('subadmin', SubadminController::class);

//     Route::get('subadmin/{id}/view', [SubadminController::class, 'view'])->name('subadmin.view');
//     Route::get('subadmin/{id}/suspend', [SubadminController::class, 'suspend'])->name('subadmin.suspend');
//     Route::get('subadmin/{id}/addfund', [SubadminController::class, 'addfund'])->name('subadmin.addfund');
//     Route::put('subadmin/{id}/storefund', [SubadminController::class, 'storefund'])->name('subadmin.storefund');
// });
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('stockit', StockitController::class);

    Route::get('stockit/{id}/view', [StockitController::class, 'view'])->name('stockit.view');
    Route::get('stockit/{id}/suspend', [StockitController::class, 'suspend'])->name('stockit.suspend');
    Route::get('stockit/{id}/addfund', [StockitController::class, 'addfund'])->name('stockit.addfund');
    Route::put('stockit/{id}/storefund', [StockitController::class, 'storefund'])->name('stockit.storefund');
});
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('retailer', RetailerController::class);
    Route::get('player-game-results', [RetailerController::class, 'playergameResults'])->name('retailer.playergameResults');
    Route::get('turnover-history', [RetailerController::class, 'turnoverHistory'])->name('retailer.turnoverHistory');
    Route::get('player-history', [RetailerController::class, 'playerhistory'])->name('retailer.playerhistory');
    Route::get('transaction-history', [RetailerController::class, 'transactionHistory'])->name('retailer.transactionhistory');
    Route::get('results-history', [RetailerController::class, 'resultsHistory'])->name('retailer.resultshistory');
    Route::get('retailer/{id}/view', [RetailerController::class, 'view'])->name('retailer.view');
    Route::get('retailer/{id}/suspend', [RetailerController::class, 'suspend'])->name('retailer.suspend');
    Route::get('retailer/{id}/addfund', [RetailerController::class, 'addfund'])->name('retailer.addfund');
    Route::put('retailer/{id}/storefund', [RetailerController::class, 'storefund'])->name('retailer.storefund');
});

use App\Http\Controllers\InventoryController;

Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
    Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('inventory/{inventory}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
    Route::put('inventory/{inventory}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('inventory/{inventory}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::get('inventory/import', [InventoryController::class, 'importForm'])->name('inventory.import');
    Route::post('inventory/import', [InventoryController::class, 'import'])->name('inventory.import-store');

});



use App\Http\Controllers\RawMaterialsController;
// Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::get('raw-materials', [RawMaterialsController::class, 'index'])->name('raw-materials.index');
    Route::get('raw-materials/create', [RawMaterialsController::class, 'create'])->name('raw-materials.create');
    Route::post('raw-materials', [RawMaterialsController::class, 'store'])->name('raw-materials.store');

    Route::get('raw-materials/{raw_material}/edit', [RawMaterialsController::class, 'edit'])->name('raw-materials.edit');
    Route::put('raw-materials/{raw_material}', [RawMaterialsController::class, 'update'])->name('raw-materials.update');
    Route::delete('raw-materials/{raw_material}', [RawMaterialsController::class, 'destroy'])->name('raw-materials.destroy');

    Route::get('raw-materials/{id}/view', [RawMaterialsController::class, 'view'])->name('raw-materials.view');
    Route::get('raw-materials/{id}/suspend', [RawMaterialsController::class, 'suspend'])->name('raw-materials.suspend');
    Route::get('raw-materials/import', [RawMaterialsController::class, 'importForm'])->name('raw-materials.import');
    Route::post('raw-materials/import', [RawMaterialsController::class, 'import'])->name('raw-materials.import-store');

    });
    
    Route::get('raw-materials/low-stock-alerts/', [RawMaterialsController::class, 'lowStockAlert'])
    ->name('raw-materials.lowStockAlert');

use App\Http\Controllers\FinishedGoodController;
// Route::middleware(['auth', 'dynamic.permission'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::get('games', [FinishedGoodController::class, 'index'])->name('games.index');  
    Route::get('games/create', [FinishedGoodController::class, 'create'])->name('games.create');  
    Route::post('games', [FinishedGoodController::class, 'store'])->name('games.store');  

    Route::get('games/{id}/edit', [FinishedGoodController::class, 'edit'])->name('games.edit');  
    Route::put('games/{id}', [FinishedGoodController::class, 'update'])->name('games.update');  
    Route::delete('games/{id}', [FinishedGoodController::class, 'destroy'])->name('games.destroy');  
    Route::delete('games/{id}', [FinishedGoodController::class, 'delete'])->name('games.delete');  
    Route::get('games/{id}/view', [FinishedGoodController::class, 'view'])->name('games.view');
    Route::get('games/{id}/suspend', [FinishedGoodController::class, 'suspend'])->name('games.suspend');
    Route::get('games/import', [FinishedGoodController::class, 'importForm'])->name('games.import');
    Route::post('games/import', [FinishedGoodController::class, 'import'])->name('games.import-store');
    });
use App\Http\Controllers\PlantController;
// Route::middleware(['auth', 'dynamic.permission'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
  
    Route::get('plants', [PlantController::class, 'index'])->name('plants.index');
    Route::get('plants/create', [PlantController::class, 'create'])->name('plants.create');
    Route::post('plants', [PlantController::class, 'store'])->name('plants.store');
  
    Route::get('plants/{plant}/edit', [PlantController::class, 'edit'])->name('plants.edit');
    Route::put('plants/{plant}', [PlantController::class, 'update'])->name('plants.update');
    Route::patch('plants/{plant}', [PlantController::class, 'update'])->name('plants.update');
    Route::delete('plants/{plant}', [PlantController::class, 'destroy'])->name('plants.destroy');
    
    Route::get('assign-plants/', [PlantController::class, 'assignPlant'])->name('plants.assignPlant');
    Route::get('plants/{id}/view', [PlantController::class, 'view'])->name('plants.view');
    Route::post('updateassignplant/', [PlantController::class, 'updateassignplant'])->name('plants.updateassignplant');
    Route::get('plants/{id}/suspend', [PlantController::class, 'suspend'])->name('plants.suspend');
    Route::get('/plants/games', [PlantController::class, 'finishedGoodsList'])->name('plants.finishedGoodsList');
    Route::get('/plants/raw-materials', [PlantController::class, 'rawMaterialsList'])->name('plants.rawMaterialsList');
    Route::get('/plants/games/{fg}/edit', [PlantController::class, 'editFgList'])->name('plants.editFgList');
    Route::put('/plants/games/{fg}', [PlantController::class, 'updateFgList'])->name('plants.updateFgList');
    Route::get('/plants/games/create', [PlantController::class, 'createfg'])->name('plants.createfg');
    Route::get('/plants/games/{id}/view', [PlantController::class, 'viewfg'])->name('plants.viewfg');
    Route::post('/plants/games/', [PlantController::class, 'storefg'])->name('plants.storefg');
    Route::get('/plants/raw-materials/{rm}/edit', [PlantController::class, 'editRmList'])->name('plants.editRmList');
    Route::put('/plants/raw-materials/{rm}', [PlantController::class, 'updateRmList'])->name('plants.updateRmList');
    Route::get('/plants/raw-materials/create', [PlantController::class, 'createrm'])->name('plants.createrm');
    Route::get('/plants/raw-materials/{id}/view', [PlantController::class, 'viewrm'])->name('plants.viewrm');
    Route::post('/plants/raw-materials/', [PlantController::class, 'storerm'])->name('plants.storerm');

});

Route::get('/plants/raw-materials/import', [PlantController::class, 'importrmForm'])->name('plants.importrm');
Route::post('/plants/raw-materials/import', [PlantController::class, 'importrm'])->name('plants.importrm-store');
Route::get('/plants/games/import', [PlantController::class, 'importfgForm'])->name('plants.importfg');
Route::post('/plants/games/import', [PlantController::class, 'importfg'])->name('plants.importfg-store');

use App\Http\Controllers\ClientController;
    // Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('players', ClientController::class);
    Route::get('players/{id}/view', [ClientController::class, 'view'])->name('players.view');
    Route::get('players/{id}/createticket', [ClientController::class, 'createticket'])->name('players.createticket');
    
    Route::get('players/{id}/addfund', [ClientController::class, 'addfund'])->name('players.addfund');
    Route::put('players/{id}/storefund', [ClientController::class, 'storefund'])->name('players.storefund');
    Route::get('players/{id}/suspend', [ClientController::class, 'suspend'])->name('players.suspend');
});
Route::get('players/{id}/viewticket', [ClientController::class, 'viewticket'])->name('players.viewticket');
Route::put('players/{id}/storeticket', [ClientController::class, 'storeticket'])->name('players.storeticket');

use App\Http\Controllers\UserPointsClaimController;
use App\Http\Controllers\ReportsManagementController;
    // Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('claims', UserPointsClaimController::class);
 
});
Route::post('/claims/{id}/accept', [UserPointsClaimController::class, 'accept'])->name('claims.accept');
Route::post('/claims/{id}/reject', [UserPointsClaimController::class, 'reject'])->name('claims.reject');

Route::get('/report/admin-report', [ReportsManagementController::class, 'adminReport'])->name('report.admin');
Route::get('/report/retailer-report', [ReportsManagementController::class, 'retailerReport'])->name('report.retilaer');
Route::get('/report/stockit-report', [ReportsManagementController::class, 'stockitReport'])->name('report.stockit');

use App\Http\Controllers\VendorController;
    // Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('vendors', VendorController::class);
    Route::get('vendors/{id}/view', [VendorController::class, 'view'])->name('vendors.view');
    Route::get('vendors/{id}/suspend', [VendorController::class, 'suspend'])->name('vendors.suspend');
});
use App\Http\Controllers\PurchaseOrderController;

// Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('client-purchase-orders', PurchaseOrderController::class);
    Route::get('client-purchase-orders/{id}/view', [PurchaseOrderController::class, 'view'])->name('client-purchase-orders.view');
    Route::get('client-purchase-orders/{id}/download', [PurchaseOrderController::class, 'download'])->name('client-purchase-orders.download');
    Route::get('client-purchase-orders/{id}/download-invoice', [PurchaseOrderController::class, 'downloadInvoice'])->name('client-purchase-orders.downloadInvoice');
    Route::get('client-purchase-orders/{id}/approve', [PurchaseOrderController::class, 'approve'])->name('client-purchase-orders.approve');
    Route::put('/client-purchase-orders/{id}/update-status', [PurchaseOrderController::class, 'updateStatus'])->name('client-purchase-orders.update-status');
    
    Route::put('/client-purchase-orders/{id}/fg-issused', [PurchaseOrderController::class, 'fgIssused'])->name('client-purchase-orders.fg-issused');
    Route::put('/client-purchase-orders/{id}/insufficient-fg', [PurchaseOrderController::class, 'insufficientFg'])->name('client-purchase-orders.insufficient-fg');

    Route::put('/client-purchase-orders/{id}/initiate-production', [PurchaseOrderController::class, 'initiateProd'])->name('client-purchase-orders.initiate-production');
    Route::get('/client-purchase-orders/{id}/suspend', [PurchaseOrderController::class, 'suspend'])->name('client-purchase-orders.suspend');
 Route::get('/vendor-purchase-orders/{id}/completed', [PurchaseOrderController::class, 'completed'])->name('client-purchase-orders.completed');


 Route::put('/client-purchase-orders/{id}/release-init', [PurchaseOrderController::class, 'releaseInit'])->name('client-purchase-orders.release-init');
 Route::put('/client-purchase-orders/{id}/insufficient-fg', [PurchaseOrderController::class, 'insufficient_fg'])->name('client-purchase-orders.insufficient-fg');
   
});
use App\Http\Controllers\VendorPurchaseOrderController;

// Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {
    Route::resource('vendor-purchase-orders', VendorPurchaseOrderController::class);
    Route::get('vendor-purchase-orders/{id}/view', [VendorPurchaseOrderController::class, 'view'])->name('vendor-purchase-orders.view');
    Route::get('vendor-purchase-orders/{id}/approve', [VendorPurchaseOrderController::class, 'approve'])->name('vendor-purchase-orders.approve');
    Route::put('/vendor-purchase-orders/{id}/update-status', [VendorPurchaseOrderController::class, 'updateStatus'])->name('vendor-purchase-orders.update-status');
    Route::get('/vendor-purchase-orders/{id}/suspend', [VendorPurchaseOrderController::class, 'suspend'])->name('vendor-purchase-orders.suspend');
    Route::get('vendor-purchase-orders/{id}/accept-po', [VendorPurchaseOrderController::class, 'accept'])->name('vendor-purchase-orders.accept-po');
    Route::get('vendor-purchase-orders/{id}/dispatch-po', [VendorPurchaseOrderController::class, 'dispatch'])->name('vendor-purchase-orders.dispatch-po');
    Route::get('vendor-purchase-orders/{id}/receive-po', [VendorPurchaseOrderController::class, 'received'])->name('vendor-purchase-orders.received-po');
    Route::get('vendor-purchase-orders/{id}/plant-head-approved-po', [VendorPurchaseOrderController::class, 'plantheadapproved'])->name('vendor-purchase-orders.plantheadapproved-po');
    Route::get('vendor-purchase-orders/{id}/admin-approved-po', [VendorPurchaseOrderController::class, 'adminapproved'])->name('vendor-purchase-orders.adminapproved-po');
    Route::get('vendor-purchase-orders/{id}/reject-po', [VendorPurchaseOrderController::class, 'reject'])->name('vendor-purchase-orders.reject-po');
    Route::get('vendor-purchase-orders/{id}/download-po', [VendorPurchaseOrderController::class, 'downloadPo'])->name('vendor-purchase-orders.download-po');
    Route::get('vendor-purchase-orders/{id}/fulfill-po', [VendorPurchaseOrderController::class, 'fulfill'])->name('vendor-purchase-orders.fulfill-po');
    Route::get('vendor-purchase-orders/{id}/shipping-po', [VendorPurchaseOrderController::class, 'shipping-po'])->name('vendor-purchase-orders.shipping-po');
    Route::post('vendor-purchase-orders/{id}/invoice-po', [VendorPurchaseOrderController::class, 'invoicePo'])->name('vendor-purchase-orders.invoice-po');
    Route::put('/vendor-purchase-orders/{id}/update-status-new', [VendorPurchaseOrderController::class, 'updateStatusNew'])->name('vendor-purchase-orders.update-status-new');
});

use App\Http\Controllers\PurchaseOrdersReleaseController;

// Route::middleware(['auth'])->group(function () {
Route::middleware(['auth'])->group(function () {
    // Route::resource('vendor-purchase-orders', PurchaseOrdersReleaseController::class);
    Route::put('client-purchase-orders/{id}/issue-single-fg', [PurchaseOrdersReleaseController::class, 'issueFg'])->name('client-purchase-orders.issue-single-fg');
    Route::put('client-purchase-orders/{id}/single-insufficient-fg', [PurchaseOrdersReleaseController::class, 'insufficientFg'])->name('client-purchase-orders.single-insufficient-fg');

    Route::put('/client-purchase-orders/{id}/single-initiate-production', [PurchaseOrdersReleaseController::class, 'initiateProd'])->name('client-purchase-orders.single-initiate-production');
   

    
 
});
Route::get('/vendor-purchase-orders/generate-pr', [VendorPurchaseOrderController::class, 'generatePr'])
->name('vendor-purchase-orders.generate-pr');

use App\Http\Controllers\ContactSellerController;

Route::middleware(['auth'])->group(function () {

    Route::get('/chat/{seller_id}', [ContactSellerController::class, 'index'])->name('contact.index');
    Route::post('/chat/{id}', [ContactSellerController::class, 'store'])->name('contact.store');

});
use App\Http\Controllers\Reports\InventoryReportController;
// Route::middleware(['auth'])->group(function () {
Route::middleware(['auth', 'dynamic.permission'])->group(function () {


    Route::get('/reports/inventory', [InventoryReportController::class, 'index'])->name('reports.inventory-index');
    Route::get('/reports/production', [InventoryReportController::class, 'production'])->name('reports.production-index');
    Route::get('/reports/po', [InventoryReportController::class, 'po'])->name('reports.po-index');
   

    Route::post('/reports/inventory', [InventoryReportController::class, 'inventoryReport'])->name('reports.inventory-report');
    Route::post('/reports/po', [InventoryReportController::class, 'poReport'])->name('reports.po-report');
    Route::post('/reports/production', [InventoryReportController::class, 'productionReport'])->name('reports.production-report');
});

use App\Http\Controllers\VendorShippingDetailController;

Route::post('/vendor-shipping-details/{purchaseOrder}', [VendorShippingDetailController::class, 'store'])
    ->name('vendor-shipping-details.store');
    

use App\Http\Controllers\OTPController;
Route::post('/send-otp', [OtpController::class, 'sendOtp'])->name('send.otp');
Route::post('/verify-otp', [OtpController::class, 'verifyOtp'])->name('verify.otp');





use App\Http\Controllers\OngoingProductionController;

Route::get('/ongoing-production', [OngoingProductionController::class, 'index'])
    ->name('ongoingProduction.index');

Route::get('/ongoing-production/completed/{id}', [OngoingProductionController::class, 'complete'])
    ->name('ongoingProduction.complete');


    use App\Http\Controllers\RoleController;
    use App\Http\Controllers\PermissionController;
    
    Route::group(['middleware' => ['auth']], function () {
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);
    });

    use App\Http\Controllers\DailyMrpController;

Route::get('/daily-mrp', [DailyMrpController::class, 'index'])->name('daily-mrp.index');
Route::post('/daily-mrp', [DailyMrpController::class, 'update'])->name('daily-mrp.update');

    
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DailyMrpReport;
use App\Models\PurchaseOrder;
use App\Models\VendorPurchaseOrder;
use Carbon\Carbon;
use Exception;

class DailyMRP extends Command
{
    protected $signature = 'daily:mrp';
    protected $description = 'Run the Daily MRP process and store purchase order stats';

    public function handle()
    {
        try {
            // Production Purchase Orders
            $po_pending_for_approval   = PurchaseOrder::where('order_status', 'pending_for_approval')->count();
            $this->info('po_pending_for_approval: ' . $po_pending_for_approval);
            $po_completed              = PurchaseOrder::where('order_status', 'completed')->count();
            $po_production_initiated   = PurchaseOrder::where('order_status', 'production_initiated')->count();
            $po_cancelled              = PurchaseOrder::where('order_status', 'cancelled')->count();
            $po_on_hold                = PurchaseOrder::where('order_status', 'on_hold')->count();
            $po_deleted                = PurchaseOrder::where('order_status', 'deleted')->count();
            $po_in_progress            = PurchaseOrder::where('order_status', 'in_progress')->count();
            $po_release_initiated      = PurchaseOrder::where('order_status', 'release_initiated')->count();
            $po_insufficient_fg        = PurchaseOrder::where('order_status', 'insufficient_fg')->count();
            $po_account_referred       = PurchaseOrder::where('order_status', 'account_referred')->count();
            $po_ready_dispatched       = PurchaseOrder::where('order_status', 'ready_dispatched')->count();
            $po_dispatched             = PurchaseOrder::where('order_status', 'dispatched')->count();
            $po_add_fg                 = PurchaseOrder::where('order_status', 'add_fg')->count();
            $po_add_rm                 = PurchaseOrder::where('order_status', 'add_rm')->count();
            $po_added_fg               = PurchaseOrder::where('order_status', 'added_fg')->count();
            $po_added_rm               = PurchaseOrder::where('order_status', 'added_rm')->count();
            $po_rejected               = PurchaseOrder::where('order_status', 'rejected')->count();
            $po_insufficient_rm        = PurchaseOrder::where('order_status', 'insufficient_rm')->count();

            // Vendor Purchase Orders
            $vendor_pr_requested           = VendorPurchaseOrder::where('order_status', 'pr_requested')->count();
            $vendor_plant_head_approved    = VendorPurchaseOrder::where('order_status', 'plant_head_approved')->count();
            $vendor_pending                = VendorPurchaseOrder::where('order_status', 'pending')->count();
            $vendor_accepted               = VendorPurchaseOrder::where('order_status', 'accepted')->count();
            $vendor_rejected               = VendorPurchaseOrder::where('order_status', 'rejected')->count();
            $vendor_cancelled              = VendorPurchaseOrder::where('order_status', 'cancelled')->count();
            $vendor_dispatched             = VendorPurchaseOrder::where('order_status', 'dispatched')->count();
            $vendor_received               = VendorPurchaseOrder::where('order_status', 'received')->count();
            $vendor_fulfilled              = VendorPurchaseOrder::where('order_status', 'fulfilled')->count();

            // Build the data array
            $data = [
                // Production Purchase Orders
                'pending_for_approval' => $po_pending_for_approval,
                'completed'            => $po_completed,
                'production_initiated' => $po_production_initiated,
                'cancelled'            => $po_cancelled,
                'on_hold'              => $po_on_hold,
                'deleted'              => $po_deleted,
                'in_progress'          => $po_in_progress,
                'release_initiated'    => $po_release_initiated,
                'insufficient_fg'      => $po_insufficient_fg,
                'account_referred'     => $po_account_referred,
                'ready_dispatched'     => $po_ready_dispatched,
                'dispatched'           => $po_dispatched,
                'add_fg'               => $po_add_fg,
                'add_rm'               => $po_add_rm,
                'added_fg'             => $po_added_fg,
                'added_rm'             => $po_added_rm,
                'rejected'             => $po_rejected,
                'insufficient_rm'      => $po_insufficient_rm,

                // Vendor Purchase Orders
                'pr_requested'         => $vendor_pr_requested,
                'plant_head_approved'  => $vendor_plant_head_approved,
                'pending'              => $vendor_pending,
                'accepted'             => $vendor_accepted,
                'rejected_vendor'      => $vendor_rejected,
                'cancelled_vendor'     => $vendor_cancelled,
                'dispatched_vendor'    => $vendor_dispatched,
                'received_vendor'      => $vendor_received,
                'fulfilled_vendor'     => $vendor_fulfilled,
                // If everything goes well, error remains null
                'error'                => null,
            ];

            \Log::debug('Inserting Daily MRP data: ' . json_encode($data));

            // Save the counts into the report table
            DailyMrpReport::create($data);

            \Log::debug('Daily MRP executed and report saved successfully.');
            $this->info('Daily MRP executed and report saved successfully.');
        } catch (Exception $e) {
            \Log::error('Daily MRP failed: ' . $e->getMessage());

            DailyMrpReport::create([
                // Production Purchase Orders (default to 0)
                'pending_for_approval' => 0,
                'completed'            => 0,
                'production_initiated' => 0,
                'cancelled'            => 0,
                'on_hold'              => 0,
                'deleted'              => 0,
                'in_progress'          => 0,
                'release_initiated'    => 0,
                'insufficient_fg'      => 0,
                'account_referred'     => 0,
                'ready_dispatched'     => 0,
                'dispatched'           => 0,
                'add_fg'               => 0,
                'add_rm'               => 0,
                'added_fg'             => 0,
                'added_rm'             => 0,
                'rejected'             => 0,
                'insufficient_rm'      => 0,

                // Vendor Purchase Orders (default to 0)
                'pr_requested'         => 0,
                'plant_head_approved'  => 0,
                'pending'              => 0,
                'accepted'             => 0,
                'rejected_vendor'      => 0,
                'cancelled_vendor'     => 0,
                'dispatched_vendor'    => 0,
                'received_vendor'      => 0,
                'fulfilled_vendor'     => 0,
                // Store the error message
                'error'                => $e->getMessage(),
            ]);

            $this->error('Daily MRP failed: ' . $e->getMessage());
        }
    }
}

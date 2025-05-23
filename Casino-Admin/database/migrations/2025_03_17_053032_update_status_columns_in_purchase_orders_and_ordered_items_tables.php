<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        
       
            // STEP 1: Modify order_status column safely
            DB::statement("ALTER TABLE `purchase_orders` MODIFY COLUMN `order_status` 
                ENUM('pending_for_approval', 'completed', 'production_initiated', 'cancelled', 
                    'on_hold', 'deleted', 'in_progress', 'release_initiated', 'insufficient_fg', 
                    'account_referred', 'ready_dispatched', 'dispatched', 'add_fg', 'add_rm', 
                    'added_fg', 'added_rm', 'rejected', 'insufficient_rm') 
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_for_approval'");
    
            // STEP 2: Update the existing order_status values
            DB::table('purchase_orders')->update([
                'order_status' => DB::raw("CASE 
                    WHEN order_status = 'ready_to_release' THEN 'release_initiated'
                    WHEN order_status = 'initiated' THEN 'production_initiated'
                    WHEN order_status = 'pending' THEN 'pending_for_approval'
                    ELSE order_status 
                END")
            ]);
    
            // STEP 3: Add the new client_status column to purchase_orders table
            Schema::table('purchase_orders', function (Blueprint $table) {
                $table->enum('client_status', ['pending', 'in_process', 'dispatched', 'completed'])
                      ->default('pending')
                      ->after('order_status');
            });
    
            // STEP 4: Add the client_status column to ordered_items table
            Schema::table('ordered_items', function (Blueprint $table) {
                $table->enum('client_status', ['pending', 'in_process', 'dispatched', 'completed'])
                      ->default('pending')
                      ->after('status');
            });
        }
    
        public function down()
        {
            // Reverse client_status column changes
            Schema::table('purchase_orders', function (Blueprint $table) {
                $table->dropColumn('client_status');
            });
    
            Schema::table('ordered_items', function (Blueprint $table) {
                $table->dropColumn('client_status');
            });
    
            // Reverse order_status ENUM modification
            DB::statement("ALTER TABLE `purchase_orders` MODIFY COLUMN `order_status` 
                ENUM('pending', 'completed', 'initiated', 'cancelled', 'on_hold', 'deleted', 'in_progress', 
                    'ready_to_release', 'insufficient_fg', 'account_referred', 'ready_dispatched', 
                    'dispatched', 'add_fg', 'add_rm', 'added_fg', 'added_rm', 'rejected', 'insufficient_rm') 
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending'");
    
            // STEP 2: Revert the updated values
            DB::table('purchase_orders')->update([
                'order_status' => DB::raw("CASE 
                    WHEN order_status = 'release_initiated' THEN 'ready_to_release'
                    WHEN order_status = 'production_initiated' THEN 'initiated'
                    WHEN order_status = 'pending_for_approval' THEN 'pending'
                    ELSE order_status 
                END")
            ]);
        }
};

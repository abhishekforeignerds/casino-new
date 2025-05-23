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
        Schema::table('purchase_orders', function (Blueprint $table) {
            // Add 'status_reason' column as nullable
            $table->text('status_reason')->nullable();

            // Update the 'status' column to include the 'rejected' enum value
            $table->enum('order_status', ['pending', 'completed', 'initiated', 'cancelled', 'on_hold', 'rejected'])->change();
        });
    }

    public function down()
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            // Remove the 'status_reason' column
            $table->dropColumn('status_reason');

            // Rollback the 'status' column to previous enum values
            $table->enum('order_status', ['pending', 'completed', 'initiated', 'cancelled', 'on_hold'])->change();
        });
    }
};

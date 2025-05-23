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
            $table->enum('order_status', [
                'pending', 'completed', 'initiated', 'cancelled', 'on_hold', 'deleted'
            ])->change();
        });

        Schema::table('vendor_purchase_orders', function (Blueprint $table) {
            $table->enum('order_status', [
                'pending', 'completed', 'initiated', 'cancelled', 'on_hold', 'deleted'
            ])->change();
        });
    }

    public function down()
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->enum('order_status', [
                'pending', 'completed', 'initiated', 'cancelled', 'on_hold'
            ])->change();
        });

        Schema::table('vendor_purchase_orders', function (Blueprint $table) {
            $table->enum('order_status', [
                'pending', 'completed', 'initiated', 'cancelled', 'on_hold'
            ])->change();
        });
    }
};

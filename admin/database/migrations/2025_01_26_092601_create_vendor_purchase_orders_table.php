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
        Schema::create('vendor_purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('plant_id');
            $table->string('order_status')->default('pending');
            $table->date('po_date');
            $table->date('expected_delivery_date')->nullable();
            $table->string('file_url')->nullable();
            $table->timestamps();

            $table->foreign('plant_id')->references('id')->on('plants')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vendor_purchase_orders');
    }
};

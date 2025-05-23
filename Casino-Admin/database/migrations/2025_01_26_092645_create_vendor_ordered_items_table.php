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
        Schema::create('vendor_ordered_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_code');
            $table->string('hsn_sac_code')->nullable();
            $table->integer('quantity');
            $table->string('unit');
            $table->text('item_description')->nullable();
            $table->unsignedBigInteger('po_id');
            $table->timestamps();

            $table->foreign('po_id')->references('id')->on('vendor_purchase_orders')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vendor_ordered_items');
    }
};

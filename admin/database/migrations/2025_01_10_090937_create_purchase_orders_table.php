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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key
            $table->string('po_number')->unique();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('plant_id');
            $table->enum('order_status', ['pending', 'completed', 'initiated', 'cancelled', 'on_hold']);
            $table->date('po_date');
            $table->date('expected_delivery_date')->nullable();
            $table->string('file_url')->nullable();
            $table->unsignedBigInteger('ordered_items_id'); // Foreign key for ordered items
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};

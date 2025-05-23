<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('finished_goods', function (Blueprint $table) {
            $table->id();
            $table->string('material_code')->unique();
            $table->string('material_name');
            $table->string('hsn_sac_code');
            $table->integer('initial_stock_quantity');
            $table->string('unit_of_measurement');
            $table->date('date_of_entry');
            $table->text('raw_materials_used'); // JSON format to store multiple raw materials
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finished_goods');
    }
};

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
        Schema::create('finished_good_raw_material', function (Blueprint $table) {
            $table->id();
            $table->foreignId('finished_good_id')->constrained()->onDelete('cascade');
            $table->foreignId('raw_material_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity_required', 10, 2); // Quantity required to prepare 1 FG
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('finished_good_raw_material');
    }
};

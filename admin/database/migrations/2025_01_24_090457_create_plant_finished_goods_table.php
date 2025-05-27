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
        Schema::create('plant_finished_goods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plant_id')->constrained()->onDelete('cascade');
            $table->foreignId('finished_good_id')->constrained()->onDelete('cascade');
            $table->string('item_code');
            $table->string('item_description');
            $table->string('hsn_sac_code');
            $table->enum('status', ['available', 'unavailable', 'low_stock'])
                ->default('available');
            $table->integer('quantity');
            $table->string('unit');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('plant_finished_goods');
    }
};

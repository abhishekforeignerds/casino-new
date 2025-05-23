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
        Schema::create('plant_raw_material', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('plant_id');
            $table->unsignedBigInteger('finished_good_id');
            $table->string('item_code');
            $table->string('item_description');
            $table->string('hsn_sac_code');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->decimal('quantity', 10, 2);
            $table->string('unit');
            $table->timestamps();

            // Foreign keys
            $table->foreign('plant_id')->references('id')->on('plants')->onDelete('cascade');
            $table->foreign('finished_good_id')->references('id')->on('finished_goods')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('plant_raw_material');
    }
};

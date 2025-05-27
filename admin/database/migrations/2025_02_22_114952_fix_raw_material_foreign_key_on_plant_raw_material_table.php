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
        Schema::table('plant_raw_material', function (Blueprint $table) {
            // Drop the incorrect foreign key constraint using its actual name.
            $table->dropForeign('plant_raw_material_finished_good_id_foreign');

            // Add the correct foreign key constraint referencing the raw_materials table.
            $table->foreign('raw_material_id')
                  ->references('id')
                  ->on('raw_materials')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('plant_raw_material', function (Blueprint $table) {
            // Drop the new foreign key constraint.
            $table->dropForeign(['raw_material_id']);

            // Recreate the original foreign key constraint that references finished_goods table.
            $table->foreign('raw_material_id')
                  ->references('id')
                  ->on('finished_goods')
                  ->onDelete('cascade');
        });
    }
};

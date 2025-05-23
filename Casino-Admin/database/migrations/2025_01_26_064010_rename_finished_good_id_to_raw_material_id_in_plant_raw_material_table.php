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
            $table->renameColumn('finished_good_id', 'raw_material_id');
        });
    }

    public function down()
    {
        Schema::table('plant_raw_material', function (Blueprint $table) {
            $table->renameColumn('raw_material_id', 'finished_good_id');
        });
    }
};

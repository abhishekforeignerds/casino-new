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
            $table->integer('minimum_threshold')->after('unit')->nullable();
            $table->integer('buffer_stock')->after('minimum_threshold')->nullable();
        });
    }

    public function down()
    {
        Schema::table('plant_raw_material', function (Blueprint $table) {
            $table->dropColumn(['minimum_threshold', 'buffer_stock']);
        });
    }
};

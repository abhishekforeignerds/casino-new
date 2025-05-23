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
        Schema::table('plant_finished_goods', function (Blueprint $table) {
            $table->integer('reorder_level')->after('unit')->nullable();
            $table->integer('buffer_stock')->after('reorder_level')->nullable();
        });
    }

    public function down()
    {
        Schema::table('plant_finished_goods', function (Blueprint $table) {
            $table->dropColumn(['reorder_level', 'buffer_stock']);
        });
    }
};

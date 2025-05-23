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
        Schema::table('finished_goods', function (Blueprint $table) {
            $table->integer('plant_allocated_quantity')->default(0)->after('initial_stock_quantity');
        });
    }

    public function down()
    {
        Schema::table('finished_goods', function (Blueprint $table) {
            $table->dropColumn('plant_allocated_quantity');
        });
    }
};

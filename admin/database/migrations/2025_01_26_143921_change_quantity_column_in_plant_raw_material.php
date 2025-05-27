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
            $table->integer('quantity')->length(11)->change();
        });
    }

    public function down()
    {
        Schema::table('plant_raw_material', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });
    }
};

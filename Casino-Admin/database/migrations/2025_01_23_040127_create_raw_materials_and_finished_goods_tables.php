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
        Schema::table('raw_materials', function (Blueprint $table) {
            $table->enum('status', ['available', 'unavailable', 'low_stock', 'deleted'])->default('available')->change();
        });

        Schema::table('finished_goods', function (Blueprint $table) {
            $table->enum('status', ['available', 'unavailable', 'low_stock', 'deleted'])->default('available')->change();
        });
    }

    public function down()
    {
        Schema::table('raw_materials', function (Blueprint $table) {
            $table->enum('status', ['available', 'unavailable', 'low_stock'])->default('available')->change();
        });

        Schema::table('finished_goods', function (Blueprint $table) {
            $table->enum('status', ['available', 'unavailable', 'low_stock'])->default('available')->change();
        });
    }
};

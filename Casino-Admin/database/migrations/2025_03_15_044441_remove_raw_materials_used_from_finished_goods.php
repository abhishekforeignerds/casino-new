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
            $table->dropColumn('raw_materials_used');
        });
    }

    public function down()
    {
        Schema::table('finished_goods', function (Blueprint $table) {
            $table->string('raw_materials_used')->nullable();
        });
    }
};

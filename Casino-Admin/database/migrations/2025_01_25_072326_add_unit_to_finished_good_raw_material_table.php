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
        Schema::table('finished_good_raw_material', function (Blueprint $table) {
            $table->string('unit')->nullable(); // Adding 'unit' column, nullable if needed
        });
    }

    public function down()
    {
        Schema::table('finished_good_raw_material', function (Blueprint $table) {
            $table->dropColumn('unit'); // Drop the 'unit' column if rolling back
        });
    }
};

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
            $table->dropColumn('status'); // Drop the existing ENUM column
        });

        Schema::table('plant_raw_material', function (Blueprint $table) {
            $table->enum('status', ['available', 'unavailable', 'low_stock'])->default('available')->after('hsn_sac_code');
        });
    }

    public function down()
    {
        Schema::table('plant_raw_material', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('plant_raw_material', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active')->after('hsn_sac_code');
        });
    }
};

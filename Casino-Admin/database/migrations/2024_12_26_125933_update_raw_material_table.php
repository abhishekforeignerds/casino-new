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
            // Adding new columns after initial_stock_quantity
            $table->enum('status', ['available', 'unavailable', 'low_stock'])
                ->default('available')
                ->after('initial_stock_quantity');
            $table->integer('minimum_threshold')->after('status');
            $table->integer('buffer_stock')->default(10)->after('minimum_threshold');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('raw_materials', function (Blueprint $table) {
            // Dropping the added columns during rollback
            $table->dropColumn(['status', 'minimum_threshold', 'buffer_stock']);
        });
    }
};

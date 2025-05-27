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
            $table->enum('status', ['available', 'unavailable', 'low_stock'])
                  ->after('initial_stock_quantity')
                  ->nullable();
            $table->integer('reorder_level')->after('status')->nullable();
            $table->integer('buffer_stock')->after('reorder_level')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('finished_goods', function (Blueprint $table) {
            $table->dropColumn(['status', 'reorder_level', 'buffer_stock']);
        });
    }
};

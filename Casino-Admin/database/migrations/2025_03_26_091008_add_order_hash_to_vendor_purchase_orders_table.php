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
        Schema::table('vendor_purchase_orders', function (Blueprint $table) {
            $table->string('order_hash')->nullable()->after('file_url')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('vendor_purchase_orders', function (Blueprint $table) {
            $table->dropColumn('order_hash');
        });
    }
};

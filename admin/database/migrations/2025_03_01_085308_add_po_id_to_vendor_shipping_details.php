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
        Schema::table('vendor_shipping_details', function (Blueprint $table) {
            $table->unsignedBigInteger('po_id')->nullable()->after('id'); // Adjust position if needed
            $table->foreign('po_id')->references('id')->on('vendor_purchase_orders')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('vendor_shipping_details', function (Blueprint $table) {
            $table->dropForeign(['po_id']);
            $table->dropColumn('po_id');
        });
    }
};

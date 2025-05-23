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
            $table->string('invoice_file')->nullable()->after('file_url'); // Change 'file_url' to an existing column
        });
    }

    public function down()
    {
        Schema::table('vendor_purchase_orders', function (Blueprint $table) {
            $table->dropColumn('invoice_file');
        });
    }
};

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
        DB::statement("ALTER TABLE purchase_orders MODIFY COLUMN order_status ENUM('pending', 'completed', 'initiated', 'cancelled', 'on_hold', 'deleted', 'in_progress') NOT NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE purchase_orders MODIFY COLUMN order_status ENUM('pending', 'completed', 'initiated', 'cancelled', 'on_hold', 'deleted') NOT NULL");
    }
};

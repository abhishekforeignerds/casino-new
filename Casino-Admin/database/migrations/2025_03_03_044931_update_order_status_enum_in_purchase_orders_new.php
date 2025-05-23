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
        DB::statement("ALTER TABLE purchase_orders MODIFY COLUMN order_status ENUM(
            'pending', 
            'completed', 
            'initiated', 
            'cancelled', 
            'on_hold', 
            'deleted', 
            'in_progress',
            'ready_to_release',
            'insufficient_fg',
            'account_referred',
            'ready_dispatched',
            'dispatched',
            'add_fg',
            'add_rm',
            'added_fg',
            'added_rm',
            'rejected',
            'insufficient_rm'
        ) NOT NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE purchase_orders MODIFY COLUMN order_status ENUM(
            'pending', 
            'completed', 
            'initiated', 
            'cancelled', 
            'on_hold', 
            'deleted', 
            'in_progress',
            'ready_to_release',
            'insufficient_fg',
            'insufficient_rm'
        ) NOT NULL");
    }
};

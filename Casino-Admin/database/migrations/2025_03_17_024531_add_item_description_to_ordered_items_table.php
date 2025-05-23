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
        Schema::table('ordered_items', function (Blueprint $table) {
            $table->enum('status', [
                'pending_for_approval',
                'completed',
                'production_initiated',
                'cancelled',
                'on_hold',
                'deleted',
                'in_progress',
                'release_initiated',
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
            ])->default('pending_for_approval')->after('item_description');
        });
    }
    

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('ordered_items', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};

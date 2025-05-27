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
    // Drop the unique constraint from item_code column
    Schema::table('ordered_items', function (Blueprint $table) {
        $table->dropUnique('ordered_items_item_code_unique');  // Drop the unique constraint
    });
}

public function down()
{
    // In case of rollback, re-add the unique constraint
    Schema::table('ordered_items', function (Blueprint $table) {
        $table->unique('item_code');
    });
}
};

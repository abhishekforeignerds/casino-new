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
        Schema::create('ordered_items', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key
            $table->string('item_code')->unique();
            $table->string('hsn_sac_code');
            $table->integer('quantity');
            $table->string('unit');
            $table->text('item_description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ordered_items');
    }
};

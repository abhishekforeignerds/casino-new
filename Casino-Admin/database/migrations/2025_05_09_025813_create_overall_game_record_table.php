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
        Schema::create('overall_game_record', function (Blueprint $table) {
            $table->id();
            $table->integer('choosenindex');
            $table->float('winningpoint', 10, 2)->default(0);
            $table->float('currentwinningPercentage', 5, 2)->default(0);
            $table->float('totalSaleToday', 10, 2)->default(0);
            $table->float('totalWinToday', 10, 2)->default(0);
            $table->float('winningPercentage', 5, 2)->default(0);
            $table->float('overrideChance', 5, 2)->nullable();
            $table->string('userwins')->nullable();
            $table->string('allSametxt')->nullable();
            $table->float('minvalue', 10, 2)->default(0);
            $table->timestamp('withdraw_time')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overall_game_record');
    }
};

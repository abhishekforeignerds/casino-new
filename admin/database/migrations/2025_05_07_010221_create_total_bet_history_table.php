<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('total_bet_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('game_id');
            $table->string('card_type');
            $table->decimal('bet_amount', 10, 2);
            $table->timestamp('withdraw_time')->nullable();
            $table->timestamps();

            // Optional: Add foreign key constraints if needed
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('game_id')->references('id')->on('games')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('total_bet_history');
    }
};

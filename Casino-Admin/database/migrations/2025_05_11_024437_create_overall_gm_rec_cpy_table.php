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
        Schema::create('overall_gm_rec_cpy', function (Blueprint $table) {
            $table->id(); // creates unsigned BIGINT auto-increment primary key
            $table->integer('choosenindex');
            $table->float('winningpoint')->default(0);
            $table->float('currentwinningPercentage')->default(0);
            $table->float('totalSaleToday')->default(0);
            $table->float('totalWinToday')->default(0);
            $table->float('winningPercentage')->default(0);
            $table->float('overrideChance')->nullable();
            $table->string('userwins')->nullable();
            $table->string('allSametxt')->nullable();
            $table->float('minvalue')->default(0);
            $table->timestamp('withdraw_time')->useCurrent()->useCurrentOnUpdate()->unique();
            $table->timestamps(); // creates created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overall_gm_rec_cpy');
    }
};

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
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_name')->nullable();
            $table->string('gstin_number')->nullable();
            $table->string('pan_card')->nullable();
            $table->string('state_code')->nullable();
            $table->text('company_address')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'gstin_number', 'pan_card', 'state_code', 'company_address']);
        });
    }
};

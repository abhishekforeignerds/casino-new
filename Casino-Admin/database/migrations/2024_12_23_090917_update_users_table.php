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
            $table->string('plant_assigned')->nullable()->after('email'); // Adjust 'after' as needed
            $table->string('mobile_number')->nullable()->after('plant_assigned');
            $table->enum('status', ['active', 'pending_approval', 'inactive'])->default('pending_approval')->after('mobile_number');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['plant_assigned', 'mobile_number', 'status']);
        });
    }
};

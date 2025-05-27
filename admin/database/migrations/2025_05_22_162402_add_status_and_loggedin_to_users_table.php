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
        Schema::table('user', function (Blueprint $table) {
            $table->enum('status', ['inactive', 'active'])->after('override_chance');
            $table->enum('logged_in', ['no', 'yes'])->after('status');
        });
    }

    public function down()
    {
        Schema::table('user', function (Blueprint $table) {
            $table->dropColumn(['status', 'logged_in']);
        });
    }
};

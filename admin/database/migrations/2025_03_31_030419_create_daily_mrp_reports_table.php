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
        Schema::create('daily_mrp_reports', function (Blueprint $table) {
            $table->id();
            // Production Purchase Order Status Counts
            $table->unsignedInteger('pending_for_approval')->default(0);
            $table->unsignedInteger('completed')->default(0);
            $table->unsignedInteger('production_initiated')->default(0);
            $table->unsignedInteger('cancelled')->default(0);
            $table->unsignedInteger('on_hold')->default(0);
            $table->unsignedInteger('deleted')->default(0);
            $table->unsignedInteger('in_progress')->default(0);
            $table->unsignedInteger('release_initiated')->default(0);
            $table->unsignedInteger('insufficient_fg')->default(0);
            $table->unsignedInteger('account_referred')->default(0);
            $table->unsignedInteger('ready_dispatched')->default(0);
            $table->unsignedInteger('dispatched')->default(0);
            $table->unsignedInteger('add_fg')->default(0);
            $table->unsignedInteger('add_rm')->default(0);
            $table->unsignedInteger('added_fg')->default(0);
            $table->unsignedInteger('added_rm')->default(0);
            $table->unsignedInteger('rejected')->default(0);
            $table->unsignedInteger('insufficient_rm')->default(0);

            // Vendor Purchase Order Status Counts
            $table->unsignedInteger('pr_requested')->default(0);
            $table->unsignedInteger('plant_head_approved')->default(0);
            $table->unsignedInteger('pending')->default(0);
            $table->unsignedInteger('accepted')->default(0);
            $table->unsignedInteger('rejected_vendor')->default(0);
            $table->unsignedInteger('cancelled_vendor')->default(0);
            $table->unsignedInteger('dispatched_vendor')->default(0);
            $table->unsignedInteger('received_vendor')->default(0);
            $table->unsignedInteger('fulfilled_vendor')->default(0);

            // Error column to store any error messages during processing
            $table->text('error')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_mrp_reports');
    }
};

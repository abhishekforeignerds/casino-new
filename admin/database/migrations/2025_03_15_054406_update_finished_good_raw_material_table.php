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
        Schema::table('finished_good_raw_material', function (Blueprint $table) {
            // Drop foreign keys if they exist
            if (Schema::hasColumn('finished_good_raw_material', 'finished_good_id')) {
                $table->dropForeign(['finished_good_id']);
                $table->renameColumn('finished_good_id', 'fg_code');
            }

            if (Schema::hasColumn('finished_good_raw_material', 'raw_material_id')) {
                $table->dropForeign(['raw_material_id']);
                $table->renameColumn('raw_material_id', 'rm_code');
            }

            // Add new columns only if they don't already exist
            if (!Schema::hasColumn('finished_good_raw_material', 'fg_item_description')) {
                $table->string('fg_item_description')->nullable()->after('fg_code');
            }

            if (!Schema::hasColumn('finished_good_raw_material', 'rm_item_description')) {
                $table->string('rm_item_description')->nullable()->after('rm_code');
            }

            if (!Schema::hasColumn('finished_good_raw_material', 'fg_gross_wt')) {
                $table->decimal('fg_gross_wt', 10, 2)->nullable()->after('rm_item_description');
            }

            if (!Schema::hasColumn('finished_good_raw_material', 'fg_net_wt')) {
                $table->decimal('fg_net_wt', 10, 2)->nullable()->after('fg_gross_wt');
            }

            if (!Schema::hasColumn('finished_good_raw_material', 'scrap_net_wt')) {
                $table->decimal('scrap_net_wt', 10, 2)->nullable()->after('fg_net_wt');
            }

            // Modify columns only if they exist
            if (Schema::hasColumn('finished_good_raw_material', 'quantity_required')) {
                $table->integer('quantity_required')->nullable()->change();
            }

            if (Schema::hasColumn('finished_good_raw_material', 'price')) {
                $table->decimal('price', 10, 2)->nullable()->change();
            }

            if (Schema::hasColumn('finished_good_raw_material', 'unit')) {
                $table->string('unit')->default('gm')->change();
            }

            if (Schema::hasColumn('finished_good_raw_material', 'fg_code')) {
                $table->string('fg_code')->change();
            }

            if (Schema::hasColumn('finished_good_raw_material', 'rm_code')) {
                $table->string('rm_code')->change();
            }
        });
    }

    public function down()
    {
        Schema::table('finished_good_raw_material', function (Blueprint $table) {
            if (Schema::hasColumn('finished_good_raw_material', 'unit')) {
                $table->string('unit')->default(null)->change();
            }

            if (Schema::hasColumn('finished_good_raw_material', 'quantity_required')) {
                $table->integer('quantity_required')->nullable(false)->change();
            }

            if (Schema::hasColumn('finished_good_raw_material', 'price')) {
                $table->decimal('price', 10, 2)->nullable(false)->change();
            }

            if (Schema::hasColumn('finished_good_raw_material', 'fg_item_description')) {
                $table->dropColumn('fg_item_description');
            }

            if (Schema::hasColumn('finished_good_raw_material', 'rm_item_description')) {
                $table->dropColumn('rm_item_description');
            }

            if (Schema::hasColumn('finished_good_raw_material', 'fg_gross_wt')) {
                $table->dropColumn('fg_gross_wt');
            }

            if (Schema::hasColumn('finished_good_raw_material', 'fg_net_wt')) {
                $table->dropColumn('fg_net_wt');
            }

            if (Schema::hasColumn('finished_good_raw_material', 'scrap_net_wt')) {
                $table->dropColumn('scrap_net_wt');
            }

            if (Schema::hasColumn('finished_good_raw_material', 'fg_code')) {
                $table->renameColumn('fg_code', 'finished_good_id');
            }

            if (Schema::hasColumn('finished_good_raw_material', 'rm_code')) {
                $table->renameColumn('rm_code', 'raw_material_id');
            }
        });
    }
};

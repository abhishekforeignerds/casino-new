<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyMrpReport extends Model
{
    protected $fillable = [
        'pending_for_approval',
        'completed',
        'production_initiated',
        'cancelled',
        'on_hold',
        'deleted',
        'in_progress',
        'release_initiated',
        'insufficient_fg',
        'account_referred',
        'ready_dispatched',
        'dispatched',
        'add_fg',
        'add_rm',
        'added_fg',
        'added_rm',
        'rejected',
        'insufficient_rm',
        'pr_requested',
        'plant_head_approved',
        'pending',
        'accepted',
        'rejected_vendor',
        'cancelled_vendor',
        'dispatched_vendor',
        'received_vendor',
        'fulfilled_vendor',
        'error',
    ];
}

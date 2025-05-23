<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;
use App\Models\Setting;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


app()->booted(function () {
    // Retrieve the scheduled time from your settings; default to '02:00' if not set.
    $dailyTaskTime = Setting::where('key', 'daily_task_time')->value('value') ?? '02:00';
    
    \Log::debug('Daily MRP scheduled time: ' . $dailyTaskTime);
    \Log::debug('Current time at scheduling: ' . Carbon::now()->setTimezone('Asia/Kolkata')->format('H:i'));

    $schedule = app(Schedule::class);
    
    // For debugging: run every minute
    $schedule->command('daily:mrp')->everyMinute()
        ->before(function () {
            \Log::debug('Before executing daily:mrp command. Current time: ' . Carbon::now()->setTimezone('Asia/Kolkata')->format('H:i'));
        })
        ->after(function () {
            \Log::debug('After executing daily:mrp command at ' . Carbon::now()->setTimezone('Asia/Kolkata')->format('H:i'));
        });
});

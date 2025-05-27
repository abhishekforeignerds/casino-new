<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DailyMrpReport;
use App\Models\Setting;

class DailyMrpController extends Controller
{
    /**
     * Display the Daily MRP settings page along with the latest report.
     */
    public function index()
    {
        // Fetch the latest report
        $latestReport = DailyMrpReport::latest()->first();

        // Structure the fetched data; if no report exists, send an empty array
        $fetchedData = $latestReport ? $latestReport->toArray() : [];

        // Get the current scheduled time (if you want to show it on the page)
        $dailyTaskTime = Setting::where('key', 'daily_task_time')->value('value') ?? '02:00';

        return Inertia::render('DailyMrp', [
            'dailyTaskTime' => $dailyTaskTime,
            'fetchedData'   => $fetchedData,
        ]);
    }

    /**
     * Update the daily MRP time.
     */
    public function update(Request $request)
    {
        $request->validate([
            'daily_task_time' => 'required|date_format:H:i',
        ]);

        \App\Models\Setting::updateOrCreate(
            ['key' => 'daily_task_time'],
            ['value' => $request->daily_task_time]
        );

        return redirect()->back()->with('success', 'Daily MRP time updated successfully.');
    }
}

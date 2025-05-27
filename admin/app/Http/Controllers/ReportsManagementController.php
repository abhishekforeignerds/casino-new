<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserPointsSale;
use App\Models\UserPointsClaim;
use App\Models\ClaimPointData;
use App\Models\GameResults;
use App\Models\User;
use App\Models\Users;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;


class ReportsManagementController extends Controller
{
    public function adminReport(Request $request)
    {
        $start = $request->input('start_date', date('Y-m-d'));
        $end   = $request->input('end_date',   date('Y-m-d'));
        $from  = "{$start} 00:00:00";
        $to    = "{$end}   23:59:59";

        //
        // 1) Sales grouped by sub_admin
        //
        $sales = UserPointsSale::whereBetween('user_points_sales.created_at', [$from, $to])
            ->join('user', 'user_points_sales.user_id', '=', 'user.id')
            ->select(
                'user.sub_admin_id',
                DB::raw('COUNT(*)                    AS sales_count'),
                DB::raw('SUM(user_points_sales.amount) AS sales_amount')
            )
            ->groupBy('user.sub_admin_id')
            ->get()
            ->keyBy('sub_admin_id');

        //
        // 2) Claims grouped by sub_admin
        //
        $claims = UserPointsClaim::whereBetween('user_points_claims.created_at', [$from, $to])
            ->join('user', 'user_points_claims.from_id', '=', 'user.id')
            ->select(
                'user.sub_admin_id',
                DB::raw('COUNT(*)                     AS claims_count'),
                DB::raw('SUM(user_points_claims.amount) AS claims_amount')
            )
            ->groupBy('user.sub_admin_id')
            ->get()
            ->keyBy('sub_admin_id');

        //
        // 3) Wins grouped by sub_admin
        //
        $wins = GameResults::whereBetween('game_results.created_at', [$from, $to])
            ->join('user', 'game_results.user_id', '=', 'user.id')
            ->select(
                'user.sub_admin_id',
                DB::raw('SUM(game_results.win_value) AS win_value')
            )
            ->groupBy('user.sub_admin_id')
            ->get()
            ->keyBy('sub_admin_id');

        //
        // 4) Collect all sub_admin_ids seen
        //
        $allSubs = $sales->keys()
            ->merge($claims->keys())
            ->merge($wins->keys())
            ->unique();

        
        $salesStockit = UserPointsSale::whereBetween('user_points_sales.created_at', [$from, $to])
            ->join('user', 'user_points_sales.user_id', '=', 'user.id')   // join to the `user` table
            ->select(
                'user.stockit_id',
                DB::raw('COUNT(*)                    AS sales_count'),
                DB::raw('SUM(user_points_sales.amount) AS sales_amount')
            )
            ->groupBy('user.stockit_id')
            ->get()
            ->keyBy('stockit_id');
    
        //
        // 2) Claims grouped by stockit_id
        //
        $claimsStockit = UserPointsClaim::whereBetween('user_points_claims.created_at', [$from, $to])
            ->join('user', 'user_points_claims.from_id', '=', 'user.id')
            ->select(
                'user.stockit_id',
                DB::raw('COUNT(*)                     AS claims_count'),
                DB::raw('SUM(user_points_claims.amount) AS claims_amount')
            )
            ->groupBy('user.stockit_id')
            ->get()
            ->keyBy('stockit_id');
    
        //
        // 3) Wins grouped by stockit_id
        //
        $winsStockit = GameResults::whereBetween('game_results.created_at', [$from, $to])
            ->join('user', 'game_results.user_id', '=', 'user.id')
            ->select(
                'user.stockit_id',
                DB::raw('SUM(game_results.win_value) AS win_value')
            )
            ->groupBy('user.stockit_id')
            ->get()
            ->keyBy('stockit_id');
    
        //
        // 4) All stockit_ids we saw in any of the three
        //
        $allStockits = $salesStockit->keys()
            ->merge($claimsStockit->keys())
            ->merge($winsStockit->keys())
            ->unique();

        //
        // 5) Lookup sub‑admin names & GSTINs from the `users` table
        //
        $subNames    = User::whereIn('id', $allSubs)->pluck('name', 'id');
        $totalGstin = User::whereIn('id', $allStockits)->sum('gstin_number');


        //
        // 6) Build merged array
        //
        $merged = $allSubs->map(function($sid) use ($sales, $claims, $wins, $subNames, $totalGstin) {
            $s = $sales->get($sid);
            $c = $claims->get($sid);
            $w = $wins->get($sid);

            return [
                'sub_admin_id'   => $sid,
                'sub_admin_name' => $subNames->get($sid, ''),
                'gstin_number'   => $totalGstin,
                'sales_count'    => $s ? (int)   $s->sales_count   : 0,
                'sales_amount'   => $s ? (float) $s->sales_amount  : 0,
                'claims_count'   => $c ? (int)   $c->claims_count  : 0,
                'claims_amount'  => $c ? (float) $c->claims_amount : 0,
                'win_value'      => $w ? (float) $w->win_value     : 0,
            ];
        })
        ->values()
        ->all();

        return Inertia::render('Reports/Admin', [
            'merged'  => $merged,
            'filters' => ['start_date' => $start, 'end_date' => $end],
        ]);
    }
    public function stockitReport(Request $request)
    {
         $user  = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
    
        if ($roles[0] === 'Retailer') {
            $currentPlayers = Users::where('retailer_id', auth()->id())->pluck('id');
        } elseif ($roles[0] === 'Stockit') {
            $currentPlayers = Users::where('stockit_id', auth()->id())->pluck('id');
        } else { // Super Admin
            $currentPlayers = Users::where('sub_admin_id', auth()->id())->pluck('id');
        }
    
        // read date filters
        $fromDate = $request->input('from_date');
        $toDate   = $request->input('to_date');
    
        // build the query builder
        $query = GameResults::with([
            'client.retailer',
            'client.stockit',
            'games'
        ])
        ->whereIn('user_id', $currentPlayers);
    
        // apply date filters before fetching
        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }
    
        // fetch and group
        $gameResults = $query->get()->groupBy('game_id');
    
        
        $claimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('claim_point'));
        $unClaimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($unclaims) => $unclaims->sum('unclaim_point'));
        $saleToUser = UserPointsSale::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('amount'));
    
        return Inertia::render('Reports/Stockit', [
            'gameResults'   => $gameResults,
            'claimsByUser'  => $claimsByUser,
            'unClaimsByUser'  => $unClaimsByUser,
            'saleToUser'    => $saleToUser,
            'filters'       => [
                'from_date' => $fromDate,
                'to_date'   => $toDate,
            ],
        ]);
    }
    public function adminRepoert()
    {
        $user  = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
     
   
        $currentPlayers = Users::where('sub_admin_id', auth()->id())->pluck('id');
        
    
        // read date filters
        $fromDate = $request->input('from_date');
        $toDate   = $request->input('to_date');
    
        // build the query builder
        $query = GameResults::with([
            'client.retailer',
            'client.stockit',
            'games'
        ])
        ->whereIn('user_id', $currentPlayers);
    
        // apply date filters before fetching
        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }
    
        // fetch and group
        $gameResults = $query->get()->groupBy('game_id');
    
        $claimsByUser = UserPointsClaim::whereIn('from_id', $currentPlayers)
                            ->where('status', 'claimed')
                            ->get()
                            ->groupBy('from_id')
                            ->map(fn($claims) => $claims->sum('amount'));
        $saleToUser = UserPointsSale::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('amount'));
        
        return Inertia::render('Plants/View', [
            'gameResults'   => $gameResults,
            'claimsByUser'  => $claimsByUser,
            'saleToUser'    => $saleToUser,
            'filters'       => [
                'from_date' => $fromDate,
                'to_date'   => $toDate,
            ],
        ]);
    }

    public function retailerReport(Request $request)
    {
        // $start = $request->input('start_date', date('Y-m-d'));
        // $end   = $request->input('end_date',   date('Y-m-d'));
    
        // // 1) Sales grouped by retailer
        // $sales = UserPointsSale::whereBetween('user_points_sales.created_at', ["{$start} 00:00:00", "{$end} 23:59:59"])
        //     ->join('user', 'user_points_sales.user_id', '=', 'user.id')
        //     ->select(
        //         'user.retailer_id',
        //         DB::raw('COUNT(*)                AS sales_count'),
        //         DB::raw('SUM(user_points_sales.amount) AS sales_amount')
        //     )
        //     ->groupBy('user.retailer_id')
        //     ->get()
        //     ->keyBy('retailer_id');
    
        // // 2) Claims grouped by retailer
        // $claims = UserPointsClaim::whereBetween('user_points_claims.created_at', ["{$start} 00:00:00", "{$end} 23:59:59"])
        //     ->join('user', 'user_points_claims.from_id', '=', 'user.id')
        //     ->select(
        //         'user.retailer_id',
        //         DB::raw('COUNT(*)                  AS claims_count'),
        //         DB::raw('SUM(user_points_claims.amount) AS claims_amount')
        //     )
        //     ->groupBy('user.retailer_id')
        //     ->get()
        //     ->keyBy('retailer_id');
    
        // // 3) Wins grouped by retailer
        // $wins = GameResults::whereBetween('game_results.created_at', ["{$start} 00:00:00", "{$end} 23:59:59"])
        //     ->join('user', 'game_results.user_id', '=', 'user.id')
        //     ->select(
        //         'user.retailer_id',
        //         DB::raw('SUM(game_results.win_value) AS total_win_value')
        //     )
        //     ->groupBy('user.retailer_id')
        //     ->get()
        //     ->keyBy('retailer_id');
    
        // // 4) Build the union of all retailer IDs
        // $allRetailers = $sales->keys()
        //     ->merge($claims->keys())
        //     ->merge($wins->keys())
        //     ->unique();
        // $names = User::whereIn('id', $allRetailers)->pluck('name','id');
     
        // $commissions = User::whereIn('id', $allRetailers)->pluck('gstin_number','id');
        // // print_r($commissions);die;
        // // 5) Merge into a single array
        // $merged = $allRetailers->map(function($rid) use ($sales, $claims, $wins, $names, $commissions) {
        //     $s = $sales->get($rid);
        //     $c = $claims->get($rid);
        //     $w = $wins->get($rid);
           
    
        //     return [
        //         'retailer_id'     => $rid,
        //         'sales_count'     => $s  ? (int)  $s->sales_count     : 0,
        //         'sales_amount'    => $s  ? (float)$s->sales_amount    : 0,
        //         'claims_count'    => $c  ? (int)  $c->claims_count    : 0,
        //         'claims_amount'   => $c  ? (float)$c->claims_amount   : 0,
        //         'win_value'       => $w  ? (float)$w->total_win_value : 0,
        //         'retailer_name' => $names->get($rid, ''),
        //         'gstin_number' =>  $commissions->get($rid),

        //     ];
        // })
        // ->values()
        // ->all();


  

        $user  = auth()->user();
        $roles = $user->roles->pluck('name')->toArray();
    
        if ($roles[0] === 'Retailer') {
            $currentPlayers = Users::where('retailer_id', auth()->id())->pluck('id');
        } elseif ($roles[0] === 'Stockit') {
            $currentPlayers = Users::where('stockit_id', auth()->id())->pluck('id');
        } else { // Super Admin
            $currentPlayers = Users::where('sub_admin_id', auth()->id())->pluck('id');
        }
    
        // read date filters
        $fromDate = $request->input('from_date');
        $toDate   = $request->input('to_date');
    
        // build the query builder
        $query = GameResults::with([
            'client.retailer',
            'client.stockit',
            'games'
        ])
        ->whereIn('user_id', $currentPlayers);
    
        // apply date filters before fetching
        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }
    
        // fetch and group
        $gameResults = $query->get()->groupBy('game_id');
    
        
        $claimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('claim_point'));
        $unClaimsByUser = ClaimPointData::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($unclaims) => $unclaims->sum('unclaim_point'));
        $saleToUser = UserPointsSale::whereIn('user_id', $currentPlayers)
                            ->get()
                            ->groupBy('user_id')
                            ->map(fn($claims) => $claims->sum('amount'));
    
        return Inertia::render('Reports/Retailer', [
            'gameResults'   => $gameResults,
            'claimsByUser'  => $claimsByUser,
            'unClaimsByUser'  => $unClaimsByUser,
            'saleToUser'    => $saleToUser,
            'filters'       => [
                'from_date' => $fromDate,
                'to_date'   => $toDate,
            ],
        ]);
    }

    
}

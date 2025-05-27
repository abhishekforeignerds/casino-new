<?php

namespace App\Http\Controllers;

use App\Models\UserPointsClaim;
use App\Models\User;
use App\Models\Users;
use App\Models\Plant;
use App\Models\Fund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class UserPointsClaimController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $userId = auth()->id();

        $claims = UserPointsClaim::with('fromUser:id,points')
            ->where('user_id', $userId)
            ->orderBy('created_at','desc')
            ->get()
            ->map(function($c) {
                return [
                    'id'               => $c->id,
                    'reference_number' => $c->reference_number,
                    'amount'           => (float)$c->amount,
                    'status'           => $c->status,
                    'created_at'       => $c->created_at->toDateTimeString(),
                    'user_points'      => (float)$c->fromUser->points,
                ];
            });

        return Inertia::render('Claims/View', [
            'claims' => $claims,
        ]);
    }

    public function accept($id)
    {
        $claim = UserPointsClaim::findOrFail($id);
        $user  = Users::findOrFail($claim->from_id);

        // print_r($user);die;
        if ($user->points < $claim->amount) {
            return redirect()
        ->route('claims.index')
        ->with('success', 'Insufficient points to accept this claim.');
        }

        DB::transaction(function() use($claim, $user) {
            $user->points -= $claim->amount;
            $user->save();

            $claim->status = 'claimed';
            $claim->save();
        });

        return redirect()
        ->route('claims.index')
        ->with('success', 'Claim Accepted successfully.');
    }

    public function reject($id)
    {
        $claim = UserPointsClaim::findOrFail($id);
        $claim->status = 'rejected';
        $claim->save();

        return redirect()
        ->route('claims.index')
        ->with('success', 'Claim Rejected.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(UserPointsClaim $userPointsClaim)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserPointsClaim $userPointsClaim)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserPointsClaim $userPointsClaim)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserPointsClaim $userPointsClaim)
    {
        //
    }
}

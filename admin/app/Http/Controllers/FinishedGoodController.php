<?php

namespace App\Http\Controllers;

use App\Models\Plant;
use App\Models\Game;
use App\Models\RawMaterial;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Imports\FinishedGoodsImport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use App\Models\Notification;

use Illuminate\Support\Facades\Storage;

class FinishedGoodController extends Controller
{
    public function index()
    {
        $games = Game::all();




        $allgames = $games->count();
      
        return Inertia::render('Games/View', [
            'games' => $games,
            'statusCounts' => [
                'allgames' => $allgames,
             
            ],
        ]);
    }


    public function create()
    {
        $rawMaterials =  RawMaterial::where('status', 'available')->get();
        return inertia('Games/Create',[
            'rawMaterials' => $rawMaterials,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'game_spin_time' => 'required|integer',
            'min_bet' => 'required',
            'maximum_bet' => 'required',
        ]);


        $data = $request->all();
        $data['game_spin_time'] = $request->game_spin_time;
        $data['min_bet'] = $request->min_bet;
        $data['maximum_bet'] = $request->maximum_bet;

        Game::create($data);
       
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();

        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'added',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'New Game added successfully.',
            'notification_url'  => 'finished-goods',
        ]);
        return redirect()
        ->route('games.index')
        ->with('success', 'New Game added successfully.');

    }

    public function edit($id)
    {
        $game = Game::findOrFail($id);
    
        return Inertia::render('Games/Edit', [
            'game' => $game,
        ]);
    }
    

    public function view($id)
    {
        $finishedGood = Game::findOrFail($id);

        return Inertia::render('Games/ViewFinishedGood', [
            'finishedGood' => $finishedGood,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'game_spin_time' => 'required|integer',
            'min_bet' => 'required',
            'maximum_bet' => 'required',
            'game_name' => 'nullable|string',
            'game_type' => 'nullable|string',
            'game_category' => 'nullable|string',
        ]);

        $game = Game::findOrFail($id);

        $game->update([
           
            'game_spin_time'  => $validated['game_spin_time'],
            'maximum_bet'     => $validated['maximum_bet'],
            'min_bet'         => $validated['min_bet'],
            'game_name'       => $request->game_name,
            'game_type'       => $request->game_type,
            'game_category'   => $request->game_category,
        ]);

        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();

        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'updated',
            'purpose'           => 'completed',
            'status'            => 'unread',
            'notification_text' => 'Game updated successfully.',
            'notification_url'  => 'games',
        ]);

        return redirect()->route('games.index')->with('success', 'Game updated successfully.');
    }


    public function destroy(FinishedGood $finishedGood)
    {
        $finishedGood->delete();
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
    
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'deleted',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'Finished Good Deleted successfully.',
            'notification_url'  => 'finished-goods',
        ]);
        return redirect()->route('games.index')->with('success', 'Finished Good deleted successfully.');
    }

    public function suspend($id) 
    {
        // Find the finished good by ID or fail if not found
        $finishedGood = FinishedGood::findOrFail($id);
    
        // Delete the finished good
        $finishedGood->delete();
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
    
        Notification::create([
            'from_id'           => $from_id,
            'to_id'             => $superAdmin->id ?? 1,
            'type'              => 'deleted',
            'purpose'              => 'completed',
            'status'            => 'unread',
            'notification_text' => 'Finished Good Suspended successfully.',
            'notification_url'  => 'finished-goods',
        ]);
    
        // Redirect back with a success message
        return redirect()->route('games.index')->with('success', 'Finished Good deleted successfully.');
    }
    
    public function importForm()
    {
        return inertia('FinishedGoods/Import');
    }

    // Handle the CSV import
    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt,xlsx,xls|max:2048',
        ]);
        $from_id = auth()->id();
        $superAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'Super Admin');
        })->first();
        // Load the file and validate before importing
        try {
            Excel::import(new FinishedGoodsImport, $request->file('csv_file'));

           
            
            Notification::create([
                'from_id'           => $from_id,
                'to_id'             => $superAdmin->id ?? 1,
                'type'              => 'imported',
                'purpose'              => 'completed',
                'status'            => 'unread',
                'notification_text' => 'Finished Good Imported successfully.',
                'notification_url'  => 'finished-goods',
            ]);
        } catch (ValidationException $e) {
            
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        }
    
        return redirect()->route('games.index')
            ->with('success', 'Finished Goods imported successfully.');
    }
    
}
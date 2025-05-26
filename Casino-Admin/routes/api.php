<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TicketApiController;

Route::get('/tickets/latest', [TicketApiController::class, 'latest']);
Route::get('/tickets/latest-escpos', [TicketApiController::class, 'latestEscPos']);
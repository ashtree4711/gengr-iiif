<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecipeController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/explorer', function () {
    return view('explorer');
});

Route::get('/recipes', function () {
    return view('recipes');
});

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebsiteAnalysisController;

Route::get('/analyze-website', [WebsiteAnalysisController::class, 'analyze']); 
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class WebsiteAnalysisController extends Controller
{
    /**
     * Analyze a website URL and return performance metrics using Lighthouse.
     * 
     * Executes a Node.js script that uses Lighthouse to gather performance metrics
     * like First Contentful Paint, Time to Interactive, etc.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function analyze(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'url' => ['required', 'url'],
        ]);

        $nodePath = env('NODE_PATH', '/Users/sureliyajaydeep/.nvm/versions/node/v22.13.1/bin/node');
        
        $process = new Process([
            $nodePath,
            base_path('scripts/analyze.js'),
            $validated['url'],
        ]);

        $process->setTimeout(90);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $metrics = json_decode($process->getOutput(), true);

        if (! is_array($metrics)) {
            return response()->json([
                'error' => 'Unable to parse performance metrics from analysis script.',
            ], 500);
        }

        return response()->json($metrics);
    }
}
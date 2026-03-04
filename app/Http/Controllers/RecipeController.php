<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class RecipeController extends Controller
{
    public function index(Request $request)
    {
        $recipes = Cache::remember('iiif_cookbook_recipes', 3600, function () {
            $response = Http::timeout(10)->get('https://iiif.io/api/cookbook/');
            if (!$response->ok()) {
                return [];
            }
            $html = $response->body();
            preg_match_all('/href="(\/api\/cookbook\/recipe\/[^"]+)"[^>]*>([^<]+)</i', $html, $matches, PREG_SET_ORDER);
            $items = [];
            foreach ($matches as $match) {
                $path = $match[1] ?? '';
                $title = trim(html_entity_decode($match[2] ?? ''));
                if (!$path || !$title) {
                    continue;
                }
                $items[] = [
                    'title' => $title,
                    'url' => 'https://iiif.io' . $path
                ];
            }
            return $items;
        });

        return view('recipes', ['recipes' => $recipes]);
    }
}

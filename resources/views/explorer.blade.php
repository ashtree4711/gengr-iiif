<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mimir Explorer</title>

    <link rel="icon" type="image/png" href="{{ Vite::asset('resources/img/mimir_favicon.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,900" rel="stylesheet" />

    <!-- Prevent Flash of Unstyled Content -->
    <script>
        if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <!-- Styles / Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/viewer-init.js'])
</head>
<body class="bg-white dark:bg-black text-[#1b1b18] dark:text-[#EDEDEC] min-h-screen flex flex-col font-sans overflow-hidden transition-colors duration-300">
    <header class="h-16 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-black z-10 relative">
        <img id="mimir-logo-src" src="{{ Vite::asset('resources/img/mimir_logo_lightmode.png') }}" class="hidden">
        <img id="mimir-logo-dark-src" src="{{ Vite::asset('resources/img/mimir_logo_darkmode.png') }}" class="hidden">
        <div class="flex items-center gap-4">
            <a href="/" class="flex items-center gap-2">
                <img src="{{ Vite::asset('resources/img/mimir_logo_lightmode.png') }}" alt="Mimir Logo" class="w-8 h-8 block dark:hidden">
                <img src="{{ Vite::asset('resources/img/mimir_logo_darkmode.png') }}" alt="Mimir Logo" class="w-8 h-8 hidden dark:block">
                <span class="font-black text-2xl tracking-tighter text-black dark:text-white">Mimir<span class="text-[#451F8D]">.</span></span>
            </a>
            <div class="h-6 w-px bg-black/10 dark:bg-white/10"></div>
            <span class="text-xs font-mono opacity-50 uppercase tracking-widest text-black dark:text-white">Universal IIIF Explorer</span>
        </div>

        <div class="flex items-center gap-4 flex-1 max-w-xl mx-8">
            <input type="text" id="manifest-url" placeholder="Paste IIIF Manifest URL here..."
                   class="flex-1 bg-black/5 dark:bg-white/5 border dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#451F8D]/50 transition-all text-black dark:text-white">
            <button onclick="Mimir.loadManifest(document.getElementById('manifest-url').value)"
                    class="px-4 py-2 bg-[#451F8D] text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                Load Manifest
            </button>
        </div>

        <div class="flex items-center gap-4">
            <a href="/recipes" class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-black dark:text-white">Cookbook</a>
            <details class="relative">
                <summary class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-black dark:text-white cursor-pointer list-none">
                    Examples
                </summary>
                <div class="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0b0b0b] border border-black/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                    <div class="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5">
                        Image (v3)
                    </div>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0006-text-language/manifest.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Internationalization and Multi-language Values
                    </button>
                    <button onclick="Mimir.loadManifest('https://api-digital.ub.uni-koeln.de/iiif/presentation/retro_991026310539706476_012718/manifest'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Part of a Collection
                    </button>
                    <button onclick="Mimir.loadManifest('https://api-digital.ub.uni-koeln.de/iiif/presentation/retro_991038655709706476_009279/manifest'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Large Nested Structure
                    </button>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/manifest.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Simple Annotations
                    </button>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0021-tagging/manifest.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Simple Annotations - Tagging
                    </button>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0045-css/manifest.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Annotations with HTML/CSS
                    </button>
                    <button onclick="Mimir.loadManifest('https://api-digital.ub.uni-koeln.de/iiif/presentation/retro_991046680799706476_001708/manifest'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Fulltext - Tagging
                    </button>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0011-book-3-behavior/manifest-continuous.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Behavior - Continous
                    </button>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0009-book-1/manifest.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Behavior - Paged
                    </button>

                    <div class="h-px bg-black/10 dark:bg-white/10 my-2"></div>
                    <div class="px-4 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5">
                        Image (v2)
                    </div>
                    <button onclick="Mimir.loadManifest('https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb11879408/manifest'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Image (v2)
                    </button>
                    <div class="h-px bg-black/10 dark:bg-white/10 my-2"></div>
                    <div class="px-4 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5">
                        AV
                    </div>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0002-mvm-audio/manifest.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        AV (Audio)
                    </button>
                    <button onclick="Mimir.loadManifest('https://iiif.io/api/cookbook/recipe/0003-mvm-video/manifest.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        AV (Video)
                    </button>
                    <div class="h-px bg-black/10 dark:bg-white/10 my-2"></div>
                    <div class="px-4 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5">
                        3D
                    </div>
                    <button onclick="Mimir.loadManifest('https://raw.githubusercontent.com/IIIF/3d/refs/heads/main/manifests/2_cameras/perspective_camera.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Camera perspective
                    </button>
                    <button onclick="Mimir.loadManifest('https://raw.githubusercontent.com/IIIF/3d/refs/heads/main/manifests/10_content_state/whale_comment_scope_content_state.json'); this.closest('details')?.removeAttribute('open');"
                            class="w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                        Multiple Objects
                    </button>


                </div>
            </details>

            <div class="h-6 w-px bg-black/10 dark:bg-white/10 mx-2"></div>

            <button onclick="window.toggleDarkMode()" class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Toggle Dark Mode">
                <svg id="sun-icon" class="hidden dark:block text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.93"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <svg id="moon-icon" class="block dark:hidden text-black" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
        </div>
    </header>

    <main id="mimir-container" class="flex-1 relative bg-[#050505]">
        <!-- The viewer logic injects everything here -->
    </main>
</body>
</html>

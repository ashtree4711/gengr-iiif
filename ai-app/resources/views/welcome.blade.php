<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'Gengr') }}</title>

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
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <style>
            :root {
                --gengr-primary: #451F8D;
            }
            .dots-overlay {
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 0;
                opacity: 0.4;
                background-image: radial-gradient(var(--gengr-primary) 1.5px, transparent 1.5px);
                background-size: 30px 30px;
            }
            .dark .dots-overlay {
                opacity: 0.9;
                background-color: #000000 !important;
                background-image: radial-gradient(var(--gengr-primary) 1.5px, transparent 1.5px) !important;

            }
            .glass-card {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 0, 0, 0.1);
                box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.2);
            }
            .dark .glass-card {
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8);
            }
        </style>
    </head>
    <body class="bg-[#f3f4f6] dark:bg-black text-[#111827] dark:text-white min-h-screen flex flex-col font-sans selection:bg-[#451F8D] selection:text-white transition-colors duration-500">
        <div class="dots-overlay"></div>

        <header class="p-6 lg:p-8 flex items-center justify-between relative z-10">
            <div class="flex items-center gap-3">
                <img src="{{ Vite::asset('resources/img/gengr_logo_lightmode.png') }}" alt="Gengr Logo" class="w-10 h-10 block dark:hidden">
                <img src="{{ Vite::asset('resources/img/gengr_logo_darkmode.png') }}" alt="Gengr Logo" class="w-10 h-10 hidden dark:block">
                <div class="font-black text-2xl tracking-tighter uppercase text-black dark:text-white">Gengr<span class="text-[#451F8D]">.</span></div>
            </div>
            <nav class="flex items-center gap-6 text-sm font-black uppercase tracking-widest">
                @if (Route::has('login'))
                    @auth
                        <a href="{{ url('/dashboard') }}" class="hover:text-[#451F8D] transition-colors text-black dark:text-white">Dashboard</a>
                    @else
                        <a href="{{ route('login') }}" class="hover:text-[#451F8D] transition-colors text-black dark:text-white">Log in</a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="px-6 py-2.5 bg-[#451F8D] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg">Get Started</a>
                        @endif
                    @endauth
                @endif

                <button onclick="window.toggleDarkMode()" class="p-3 rounded-xl bg-white dark:bg-black border border-black/5 dark:border-white/10 shadow-xl hover:scale-110 transition-all" title="Toggle Dark Mode">
                    <svg id="sun-icon" class="hidden dark:block text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.93"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    <svg id="moon-icon" class="block dark:hidden text-black" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
            </nav>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 relative z-10">
            <div class="max-w-5xl w-full text-center space-y-12 glass-card p-12 lg:p-24 rounded-[4rem] animate-in fade-in zoom-in duration-1000">
                <div class="inline-flex px-6 py-2 bg-[#451F8D]/10 text-[#451F8D] rounded-full text-[10px] font-black tracking-[0.3em] uppercase">
                    IIIF Explorer Engine
                </div>

                <h1 class="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-black dark:text-white">
                    Explore <br><span class="text-[#451F8D]">Universal</span> Media
                </h1>

                <p class="text-xl lg:text-2xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed font-semibold">
                    The next generation IIIF explorer. Immersive support for High-Resolution Images, Audio, Video, and 3D models in a sleek, high-performance interface.
                </p>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                    <a href="/explorer" class="w-full sm:w-auto px-12 py-6 bg-[#451F8D] text-white text-xl font-black rounded-2xl hover:scale-105 hover:shadow-[0_20px_60px_rgba(69,31,141,0.4)] transition-all shadow-2xl uppercase tracking-widest">
                        Launch Gengr
                    </a>
                    <a href="https://iiif.io" target="_blank" class="w-full sm:w-auto px-12 py-6 border-2 border-black/10 dark:border-white/20 font-black text-xl text-black dark:text-white rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all uppercase tracking-widest">
                        IIIF Docs
                    </a>
                </div>
            </div>
        </main>

        <footer class="p-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-black/40 dark:text-white/40 relative z-10">
            &copy; {{ date('Y') }} Gengr Engine. Redefining Media Exploration.
        </footer>
    </body>
</html>

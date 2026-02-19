import OpenSeadragon from 'openseadragon';
import '@google/model-viewer';

export class GengrExplorer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Gengr: Container #${containerId} not found.`);
            return;
        }
        
        this.options = {
            primaryColor: '#451F8D',
            darkMode: 'auto', // auto, light, dark, app
            logoUrl: '',
            logoUrlDark: '',
            ...options
        };

        this.currentManifest = null;
        this.osdExplorer = null;
        this.avPlayer = null;
        this.isDark = false;
        this.isBookMode = false;
        this.tileSources = [];

        // Apply theme color as CSS variable
        this.container.style.setProperty('--gengr-primary', this.options.primaryColor);
        
        // Create UI structure
        this.container.innerHTML = `
            <div id="gengr-root" class="gengr-canvas w-full h-full relative flex items-stretch overflow-hidden transition-colors duration-500">
                
                <!-- INTERNAL SIDEBAR -->
                <aside id="gengr-sidebar" class="w-0 border-r border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#000] overflow-y-auto transition-all duration-500 relative z-50">
                    <div class="p-6 min-w-[20rem]">
                        <h2 class="font-black text-sm uppercase tracking-widest mb-6 opacity-50 gengr-text">Metadata</h2>
                        <div id="gengr-metadata" class="space-y-4 text-sm gengr-text"></div>
                    </div>
                </aside>

                <div class="flex-1 relative flex flex-col min-w-0">
                    <!-- TOP BAR -->
                    <div id="gengr-top-bar" class="absolute top-0 left-0 right-0 p-6 flex items-start justify-between z-30 pointer-events-none opacity-0 transition-opacity duration-500">
                        <div class="flex gap-4 pointer-events-auto">
                            <button id="gengr-sidebar-toggle" class="gengr-toolbar-split-static p-3 hover:text-[var(--gengr-primary)] transition-colors gengr-text">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>
                            <div class="gengr-toolbar-split-static max-w-xl p-4 flex flex-col">
                                <div class="flex items-center gap-3 mb-1">
                                    <div id="gengr-media-icon" class="p-2 bg-[var(--gengr-primary)]/10 text-[var(--gengr-primary)] rounded-lg"></div>
                                    <h2 id="gengr-title" class="font-black text-sm uppercase tracking-tight line-clamp-1 gengr-text">Untitled Manifest</h2>
                                </div>
                                <p id="gengr-description" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">No description available.</p>
                            </div>
                        </div>
                    </div>

                    <div id="gengr-osd" class="absolute inset-0"></div>
                    <div id="gengr-av" class="absolute inset-0 flex items-center justify-center hidden text-white"></div>
                    <div id="gengr-3d" class="absolute inset-0 flex items-center justify-center hidden"></div>
                    
                    <div id="gengr-message" class="absolute inset-0 flex flex-col items-center justify-center z-10 hidden">
                        <img id="gengr-message-logo" src="${this.options.logoUrl}" class="w-24 h-24 mb-6 transition-transform duration-700 animate-bounce" style="animation-duration: 3s;">
                        <div class="gengr-speech-bubble p-6 bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-[2rem] shadow-2xl relative max-w-sm text-center">
                            <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-black border-t border-l border-black/10 dark:border-white/20 rotate-45"></div>
                            <p id="gengr-message-text" class="gengr-text font-bold text-sm uppercase tracking-wider">Ready to Explore</p>
                        </div>
                    </div>

                    <div id="gengr-loader" class="absolute inset-0 flex items-center justify-center bg-black/50 z-[60] hidden">
                        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--gengr-primary)]"></div>
                    </div>
                    
                    <!-- Watermark -->
                    <div class="absolute bottom-6 right-6 z-10 pointer-events-none opacity-20 dark:opacity-40 mix-blend-screen">
                        <img id="gengr-watermark" src="${this.options.logoUrl || ''}" alt="" class="w-12 h-auto">
                    </div>

                    <!-- LEFT TOOLBAR -->
                    <div id="gengr-toolbar-left" class="gengr-toolbar-split opacity-0 pointer-events-none">
                        <button id="gengr-home" class="gengr-btn" title="Back to Start">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </button>
                        <div class="w-px h-4 bg-gray-500/20 mx-1"></div>
                        <button id="gengr-zoom-in" class="gengr-btn" title="Zoom In">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                        <button id="gengr-zoom-out" class="gengr-btn" title="Zoom Out">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                    </div>

                    <!-- CENTER TOOLBAR -->
                    <div id="gengr-toolbar-center" class="gengr-toolbar-split opacity-0 pointer-events-none">
                        <button id="gengr-play-toggle" class="gengr-btn gengr-hidden" title="Play/Pause">
                            <svg id="gengr-icon-play" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            <svg id="gengr-icon-pause" class="gengr-hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        </button>
                        
                        <!-- AV Progress -->
                        <div id="gengr-av-controls" class="flex items-center gap-3 gengr-hidden">
                            <button id="gengr-back-30" class="gengr-btn" style="padding: 0.4rem;" title="Back 30s">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"></path></svg>
                            </button>
                            <div class="flex flex-col gap-0.5 min-w-[12rem]">
                                <input type="range" id="gengr-av-progress" min="0" value="0" step="0.1" class="gengr-range w-full">
                                <div class="flex justify-between text-[8px] font-black opacity-50 uppercase tracking-tighter gengr-text">
                                    <span id="gengr-av-current">0:00</span>
                                    <span id="gengr-av-total">0:00</span>
                                </div>
                            </div>
                            <button id="gengr-forward-30" class="gengr-btn" style="padding: 0.4rem;" title="Forward 30s">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"></path></svg>
                            </button>
                        </div>

                        <!-- Image Navigation -->
                        <div id="gengr-image-controls" class="flex items-center gap-2">
                            <button id="gengr-prev" class="gengr-btn" title="Previous Page">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <div id="gengr-page-num" class="text-[10px] font-black uppercase tracking-widest px-2 min-w-[4rem] text-center transition-colors duration-300 gengr-text">1 / 1</div>
                            <button id="gengr-next" class="gengr-btn" title="Next Page">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>

                    <!-- RIGHT TOOLBAR -->
                    <div id="gengr-toolbar-right" class="gengr-toolbar-split opacity-0 pointer-events-none">
                        <button id="gengr-book-toggle" class="gengr-btn" title="Toggle Book Mode">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        </button>
                        <button id="gengr-dark-toggle" class="gengr-btn" title="Toggle Dark Mode">
                            <svg id="gengr-icon-sun" class="gengr-hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.93"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            <svg id="gengr-icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        </button>
                        <div class="w-px h-4 bg-gray-500/20 mx-1"></div>
                        <button id="gengr-fullscreen" class="gengr-btn" title="Toggle Fullscreen">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.els = {
            root: this.container.querySelector('#gengr-root'),
            sidebar: this.container.querySelector('#gengr-sidebar'),
            osd: this.container.querySelector('#gengr-osd'),
            av: this.container.querySelector('#gengr-av'),
            threeD: this.container.querySelector('#gengr-3d'),
            message: this.container.querySelector('#gengr-message'),
            messageText: this.container.querySelector('#gengr-message-text'),
            messageLogo: this.container.querySelector('#gengr-message-logo'),
            loader: this.container.querySelector('#gengr-loader'),
            toolbars: this.container.querySelectorAll('.gengr-toolbar-split'),
            topBar: this.container.querySelector('#gengr-top-bar'),
            title: this.container.querySelector('#gengr-title'),
            description: this.container.querySelector('#gengr-description'),
            mediaIcon: this.container.querySelector('#gengr-media-icon'),
            pageNum: this.container.querySelector('#gengr-page-num'),
            metadataContainer: this.container.querySelector('#gengr-metadata'),
            watermark: this.container.querySelector('#gengr-watermark'),
            iconSun: this.container.querySelector('#gengr-icon-sun'),
            iconMoon: this.container.querySelector('#gengr-icon-moon'),
            iconPlay: this.container.querySelector('#gengr-icon-play'),
            iconPause: this.container.querySelector('#gengr-icon-pause'),
            avControls: this.container.querySelector('#gengr-av-controls'),
            imageControls: this.container.querySelector('#gengr-image-controls'),
            avProgress: this.container.querySelector('#gengr-av-progress'),
            avCurrent: this.container.querySelector('#gengr-av-current'),
            avTotal: this.container.querySelector('#gengr-av-total'),
            btns: {
                sidebarToggle: this.container.querySelector('#gengr-sidebar-toggle'),
                playToggle: this.container.querySelector('#gengr-play-toggle'),
                back30: this.container.querySelector('#gengr-back-30'),
                forward30: this.container.querySelector('#gengr-forward-30'),
                zoomIn: this.container.querySelector('#gengr-zoom-in'),
                zoomOut: this.container.querySelector('#gengr-zoom-out'),
                prev: this.container.querySelector('#gengr-prev'),
                next: this.container.querySelector('#gengr-next'),
                home: this.container.querySelector('#gengr-home'),
                bookToggle: this.container.querySelector('#gengr-book-toggle'),
                darkToggle: this.container.querySelector('#gengr-dark-toggle'),
                fullscreen: this.container.querySelector('#gengr-fullscreen')
            }
        };

        this.initDarkMode();
        this.injectStyles();
        this.setupToolbarEvents();
        
        // Show initial message
        this.showMessage('Ready to Explore');
    }

    injectStyles() {
        if (document.getElementById('gengr-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gengr-styles';
        style.textContent = `
            :root { --gengr-primary: #451F8D; }
            #gengr-root {
                position: absolute; inset: 0;
                display: flex; items-stretch; overflow: hidden;
                background-color: #ffffff;
            }
            .gengr-canvas {
                flex: 1; position: relative; min-width: 0;
                background-color: #f3f4f6;
                background-image: radial-gradient(var(--gengr-primary) 1.5px, transparent 1.5px);
                background-size: 30px 30px;
                font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
            }
            .gengr-text { color: #111827; }
            
            .gengr-toolbar-split, .gengr-toolbar-split-static {
                background-color: #ffffff !important;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 1rem;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                display: flex; align-items: center;
                transition: opacity 0.5s, transform 0.5s, background-color 0.3s;
            }
            .gengr-toolbar-split { position: absolute; bottom: 2rem; z-index: 40; padding: 0.5rem 0.75rem; gap: 0.5rem; }
            #gengr-toolbar-center { left: 50% !important; transform: translateX(-50%) !important; }
            #gengr-toolbar-left { left: 2rem !important; }
            #gengr-toolbar-right { right: 2rem !important; }
            
            .gengr-btn {
                padding: 0.625rem; border-radius: 0.75rem;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex; align-items: center; justify-content: center;
                background-color: transparent; border: none; cursor: pointer; color: #374151;
            }
            .gengr-btn:hover { color: var(--gengr-primary) !important; background-color: rgba(0, 0, 0, 0.05); }
            .gengr-btn:active { transform: scale(0.9); }
            
            /* DARK MODE: PURE BLACK #000000 */
            #gengr-root.gengr-dark { background-color: #000000 !important; }
            #gengr-root.gengr-dark .gengr-canvas { 
                background-color: #000000 !important;
                background-image: radial-gradient(var(--gengr-primary) 1.5px, transparent 1.5px) !important;
            }
            #gengr-root.gengr-dark #gengr-sidebar { background-color: #000000 !important; border-color: rgba(255,255,255,0.1) !important; }
            #gengr-root.gengr-dark .gengr-text { color: #ffffff !important; }
            #gengr-root.gengr-dark .gengr-toolbar-split, #gengr-root.gengr-dark .gengr-toolbar-split-static {
                background-color: #000000 !important;
                border-color: rgba(255, 255, 255, 0.15) !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
            }
            #gengr-root.gengr-dark .gengr-btn { color: #d1d5db !important; }
            #gengr-root.gengr-dark .gengr-btn:hover { color: var(--gengr-primary) !important; background-color: rgba(255, 255, 255, 0.1) !important; }
            #gengr-root.gengr-dark #gengr-page-num { color: #9ca3af !important; }
            
            #gengr-page-num {
                font-size: 10px; font-weight: 900; text-transform: uppercase;
                letter-spacing: 0.1em; padding: 0 0.5rem; min-width: 4rem; text-align: center;
            }
            
            .gengr-format-tag {
                padding: 0.25rem 0.5rem; border-radius: 0.5rem;
                font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;
            }
            .gengr-format-tag-primary { background-color: rgba(var(--gengr-primary-rgb), 0.15); color: var(--gengr-primary); }
            
            .gengr-hidden { display: none !important; }
            model-viewer { width: 100%; height: 100%; background-color: transparent; }
            video, audio { border-radius: 1rem; background: #000; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
            
            /* RANGE STYLING */
            .gengr-range {
                -webkit-appearance: none; appearance: none;
                background: transparent; cursor: pointer; height: 4px;
            }
            .gengr-range::-webkit-slider-runnable-track {
                background: rgba(var(--gengr-primary-rgb), 0.2); height: 4px; border-radius: 2px;
            }
            .gengr-range::-webkit-slider-thumb {
                -webkit-appearance: none; appearance: none;
                background: var(--gengr-primary); height: 12px; width: 12px;
                border-radius: 50%; margin-top: -4px; transition: transform 0.2s;
            }
            .gengr-range:hover::-webkit-slider-thumb { transform: scale(1.2); }

            @keyframes bounce {
                0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
            }
            .animate-bounce { animation: bounce 3s infinite; }
        `;
        document.head.appendChild(style);
        const hex = this.options.primaryColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
        this.container.style.setProperty('--gengr-primary-rgb', `${r}, ${g}, ${b}`);
    }

    initDarkMode() {
        if (this.options.darkMode === 'app') this.syncWithApp();
        else if (this.options.darkMode === 'auto') {
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            this.setDarkMode(mql.matches);
            mql.addEventListener('change', e => this.setDarkMode(e.matches));
        } else this.setDarkMode(this.options.darkMode === 'dark');
    }

    syncWithApp() {
        const checkApp = () => {
            const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
            this.setDarkMode(isDark);
        };
        checkApp();
        const observer = new MutationObserver(checkApp);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    setDarkMode(isDark) {
        this.isDark = isDark;
        this.els.root.classList.toggle('gengr-dark', isDark);
        this.els.iconSun.classList.toggle('gengr-hidden', !isDark);
        this.els.iconMoon.classList.toggle('gengr-hidden', isDark);
        
        const logo = isDark ? (this.options.logoUrlDark || this.options.logoUrl) : this.options.logoUrl;
        if (this.els.watermark) this.els.watermark.src = logo;
        if (this.els.messageLogo) this.els.messageLogo.src = logo;
    }

    setupToolbarEvents() {
        this.els.btns.sidebarToggle.onclick = () => {
            const isOpened = this.els.sidebar.style.width === '20rem';
            this.els.sidebar.style.width = isOpened ? '0' : '20rem';
        };
        this.els.btns.zoomIn.onclick = () => this.osdExplorer?.viewport.zoomBy(1.5);
        this.els.btns.zoomOut.onclick = () => this.osdExplorer?.viewport.zoomBy(0.7);
        this.els.btns.home.onclick = () => this.osdExplorer?.viewport.goHome();
        this.els.btns.prev.onclick = () => this.osdExplorer?.goToPage(this.osdExplorer.currentPage() - 1);
        this.els.btns.next.onclick = () => this.osdExplorer?.goToPage(this.osdExplorer.currentPage() + 1);
        
        this.els.btns.bookToggle.onclick = () => {
            this.isBookMode = !this.isBookMode;
            this.els.btns.bookToggle.style.color = this.isBookMode ? 'var(--gengr-primary)' : '';
            this.renderImage(this.currentManifest);
        };

        this.els.btns.playToggle.onclick = () => {
            if (!this.avPlayer) return;
            if (this.avPlayer.paused) this.avPlayer.play(); else this.avPlayer.pause();
        };

        this.els.btns.back30.onclick = () => {
            if (this.avPlayer) this.avPlayer.currentTime = Math.max(0, this.avPlayer.currentTime - 30);
        };
        this.els.btns.forward30.onclick = () => {
            if (this.avPlayer) this.avPlayer.currentTime = Math.min(this.avPlayer.duration, this.avPlayer.currentTime + 30);
        };

        this.els.avProgress.oninput = () => {
            if (this.avPlayer) this.avPlayer.currentTime = this.els.avProgress.value;
        };

        this.els.btns.darkToggle.onclick = () => {
            if (typeof window.toggleDarkMode === 'function') window.toggleDarkMode();
            else this.setDarkMode(!this.isDark);
        };
        this.els.btns.fullscreen.onclick = () => {
            if (!document.fullscreenElement) this.container.requestFullscreen();
            else document.exitFullscreen();
        };
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    async loadManifest(url) {
        this.showLoader(true); this.resetExplorers();
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const manifest = await response.json();
            this.currentManifest = manifest;
            this.render(this.detectType(manifest), manifest);
        } catch (error) {
            console.error('Gengr: Error loading manifest', error);
            this.showMessage(`Error: ${error.message}`);
        } finally { this.showLoader(false); }
    }

    detectType(manifest) {
        const str = JSON.stringify(manifest).toLowerCase();
        if (str.includes('model/gltf') || str.includes('.glb') || str.includes('.gltf')) return '3d';
        if (str.includes('"type":"video"') || str.includes('"type": "video"') || str.includes('"type":"sound"') || str.includes('"type": "sound"') || str.includes('format":"video/') || str.includes('format": "video/') || str.includes('format":"audio/') || str.includes('format": "audio/')) return 'av';
        return (manifest.items || manifest.sequences) ? 'image' : 'unknown';
    }

    render(type, manifest) {
        this.hideMessage(); this.updateTopBar(type, manifest); this.updateMetadata(manifest);
        
        this.els.btns.playToggle.classList.toggle('gengr-hidden', type !== 'av');
        this.els.avControls.classList.toggle('gengr-hidden', type !== 'av');
        this.els.imageControls.classList.toggle('gengr-hidden', type !== 'image');
        
        this.els.btns.zoomIn.classList.toggle('gengr-hidden', type !== 'image');
        this.els.btns.zoomOut.classList.toggle('gengr-hidden', type !== 'image');
        this.els.btns.bookToggle.classList.toggle('gengr-hidden', type !== 'image');

        switch (type) {
            case 'image': this.renderImage(manifest); break;
            case 'av': this.renderAV(manifest); break;
            case '3d': this.render3D(manifest); break;
            default: this.showMessage('Unsupported content type.');
        }
    }

    renderImage(manifest) {
        this.els.osd.classList.remove('hidden'); this.showToolbar(true);
        let sources = [];
        const findImageServices = (obj) => {
            if (!obj) return;
            if (obj.profile && (typeof obj.profile === 'string' && obj.profile.includes('http://iiif.io/api/image'))) {
                let id = obj.id || obj['@id']; if (id) sources.push(id.endsWith('/info.json') ? id : `${id}/info.json`); return;
            }
            if (obj.type === 'ImageService3' || obj.type === 'ImageService2' || obj.type === 'ImageService1') {
                let id = obj.id || obj['@id']; if (id) sources.push(id.endsWith('/info.json') ? id : `${id}/info.json`); return;
            }
            if (Array.isArray(obj)) obj.forEach(findImageServices);
            else if (typeof obj === 'object') Object.values(obj).forEach(findImageServices);
        };
        findImageServices(manifest);
        this.tileSources = [...new Set(sources)];
        if (this.osdExplorer) this.osdExplorer.destroy();
        if (this.tileSources.length === 0) { this.showMessage("No image services found."); this.showToolbar(true); return; }
        let finalSources = this.tileSources;
        if (this.isBookMode && this.tileSources.length > 1) {
            finalSources = [this.tileSources[0]];
            for (let i = 1; i < this.tileSources.length; i += 2) {
                const spread = [{ tileSource: this.tileSources[i], x: 0, y: 0, width: 1 }];
                if (this.tileSources[i + 1]) spread.push({ tileSource: this.tileSources[i + 1], x: 1.05, y: 0, width: 1 });
                finalSources.push(spread);
            }
        }
        this.osdExplorer = OpenSeadragon({
            element: this.els.osd, tileSources: finalSources, sequenceMode: true,
            showNavigationControl: false, showSequenceControl: false, prefixUrl: "",
            blendTime: 0.1, animationTime: 0.5, preserveViewport: true,
            visibilityRatio: 1, minZoomLevel: 0, defaultZoomLevel: 0, homeFillsExplorer: true
        });
        this.osdExplorer.addHandler('page', (e) => this.updatePageNum(e.page));
        this.updatePageNum(0);
    }

    updatePageNum(osdPageIndex) {
        const totalImages = this.tileSources.length;
        let displayString = "";
        if (!this.isBookMode) displayString = `${osdPageIndex + 1} / ${totalImages}`;
        else {
            if (osdPageIndex === 0) displayString = `1 / ${totalImages}`;
            else {
                const start = (osdPageIndex * 2);
                const end = Math.min(start + 1, totalImages);
                displayString = (start === end) ? `${start} / ${totalImages}` : `${start}-${end} / ${totalImages}`;
            }
        }
        this.els.pageNum.innerText = displayString;
    }

    updateTopBar(type, manifest) {
        this.els.topBar.style.opacity = '1';
        const getLabel = (label) => {
            if (!label) return 'Untitled';
            if (typeof label === 'string') return label;
            if (Array.isArray(label)) return getLabel(label[0]);
            if (typeof label === 'object') {
                const values = Object.values(label); return values.length > 0 ? getLabel(values[0]) : 'Untitled';
            }
            return 'Untitled';
        };
        this.els.title.innerText = getLabel(manifest.label);
        this.els.description.innerText = getLabel(manifest.description || manifest.summary || '');
        let iconSvg = '';
        if (type === 'image') iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
        else if (type === 'av') iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`;
        else iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
        this.els.mediaIcon.innerHTML = iconSvg;
    }

    updateMetadata(manifest) {
        const getLabel = (label) => {
            if (!label) return '';
            if (typeof label === 'string') return label;
            if (Array.isArray(label)) return getLabel(label[0]);
            if (typeof label === 'object') {
                const values = Object.values(label); return values.length > 0 ? getLabel(values[0]) : '';
            }
            return '';
        };
        let html = `<div class="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10"><p class="opacity-50 text-[10px] uppercase font-black mb-1 gengr-text">Title</p><p class="font-bold text-xs gengr-text">${getLabel(manifest.label)}</p></div>`;
        if (manifest.metadata) {
            manifest.metadata.forEach(item => {
                html += `<div class="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10"><p class="opacity-50 text-[10px] uppercase font-black mb-1 gengr-text">${getLabel(item.label)}</p><p class="text-xs leading-relaxed opacity-80 gengr-text">${getLabel(item.value)}</p></div>`;
            });
        }
        if (this.els.metadataContainer) this.els.metadataContainer.innerHTML = html;
    }

    renderAV(manifest) {
        this.els.av.classList.remove('hidden'); this.showToolbar(true);
        let mediaUrl = null; let mediaType = 'video';
        const findMedia = (obj) => {
            if (!obj || mediaUrl) return;
            if (obj.type === 'Video' || obj.type === 'Sound' || obj.format?.startsWith('video/') || obj.format?.startsWith('audio/')) { mediaUrl = obj.id; mediaType = (obj.type === 'Sound' || obj.format?.startsWith('audio/')) ? 'audio' : 'video'; return; }
            if (Array.isArray(obj)) obj.forEach(findMedia);
            else if (typeof obj === 'object') Object.values(obj).forEach(findMedia);
        };
        findMedia(manifest);
        if (mediaUrl) {
            const el = document.createElement(mediaType); el.src = mediaUrl; el.className = 'max-w-[80%] max-h-[80%] outline-none transition-all duration-500'; el.autoplay = true;
            el.onplay = () => { this.els.iconPlay.classList.add('gengr-hidden'); this.els.iconPause.classList.remove('gengr-hidden'); };
            el.onpause = () => { this.els.iconPlay.classList.remove('gengr-hidden'); this.els.iconPause.classList.add('gengr-hidden'); };
            el.ontimeupdate = () => {
                if (!this.els.avProgress) return;
                this.els.avProgress.value = el.currentTime;
                this.els.avCurrent.innerText = this.formatTime(el.currentTime);
            };
            el.onloadedmetadata = () => {
                this.els.avProgress.max = el.duration;
                this.els.avTotal.innerText = this.formatTime(el.duration);
            };
            this.els.av.innerHTML = ''; this.els.av.appendChild(el); this.avPlayer = el;
        }
    }

    render3D(manifest) {
        this.els.threeD.classList.remove('hidden'); this.showToolbar(true);
        this.els.btns.zoomIn.classList.add('gengr-hidden'); this.els.btns.zoomOut.classList.add('gengr-hidden'); this.els.btns.bookToggle.classList.add('gengr-hidden');
        let modelUrl = null;
        const findModel = (obj) => {
            if (!obj || modelUrl) return;
            if (obj.format?.includes('gltf') || (typeof obj.id === 'string' && (obj.id.endsWith('.glb') || obj.id.endsWith('.gltf')))) { modelUrl = obj.id; return; }
            if (Array.isArray(obj)) obj.forEach(findModel);
            else if (typeof obj === 'object') Object.values(obj).forEach(findModel);
        };
        findModel(manifest);
        if (modelUrl) { this.els.threeD.innerHTML = `<model-viewer src="${modelUrl}" camera-controls auto-rotate class="w-full h-full"></model-viewer>`; }
    }

    resetExplorers() {
        this.els.osd.classList.add('hidden'); this.els.av.classList.add('hidden'); this.els.threeD.classList.add('hidden'); this.els.message.classList.add('hidden'); this.els.topBar.style.opacity = '0'; this.showToolbar(false);
        this.els.av.innerHTML = ''; this.els.threeD.innerHTML = ''; this.avPlayer = null;
        if (this.osdExplorer) { this.osdExplorer.destroy(); this.osdExplorer = null; }
    }

    showToolbar(show) { this.els.toolbars.forEach(tb => { tb.style.opacity = show ? '1' : '0'; tb.style.pointerEvents = show ? 'auto' : 'none'; }); }
    showMessage(text) { if (this.els.messageText) this.els.messageText.innerText = text; this.els.message.classList.remove('hidden'); }
    hideMessage() { this.els.message.classList.add('hidden'); }
    showLoader(show) { this.els.loader.classList.toggle('hidden', !show); }
}

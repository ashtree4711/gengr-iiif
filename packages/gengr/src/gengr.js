import OpenSeadragon from 'openseadragon';
import '@google/model-viewer';
import iconMenu from '@tabler/icons/outline/menu-2.svg?raw';
import iconX from '@tabler/icons/outline/x.svg?raw';
import iconHome from '@tabler/icons/outline/home.svg?raw';
import iconZoomIn from '@tabler/icons/outline/zoom-in.svg?raw';
import iconZoomOut from '@tabler/icons/outline/zoom-out.svg?raw';
import iconPlay from '@tabler/icons/outline/player-play.svg?raw';
import iconPause from '@tabler/icons/outline/player-pause.svg?raw';
import iconRewindBack30 from '@tabler/icons/outline/rewind-backward-30.svg?raw';
import iconRewindForward30 from '@tabler/icons/outline/rewind-forward-30.svg?raw';
import iconChevronLeft from '@tabler/icons/outline/chevron-left.svg?raw';
import iconChevronRight from '@tabler/icons/outline/chevron-right.svg?raw';
import iconBook from '@tabler/icons/outline/book.svg?raw';
import iconSun from '@tabler/icons/outline/sun.svg?raw';
import iconMoon from '@tabler/icons/outline/moon.svg?raw';
import iconMaximize from '@tabler/icons/outline/arrows-maximize.svg?raw';
import iconMinimize from '@tabler/icons/outline/arrows-minimize.svg?raw';
import iconDiag from '@tabler/icons/outline/arrows-diagonal.svg?raw';
import iconDiagMin from '@tabler/icons/outline/arrows-diagonal-minimize-2.svg?raw';
import iconVolume from '@tabler/icons/outline/volume-2.svg?raw';
import iconMute from '@tabler/icons/outline/volume-3.svg?raw';
import iconMuteOff from '@tabler/icons/outline/volume-off.svg?raw';
import iconPhoto from '@tabler/icons/outline/photo.svg?raw';
import iconVideo from '@tabler/icons/outline/video.svg?raw';
import iconLayout from '@tabler/icons/outline/layout-grid.svg?raw';
import iconCube from '@tabler/icons/outline/cube.svg?raw';

const withIconClass = (svg) => {
    if (!svg) return '';
    return svg.replace('<svg', '<svg class="gengr-icon"');
};

const ICONS = {
    menu: withIconClass(iconMenu),
    close: withIconClass(iconX),
    home: withIconClass(iconHome),
    zoomIn: withIconClass(iconZoomIn),
    zoomOut: withIconClass(iconZoomOut),
    play: withIconClass(iconPlay),
    pause: withIconClass(iconPause),
    rewindBack30: withIconClass(iconRewindBack30),
    rewindForward30: withIconClass(iconRewindForward30),
    chevronLeft: withIconClass(iconChevronLeft),
    chevronRight: withIconClass(iconChevronRight),
    book: withIconClass(iconBook),
    sun: withIconClass(iconSun),
    moon: withIconClass(iconMoon),
    maximize: withIconClass(iconMaximize),
    minimize: withIconClass(iconMinimize),
    diag: withIconClass(iconDiag),
    diagMin: withIconClass(iconDiagMin),
    volume: withIconClass(iconVolume),
    mute: withIconClass(iconMute),
    muteOff: withIconClass(iconMuteOff),
    image: withIconClass(iconPhoto),
    av: withIconClass(iconVideo),
    collection: withIconClass(iconLayout),
    model: withIconClass(iconCube)
};

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
        this.currentParsed = null;
        this.osdExplorer = null;
        this.avPlayer = null;
        this.isDark = false;
        this.isBookMode = false;
        this.tileSources = [];
        this.avItems = [];
        this.modelItems = [];
        this.currentAvIndex = 0;
        this.currentModelIndex = 0;

        // Apply theme color as CSS variable
        this.container.style.setProperty('--gengr-primary', this.options.primaryColor);
        
        // Create UI structure
        this.container.innerHTML = `
            <div id="gengr-root" class="gengr-app w-full h-full relative flex items-stretch overflow-hidden">
                <div class="gengr-bg"></div>

                <!-- INTERNAL SIDEBAR -->
                <aside id="gengr-sidebar" class="gengr-sidebar">
                    <div class="gengr-sidebar-header">
                        <h2 class="gengr-eyebrow">Metadata</h2>
                        <button id="gengr-sidebar-close" class="gengr-icon-btn" title="Close Sidebar">
                            ${ICONS.close}
                        </button>
                    </div>
                    <div id="gengr-metadata" class="gengr-sidebar-body"></div>
                </aside>

                <div class="flex-1 relative flex flex-col min-w-0">
                    <!-- TOP BAR -->
                    <div id="gengr-top-bar" class="gengr-topbar">
                        <div class="gengr-topbar-inner">
                            <button id="gengr-sidebar-toggle" class="gengr-icon-btn" title="Toggle Sidebar">
                                ${ICONS.menu}
                            </button>
                            <div class="gengr-title-card">
                                <div class="gengr-title-row">
                                    <div id="gengr-media-icon" class="gengr-media-icon"></div>
                                    <div class="min-w-0">
                                        <h2 id="gengr-title" class="gengr-title">Untitled Manifest</h2>
                                        <p id="gengr-description" class="gengr-subtitle">No description available.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="gengr-osd" class="absolute inset-0"></div>
                    <div id="gengr-av" class="absolute inset-0 flex items-center justify-center gengr-hidden text-white"></div>
                    <div id="gengr-3d" class="absolute inset-0 flex items-center justify-center gengr-hidden"></div>
                    
                    <div id="gengr-message" class="gengr-empty gengr-hidden">
                        <div class="gengr-empty-card">
                            <img id="gengr-message-logo" src="${this.options.logoUrl}" class="gengr-empty-logo">
                            <div class="gengr-empty-text">
                                <p id="gengr-message-text" class="gengr-empty-title">Ready to Explore</p>
                                <p class="gengr-empty-sub">Load a IIIF manifest to get started.</p>
                            </div>
                        </div>
                    </div>

                    <div id="gengr-loader" class="gengr-loader gengr-hidden">
                        <div class="gengr-spinner"></div>
                        <p class="gengr-loader-text">Loading manifest...</p>
                    </div>
                    
                    <!-- Watermark -->
                    <div class="gengr-watermark">
                        <img id="gengr-watermark" src="${this.options.logoUrl || ''}" alt="" class="w-10 h-auto">
                    </div>

                    <!-- LEFT TOOLBAR -->
                    <div id="gengr-toolbar-left" class="gengr-toolbar gengr-toolbar-hidden">
                        <button id="gengr-home" class="gengr-icon-btn" title="Back to Start">
                            ${ICONS.home}
                        </button>
                        <span class="gengr-divider"></span>
                        <button id="gengr-zoom-in" class="gengr-icon-btn" title="Zoom In">
                            ${ICONS.zoomIn}
                        </button>
                        <button id="gengr-zoom-out" class="gengr-icon-btn" title="Zoom Out">
                            ${ICONS.zoomOut}
                        </button>
                    </div>

                    <!-- CENTER TOOLBAR -->
                    <div id="gengr-toolbar-center" class="gengr-toolbar gengr-toolbar-hidden">
                        <button id="gengr-play-toggle" class="gengr-icon-btn gengr-hidden" title="Play/Pause">
                            <span id="gengr-icon-play">${ICONS.play}</span>
                            <span id="gengr-icon-pause" class="gengr-hidden">${ICONS.pause}</span>
                        </button>
                        
                        <!-- AV Progress -->
                        <div id="gengr-av-controls" class="flex items-center gap-3 gengr-hidden">
                            <button id="gengr-back-30" class="gengr-icon-btn" title="Back 30s">
                                ${ICONS.rewindBack30}
                            </button>
                            <div class="flex flex-col gap-1 min-w-[12rem]">
                                <input type="range" id="gengr-av-progress" min="0" value="0" step="0.1" class="gengr-range w-full">
                                <div class="flex justify-between text-[10px] font-semibold uppercase tracking-wide gengr-text-muted">
                                    <span id="gengr-av-current">0:00</span>
                                    <span id="gengr-av-total">0:00</span>
                                </div>
                            </div>
                            <button id="gengr-forward-30" class="gengr-icon-btn" title="Forward 30s">
                                ${ICONS.rewindForward30}
                            </button>
                        </div>

                        <!-- AV Audio Controls -->
                        <div id="gengr-av-audio" class="flex items-center gap-2 gengr-hidden">
                            <div class="gengr-volume">
                                <button id="gengr-volume-toggle" class="gengr-icon-btn" title="Volume">
                                    <span id="gengr-icon-volume">${ICONS.volume}</span>
                                    <span id="gengr-icon-volume-off" class="gengr-hidden">${ICONS.mute}</span>
                                </button>
                                <div id="gengr-volume-pop" class="gengr-volume-pop gengr-hidden">
                                    <input type="range" id="gengr-volume-slider" min="0" max="1" step="0.01" value="1">
                                </div>
                            </div>
                            <button id="gengr-mute-toggle" class="gengr-icon-btn" title="Mute">
                                <span id="gengr-icon-mute">${ICONS.muteOff}</span>
                            </button>
                            <button id="gengr-av-enlarge" class="gengr-icon-btn gengr-hidden" title="Enlarge Video">
                                ${ICONS.diag}
                            </button>
                        </div>

                        <!-- Image Navigation -->
                        <div id="gengr-image-controls" class="flex items-center gap-2">
                            <button id="gengr-prev" class="gengr-icon-btn" title="Previous Page">
                                ${ICONS.chevronLeft}
                            </button>
                            <div id="gengr-page-num" class="gengr-pill">1 / 1</div>
                            <button id="gengr-next" class="gengr-icon-btn" title="Next Page">
                                ${ICONS.chevronRight}
                            </button>
                        </div>
                    </div>

                    <!-- RIGHT TOOLBAR -->
                    <div id="gengr-toolbar-right" class="gengr-toolbar gengr-toolbar-hidden">
                        <button id="gengr-book-toggle" class="gengr-icon-btn" title="Toggle Book Mode">
                            ${ICONS.book}
                        </button>
                        <button id="gengr-dark-toggle" class="gengr-icon-btn" title="Toggle Dark Mode">
                            <span id="gengr-icon-sun" class="gengr-hidden">${ICONS.sun}</span>
                            <span id="gengr-icon-moon">${ICONS.moon}</span>
                        </button>
                        <span class="gengr-divider"></span>
                        <button id="gengr-fullscreen" class="gengr-icon-btn" title="Toggle Fullscreen">
                            ${ICONS.maximize}
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.els = {
            root: this.container.querySelector('#gengr-root'),
            sidebar: this.container.querySelector('#gengr-sidebar'),
            sidebarClose: this.container.querySelector('#gengr-sidebar-close'),
            osd: this.container.querySelector('#gengr-osd'),
            av: this.container.querySelector('#gengr-av'),
            threeD: this.container.querySelector('#gengr-3d'),
            message: this.container.querySelector('#gengr-message'),
            messageText: this.container.querySelector('#gengr-message-text'),
            messageLogo: this.container.querySelector('#gengr-message-logo'),
            loader: this.container.querySelector('#gengr-loader'),
            toolbars: this.container.querySelectorAll('.gengr-toolbar'),
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
            avAudio: this.container.querySelector('#gengr-av-audio'),
            volumePop: this.container.querySelector('#gengr-volume-pop'),
            volumeSlider: this.container.querySelector('#gengr-volume-slider'),
            iconVolume: this.container.querySelector('#gengr-icon-volume'),
            iconVolumeOff: this.container.querySelector('#gengr-icon-volume-off'),
            iconMute: this.container.querySelector('#gengr-icon-mute'),
            btns: {
                sidebarToggle: this.container.querySelector('#gengr-sidebar-toggle'),
                playToggle: this.container.querySelector('#gengr-play-toggle'),
                back30: this.container.querySelector('#gengr-back-30'),
                forward30: this.container.querySelector('#gengr-forward-30'),
                volumeToggle: this.container.querySelector('#gengr-volume-toggle'),
                muteToggle: this.container.querySelector('#gengr-mute-toggle'),
                avEnlarge: this.container.querySelector('#gengr-av-enlarge'),
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
            :root { --gengr-primary: #4F46E5; }
            #gengr-root {
                position: absolute; inset: 0;
                display: flex; items-stretch; overflow: hidden;
                font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                overflow-x: hidden;
            }
            .gengr-bg {
                position: absolute; inset: 0; z-index: 0;
                background-color: #f3f4f6;
                background-image: radial-gradient(rgba(var(--gengr-primary-rgb), 0.25) 1.2px, transparent 1.2px);
                background-size: 28px 28px;
                transition: background 0.4s ease;
                pointer-events: none;
            }
            .gengr-app { position: relative; z-index: 1; }
            .gengr-text { color: #0f172a; }
            .gengr-text-muted { color: #64748b; }
            .gengr-hidden { display: none !important; }
            .gengr-loader.gengr-hidden { display: none !important; }

            .gengr-topbar {
                position: absolute; top: 1.25rem; left: 1.25rem; right: 1.25rem;
                z-index: 30; pointer-events: none; opacity: 0;
                transition: opacity 0.4s ease;
            }
            .gengr-topbar-inner { display: flex; gap: 0.75rem; align-items: center; pointer-events: auto; }
            .gengr-title-card {
                background: rgba(255,255,255,0.8);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(15,23,42,0.08);
                border-radius: 1rem; padding: 0.75rem 1rem; min-width: 0;
                box-shadow: 0 15px 30px rgba(15,23,42,0.12);
            }
            .gengr-title-row { display: flex; gap: 0.75rem; align-items: center; }
            .gengr-title { font-weight: 700; font-size: 0.95rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .gengr-subtitle { font-size: 0.75rem; color: #475569; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .gengr-media-icon {
                width: 2rem; height: 2rem; border-radius: 0.75rem;
                display: grid; place-items: center;
                background: rgba(var(--gengr-primary-rgb), 0.14);
                color: var(--gengr-primary);
            }
            .gengr-icon { width: 20px; height: 20px; }

            .gengr-sidebar {
                width: 0; border-right: 1px solid rgba(15,23,42,0.08);
                background: rgba(255,255,255,0.9);
                backdrop-filter: blur(12px);
                overflow-y: auto; overflow-x: hidden; transition: width 0.4s ease;
                position: relative; z-index: 40;
                flex: 0 0 auto;
                min-width: 0;
                pointer-events: none;
            }
            .gengr-sidebar.gengr-sidebar-open { pointer-events: auto; }
            .gengr-sidebar-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 1.25rem 1.5rem 0.5rem; min-width: 20rem;
            }
            .gengr-eyebrow {
                font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
                color: #94a3b8; font-weight: 700;
            }
            .gengr-sidebar-body { padding: 1rem 1.5rem 1.5rem; min-width: 20rem; display: grid; gap: 0.75rem; overflow-x: hidden; }
            .gengr-card {
                border-radius: 0.85rem;
                border: 1px solid rgba(15,23,42,0.08);
                background: rgba(255,255,255,0.75);
                padding: 0.9rem 1rem;
                overflow-x: hidden;
            }
            .gengr-meta-title {
                font-size: 0.65rem;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                color: #94a3b8;
                font-weight: 700;
                margin-bottom: 0.4rem;
            }
            .gengr-meta-value {
                font-size: 0.8rem;
                color: #0f172a;
                line-height: 1.5;
            }
            .gengr-list { display: grid; gap: 0.5rem; }
            .gengr-list-btn {
                width: 100%;
                text-align: left;
                font-size: 0.8rem;
                padding: 0.55rem 0.75rem;
                border-radius: 0.7rem;
                border: 1px solid rgba(15,23,42,0.08);
                background: rgba(15,23,42,0.02);
                color: #0f172a;
                transition: all 0.2s ease;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .gengr-list-btn:hover {
                border-color: rgba(var(--gengr-primary-rgb), 0.35);
                background: rgba(var(--gengr-primary-rgb), 0.08);
                color: var(--gengr-primary);
            }

            .gengr-toolbar {
                position: absolute; bottom: 1.5rem; z-index: 40;
                display: flex; align-items: center; gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                background: rgba(255,255,255,0.85);
                border: 1px solid rgba(15,23,42,0.08);
                border-radius: 1rem;
                backdrop-filter: blur(12px);
                box-shadow: 0 20px 30px rgba(15,23,42,0.12);
                transition: opacity 0.4s ease;
            }
            .gengr-toolbar-hidden { opacity: 0; pointer-events: none; }
            #gengr-toolbar-center { left: 50% !important; transform: translateX(-50%) !important; }
            #gengr-toolbar-left { left: 1.5rem !important; }
            #gengr-toolbar-right { right: 1.5rem !important; }

            .gengr-icon-btn {
                width: 2.25rem; height: 2.25rem;
                border-radius: 0.75rem;
                border: 1px solid transparent;
                background: transparent; cursor: pointer;
                display: grid; place-items: center;
                color: #0f172a;
                transition: all 0.2s ease;
            }
            .gengr-icon-btn:hover {
                color: var(--gengr-primary);
                background: rgba(var(--gengr-primary-rgb), 0.12);
                border-color: rgba(var(--gengr-primary-rgb), 0.2);
            }
            .gengr-icon-btn:active { transform: scale(0.96); }
            .gengr-divider { width: 1px; height: 1.2rem; background: rgba(148,163,184,0.4); margin: 0 0.25rem; }
            .gengr-pill {
                font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
                padding: 0.3rem 0.6rem; border-radius: 999px; color: #0f172a;
                background: rgba(15,23,42,0.05);
                min-width: 4.5rem; text-align: center;
            }

            .gengr-empty {
                position: absolute; inset: 0; z-index: 10;
                display: grid; place-items: center;
                pointer-events: none;
            }
            .gengr-empty-card {
                display: flex; align-items: center; gap: 1rem;
                padding: 1.25rem 1.5rem;
                border-radius: 1rem;
                background: rgba(255,255,255,0.85);
                border: 1px solid rgba(15,23,42,0.08);
                box-shadow: 0 20px 30px rgba(15,23,42,0.15);
                backdrop-filter: blur(10px);
            }
            .gengr-empty-logo { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }
            .gengr-empty-title { font-weight: 700; color: #0f172a; }
            .gengr-empty-sub { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }

            .gengr-loader {
                position: absolute; inset: 0; z-index: 60;
                background: rgba(15,23,42,0.55);
                display: grid; place-items: center; gap: 0.75rem;
                color: #f8fafc;
            }
            .gengr-spinner {
                width: 28px; height: 28px;
                border-radius: 999px;
                border: 3px solid rgba(248,250,252,0.3);
                border-top-color: #f8fafc;
                animation: spin 0.9s linear infinite;
            }
            .gengr-loader-text { font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; }

            .gengr-watermark {
                position: absolute; bottom: 1.5rem; right: 1.5rem;
                opacity: 0.25; pointer-events: none;
            }

            /* Scrollbar styling */
            .gengr-sidebar {
                scrollbar-width: thin;
                scrollbar-color: rgba(100,116,139,0.5) transparent;
            }
            .gengr-sidebar::-webkit-scrollbar {
                width: 6px;
            }
            .gengr-sidebar::-webkit-scrollbar-track {
                background: transparent;
            }
            .gengr-sidebar::-webkit-scrollbar-thumb {
                background-color: rgba(100,116,139,0.4);
                border-radius: 999px;
            }
            .gengr-sidebar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(100,116,139,0.7);
            }

            model-viewer { width: 100%; height: 100%; background-color: transparent; }
            video, audio { border-radius: 1rem; background: #0f172a; box-shadow: 0 25px 50px -12px rgba(15,23,42,0.5); }
            .gengr-av-wrapper { position: relative; width: 100%; height: 100%; display: grid; place-items: center; }
            .gengr-av-media { max-width: 80%; max-height: 80%; outline: none; transition: all 0.3s ease; }
            .gengr-av-media.gengr-av-full { width: 100%; height: 100%; max-width: 100%; max-height: 100%; border-radius: 0; object-fit: contain; }
            .gengr-volume { position: relative; }
            .gengr-volume-pop {
                position: absolute;
                bottom: 120%;
                left: 50%;
                transform: translateX(-50%);
                padding: 0.5rem 0.6rem;
                border-radius: 0.75rem;
                background: rgba(15,23,42,0.85);
                border: 1px solid rgba(255,255,255,0.15);
                display: grid; place-items: center;
                backdrop-filter: blur(10px);
            }
            .gengr-volume-pop input[type="range"] {
                width: 6px; height: 120px;
                writing-mode: bt-lr;
                -webkit-appearance: slider-vertical;
                background: transparent;
            }
            .gengr-volume-pop input[type="range"]::-webkit-slider-runnable-track {
                background: rgba(255,255,255,0.2); width: 6px; border-radius: 999px;
            }
            .gengr-volume-pop input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none; appearance: none;
                background: #f8fafc; height: 14px; width: 14px; border-radius: 50%;
                border: 2px solid rgba(15,23,42,0.5);
                margin-left: -4px;
            }
            .gengr-volume-pop input[type="range"]::-moz-range-track {
                background: rgba(255,255,255,0.2); width: 6px; border-radius: 999px;
            }
            .gengr-volume-pop input[type="range"]::-moz-range-thumb {
                background: #f8fafc; height: 14px; width: 14px; border-radius: 50%;
                border: 2px solid rgba(15,23,42,0.5);
            }
            #gengr-root.gengr-dark .gengr-volume-pop {
                background: rgba(15,23,42,0.95);
                border-color: rgba(148,163,184,0.3);
            }

            .gengr-eq {
                display: flex; align-items: center; gap: 6px;
                height: 48px; margin-top: 1rem;
            }
            .gengr-eq-bar {
                width: 6px; height: 8px;
                border-radius: 999px;
                background: linear-gradient(180deg, rgba(var(--gengr-primary-rgb),0.95), rgba(var(--gengr-primary-rgb),0.4));
                transform-origin: center;
            }
            .gengr-eq-playing .gengr-eq-bar {
                animation: gengr-eq 1.1s ease-in-out infinite;
            }
            .gengr-eq-bar:nth-child(2) { animation-delay: -0.2s; }
            .gengr-eq-bar:nth-child(3) { animation-delay: -0.4s; }
            .gengr-eq-bar:nth-child(4) { animation-delay: -0.6s; }
            .gengr-eq-bar:nth-child(5) { animation-delay: -0.8s; }
            @keyframes gengr-eq {
                0%, 100% { transform: scaleY(0.6); opacity: 0.6; }
                50% { transform: scaleY(1.6); opacity: 1; }
            }
            .gengr-waveform {
                width: min(520px, 80vw);
                height: 80px;
                margin-top: 1rem;
                border-radius: 0.75rem;
                background: rgba(15,23,42,0.08);
                border: 1px solid rgba(15,23,42,0.12);
            }
            #gengr-root.gengr-dark .gengr-waveform {
                background: rgba(148,163,184,0.1);
                border-color: rgba(148,163,184,0.2);
            }

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

            .gengr-format-tag {
                padding: 0.25rem 0.5rem; border-radius: 0.5rem;
                font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
            }
            .gengr-format-tag-primary { background-color: rgba(var(--gengr-primary-rgb), 0.15); color: var(--gengr-primary); }

            @keyframes spin { to { transform: rotate(360deg); } }

            #gengr-root.gengr-dark .gengr-bg {
                background-color: #000000;
                background-image: radial-gradient(rgba(var(--gengr-primary-rgb), 0.3) 1.2px, transparent 1.2px);
                background-size: 28px 28px;
            }
            #gengr-root.gengr-dark .gengr-title-card,
            #gengr-root.gengr-dark .gengr-toolbar,
            #gengr-root.gengr-dark .gengr-empty-card,
            #gengr-root.gengr-dark .gengr-sidebar {
                background: rgba(15,23,42,0.85);
                border-color: rgba(148,163,184,0.2);
                color: #e2e8f0;
            }
            #gengr-root.gengr-dark .gengr-sidebar {
                scrollbar-color: rgba(148,163,184,0.5) transparent;
            }
            #gengr-root.gengr-dark .gengr-sidebar::-webkit-scrollbar-thumb {
                background-color: rgba(148,163,184,0.45);
            }
            #gengr-root.gengr-dark .gengr-sidebar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(148,163,184,0.7);
            }
            #gengr-root.gengr-dark .gengr-card {
                background: rgba(15,23,42,0.65);
                border-color: rgba(148,163,184,0.2);
            }
            #gengr-root.gengr-dark .gengr-meta-value,
            #gengr-root.gengr-dark .gengr-list-btn,
            #gengr-root.gengr-dark .gengr-text { color: #e2e8f0; }
            #gengr-root.gengr-dark .gengr-list-btn {
                background: rgba(148,163,184,0.08);
                border-color: rgba(148,163,184,0.2);
            }
            #gengr-root.gengr-dark .gengr-list-btn:hover {
                background: rgba(var(--gengr-primary-rgb), 0.2);
                border-color: rgba(var(--gengr-primary-rgb), 0.35);
                color: #e2e8f0;
            }
            #gengr-root.gengr-dark .gengr-title,
            #gengr-root.gengr-dark .gengr-icon-btn,
            #gengr-root.gengr-dark .gengr-empty-title { color: #e2e8f0; }
            #gengr-root.gengr-dark .gengr-subtitle,
            #gengr-root.gengr-dark .gengr-text-muted,
            #gengr-root.gengr-dark .gengr-empty-sub,
            #gengr-root.gengr-dark .gengr-eyebrow { color: #94a3b8; }
            #gengr-root.gengr-dark .gengr-icon-btn:hover {
                background: rgba(var(--gengr-primary-rgb), 0.2);
                border-color: rgba(var(--gengr-primary-rgb), 0.35);
                color: #e2e8f0;
            }
            #gengr-root.gengr-dark .gengr-divider { background: rgba(148,163,184,0.4); }
            #gengr-root.gengr-dark .gengr-pill { background: rgba(148,163,184,0.15); color: #e2e8f0; }
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
            this.els.sidebar.classList.toggle('gengr-sidebar-open', !isOpened);
        };
        if (this.els.sidebarClose) {
            this.els.sidebarClose.onclick = () => {
                this.els.sidebar.style.width = '0';
                this.els.sidebar.classList.remove('gengr-sidebar-open');
            };
        }
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

        this.els.btns.volumeToggle.onclick = () => {
            this.els.volumePop.classList.toggle('gengr-hidden');
            this.els.volumePop.classList.toggle('hidden');
        };
        this.els.volumeSlider.oninput = () => {
            if (!this.avPlayer) return;
            const v = Number(this.els.volumeSlider.value);
            this.avPlayer.volume = v;
            if (v === 0) {
                this.avPlayer.muted = true;
                this.els.iconVolume.classList.add('gengr-hidden');
                this.els.iconVolumeOff.classList.remove('gengr-hidden');
            } else {
                this.avPlayer.muted = false;
                this.els.iconVolume.classList.remove('gengr-hidden');
                this.els.iconVolumeOff.classList.add('gengr-hidden');
            }
        };
        this.els.btns.muteToggle.onclick = () => {
            if (!this.avPlayer) return;
            this.avPlayer.muted = !this.avPlayer.muted;
            this.els.iconVolume.classList.toggle('gengr-hidden', this.avPlayer.muted);
            this.els.iconVolumeOff.classList.toggle('gengr-hidden', !this.avPlayer.muted);
        };
        this.els.btns.avEnlarge.onclick = () => {
            const media = this.els.av.querySelector('.gengr-av-media');
            if (!media) return;
            const isFull = media.classList.toggle('gengr-av-full');
            this.els.btns.avEnlarge.innerHTML = isFull ? ICONS.diagMin : ICONS.diag;
        };

        this.els.btns.darkToggle.onclick = () => {
            if (typeof window.toggleDarkMode === 'function') window.toggleDarkMode();
            else this.setDarkMode(!this.isDark);
        };
        this.els.btns.fullscreen.onclick = () => {
            if (!document.fullscreenElement) this.container.requestFullscreen();
            else document.exitFullscreen();
        };
        document.addEventListener('fullscreenchange', () => {
            const isFull = !!document.fullscreenElement;
            this.els.btns.fullscreen.innerHTML = isFull ? ICONS.minimize : ICONS.maximize;
        });
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
            this.currentAvIndex = 0;
            this.currentModelIndex = 0;
            this.currentParsed = this.parseManifest(manifest);
            this.render(this.currentParsed.type, manifest, this.currentParsed);
        } catch (error) {
            console.error('Gengr: Error loading manifest', error);
            this.showMessage(`Error: ${error.message}`);
        } finally { this.showLoader(false); }
    }

    detectType(manifest, parsed) {
        const mType = (manifest.type || manifest['@type'] || '').toLowerCase();
        if (mType.includes('collection')) return 'collection';
        if (parsed?.modelItems?.length) return '3d';
        if (parsed?.avItems?.length) return 'av';
        if (parsed?.imageSources?.length) return 'image';
        return (manifest.items || manifest.sequences) ? 'image' : 'unknown';
    }

    render(type, manifest, parsed) {
        this.hideMessage();
        this.updateTopBar(type, manifest, parsed);
        this.updateMetadata(manifest, parsed);
        
        this.els.btns.playToggle.classList.toggle('gengr-hidden', type !== 'av');
        this.els.avControls.classList.toggle('gengr-hidden', type !== 'av');
        this.els.avAudio.classList.toggle('gengr-hidden', type !== 'av');
        this.els.imageControls.classList.toggle('gengr-hidden', type !== 'image');
        
        this.els.btns.zoomIn.classList.toggle('gengr-hidden', type !== 'image');
        this.els.btns.zoomOut.classList.toggle('gengr-hidden', type !== 'image');
        this.els.btns.bookToggle.classList.toggle('gengr-hidden', type !== 'image');

        switch (type) {
            case 'collection': this.renderCollection(manifest, parsed); break;
            case 'image': this.renderImage(manifest, parsed); break;
            case 'av': this.renderAV(manifest, parsed); break;
            case '3d': this.render3D(manifest, parsed); break;
            default: this.showMessage('Unsupported content type.');
        }
    }

    renderImage(manifest, parsed) {
        this.els.osd.classList.remove('gengr-hidden'); this.showToolbar(true);
        this.tileSources = parsed?.imageSources?.length ? parsed.imageSources : [];
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

    updateTopBar(type, manifest, parsed) {
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
        this.els.title.innerText = parsed?.label || getLabel(manifest.label);
        this.els.description.innerText = parsed?.summary || getLabel(manifest.description || manifest.summary || '');
        let iconSvg = '';
        if (type === 'image') iconSvg = ICONS.image;
        else if (type === 'av') iconSvg = ICONS.av;
        else if (type === 'collection') iconSvg = ICONS.collection;
        else iconSvg = ICONS.model;
        this.els.mediaIcon.innerHTML = iconSvg;
    }

    updateMetadata(manifest, parsed) {
        const getLabel = (label) => {
            if (!label) return '';
            if (typeof label === 'string') return label;
            if (Array.isArray(label)) return getLabel(label[0]);
            if (typeof label === 'object') {
                const values = Object.values(label); return values.length > 0 ? getLabel(values[0]) : '';
            }
            return '';
        };
        const titleLabel = parsed?.label || getLabel(manifest.label);
        let html = `<div class="gengr-card"><p class="gengr-meta-title">Title</p><p class="gengr-meta-value">${titleLabel || 'Untitled'}</p></div>`;
        const meta = parsed?.metadata?.length ? parsed.metadata : (manifest.metadata || []);
        meta.forEach(item => {
            html += `<div class="gengr-card"><p class="gengr-meta-title">${getLabel(item.label)}</p><p class="gengr-meta-value">${getLabel(item.value)}</p></div>`;
        });
        if (parsed?.type === 'collection' && parsed?.items?.length) {
            html += `<div class="gengr-card">
                <p class="gengr-meta-title">Collection Items</p>
                <div class="gengr-list">`;
            parsed.items.forEach((item, idx) => {
                const label = item.label || `Item ${idx + 1}`;
                html += `<button data-gengr-item="${idx}" class="gengr-list-btn">${label}</button>`;
            });
            html += `</div></div>`;
        }
        if (parsed?.canvases?.length > 1) {
            html += `<div class="gengr-card">
                <p class="gengr-meta-title">Canvases</p>
                <div class="gengr-list">`;
            parsed.canvases.forEach((canvas, idx) => {
                const label = canvas.label || `Canvas ${idx + 1}`;
                html += `<button data-gengr-canvas="${idx}" class="gengr-list-btn">${label}</button>`;
            });
            html += `</div></div>`;
        }
        if (parsed?.ranges?.length) {
            html += `<div class="gengr-card">
                <p class="gengr-meta-title">Ranges</p>
                <div class="gengr-list">`;
            parsed.ranges.forEach((range, idx) => {
                const label = range.label || `Range ${idx + 1}`;
                html += `<button data-gengr-range="${idx}" class="gengr-list-btn">${label}</button>`;
            });
            html += `</div></div>`;
        }
        if (parsed?.avItems?.length > 1) {
            html += `<div class="gengr-card">
                <p class="gengr-meta-title">Playlist</p>
                <div class="gengr-list">`;
            parsed.avItems.forEach((item, idx) => {
                const label = item.label || `Track ${idx + 1}`;
                html += `<button data-gengr-av="${idx}" class="gengr-list-btn">${label}</button>`;
            });
            html += `</div></div>`;
        }
        if (parsed?.modelItems?.length > 1) {
            html += `<div class="gengr-card">
                <p class="gengr-meta-title">3D Models</p>
                <div class="gengr-list">`;
            parsed.modelItems.forEach((item, idx) => {
                const label = item.label || `Model ${idx + 1}`;
                html += `<button data-gengr-model="${idx}" class="gengr-list-btn">${label}</button>`;
            });
            html += `</div></div>`;
        }
        if (this.els.metadataContainer) {
            this.els.metadataContainer.innerHTML = html;
            this.bindSidebarActions(parsed);
        }
    }

    renderAV(manifest, parsed) {
        this.els.av.classList.remove('gengr-hidden'); this.showToolbar(true);
        this.avItems = parsed?.avItems || [];
        if (this.avItems.length === 0) { this.showMessage("No audio/video items found."); return; }
        const current = this.avItems[this.currentAvIndex] || this.avItems[0];
        const mediaUrl = current?.id || current?.url;
        const mediaType = current?.mediaType || 'video';
        if (mediaUrl) {
            const wrapper = document.createElement('div');
            wrapper.className = 'gengr-av-wrapper';

            const el = document.createElement(mediaType);
            el.crossOrigin = 'anonymous';
            el.src = mediaUrl;
            el.className = 'gengr-av-media';
            el.autoplay = true;
            el.controls = false;
            el.muted = false;
            el.volume = 1;

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
            wrapper.appendChild(el);

            if (mediaType === 'audio') {
                const eq = document.createElement('div');
                eq.className = 'gengr-eq';
                eq.innerHTML = `
                    <span class="gengr-eq-bar"></span>
                    <span class="gengr-eq-bar"></span>
                    <span class="gengr-eq-bar"></span>
                    <span class="gengr-eq-bar"></span>
                    <span class="gengr-eq-bar"></span>
                `;
                wrapper.appendChild(eq);
                el.addEventListener('play', () => wrapper.classList.add('gengr-eq-playing'));
                el.addEventListener('pause', () => wrapper.classList.remove('gengr-eq-playing'));
                el.addEventListener('ended', () => wrapper.classList.remove('gengr-eq-playing'));
            }

            this.els.btns.avEnlarge.classList.toggle('gengr-hidden', mediaType !== 'video');
            this.els.btns.avEnlarge.innerHTML = ICONS.diag;

            this.els.av.innerHTML = '';
            this.els.av.appendChild(wrapper);
            this.avPlayer = el;
            this.els.volumeSlider.value = String(this.avPlayer.volume ?? 1);
            this.els.iconVolume.classList.toggle('gengr-hidden', this.avPlayer.muted);
            this.els.iconVolumeOff.classList.toggle('gengr-hidden', !this.avPlayer.muted);
        }
    }

    render3D(manifest, parsed) {
        this.els.threeD.classList.remove('gengr-hidden'); this.showToolbar(true);
        this.els.btns.zoomIn.classList.add('gengr-hidden'); this.els.btns.zoomOut.classList.add('gengr-hidden'); this.els.btns.bookToggle.classList.add('gengr-hidden');
        this.modelItems = parsed?.modelItems || [];
        if (this.modelItems.length === 0) { this.showMessage("No 3D models found."); return; }
        const current = this.modelItems[this.currentModelIndex] || this.modelItems[0];
        const modelUrl = current?.id || current?.url;
        if (modelUrl) { this.els.threeD.innerHTML = `<model-viewer src="${modelUrl}" camera-controls auto-rotate class="w-full h-full"></model-viewer>`; }
    }

    renderCollection(manifest, parsed) {
        this.showToolbar(false);
        if (!parsed?.items?.length) {
            this.showMessage('Collection is empty or has no items.');
            return;
        }
        this.showMessage('Select an item from the sidebar to explore.');
    }

    bindSidebarActions(parsed) {
        const container = this.els.metadataContainer;
        if (!container) return;
        container.querySelectorAll('[data-gengr-item]').forEach(btn => {
            btn.onclick = () => {
                const idx = Number(btn.getAttribute('data-gengr-item'));
                const item = parsed?.items?.[idx];
                if (item?.id) this.loadManifest(item.id);
            };
        });
        container.querySelectorAll('[data-gengr-canvas]').forEach(btn => {
            btn.onclick = () => {
                const idx = Number(btn.getAttribute('data-gengr-canvas'));
                if (this.osdExplorer) this.osdExplorer.goToPage(idx);
            };
        });
        container.querySelectorAll('[data-gengr-av]').forEach(btn => {
            btn.onclick = () => {
                const idx = Number(btn.getAttribute('data-gengr-av'));
                this.currentAvIndex = idx;
                this.renderAV(this.currentManifest, this.currentParsed);
            };
        });
        container.querySelectorAll('[data-gengr-model]').forEach(btn => {
            btn.onclick = () => {
                const idx = Number(btn.getAttribute('data-gengr-model'));
                this.currentModelIndex = idx;
                this.render3D(this.currentManifest, this.currentParsed);
            };
        });
        container.querySelectorAll('[data-gengr-range]').forEach(btn => {
            btn.onclick = () => {
                const idx = Number(btn.getAttribute('data-gengr-range'));
                const range = parsed?.ranges?.[idx];
                const firstCanvasId = range?.items?.[0];
                const canvasIdx = firstCanvasId && parsed?.canvasIndexById?.[firstCanvasId];
                if (this.osdExplorer && Number.isInteger(canvasIdx)) {
                    this.osdExplorer.goToPage(canvasIdx);
                }
            };
        });
    }

    parseManifest(manifest) {
        const asArray = (val) => (Array.isArray(val) ? val : (val ? [val] : []));
        const getId = (obj) => (obj && (obj.id || obj['@id'])) || null;
        const getType = (obj) => (obj && (obj.type || obj['@type'])) || '';
        const getLabel = (label) => {
            if (!label) return '';
            if (typeof label === 'string') return label;
            if (Array.isArray(label)) return getLabel(label[0]);
            if (typeof label === 'object') {
                const values = Object.values(label);
                return values.length > 0 ? getLabel(values[0]) : '';
            }
            return '';
        };
        const getSummary = (summary) => getLabel(summary);
        const extractImageServiceId = (service) => {
            const services = asArray(service);
            for (const svc of services) {
                const type = getType(svc);
                const profile = svc?.profile;
                const id = getId(svc);
                const profileStr = typeof profile === 'string' ? profile : '';
                if (type.includes('ImageService') || profileStr.includes('iiif.io/api/image')) {
                    if (id) return id.endsWith('/info.json') ? id : `${id}/info.json`;
                }
            }
            return null;
        };
        const parseBody = (body) => {
            const bodies = asArray(body);
            const imageSources = [];
            const avItems = [];
            const modelItems = [];
            bodies.forEach(b => {
                if (!b) return;
                const type = getType(b);
                const id = getId(b);
                const format = b.format || '';
                const serviceId = extractImageServiceId(b.service || b.services);
                if (serviceId) imageSources.push(serviceId);
                else if (format.startsWith('image/') && id) imageSources.push({ type: 'image', url: id });
                if ((type === 'Video' || format.startsWith('video/')) && id) {
                    avItems.push({ id, mediaType: 'video', label: getLabel(b.label) });
                }
                if ((type === 'Sound' || format.startsWith('audio/')) && id) {
                    avItems.push({ id, mediaType: 'audio', label: getLabel(b.label) });
                }
                if ((type === 'Model' || format.includes('gltf') || (typeof id === 'string' && (id.endsWith('.glb') || id.endsWith('.gltf')))) && id) {
                    modelItems.push({ id, label: getLabel(b.label) });
                }
            });
            return { imageSources, avItems, modelItems };
        };
        const parseCanvas = (canvas) => {
            const imageSources = [];
            const avItems = [];
            const modelItems = [];
            const items = asArray(canvas.items);
            items.forEach(page => {
                const annos = asArray(page.items);
                annos.forEach(anno => {
                    const motivation = anno.motivation || '';
                    if (!motivation || motivation === 'painting') {
                        const parsed = parseBody(anno.body || anno.resource);
                        imageSources.push(...parsed.imageSources);
                        avItems.push(...parsed.avItems);
                        modelItems.push(...parsed.modelItems);
                    }
                });
            });
            const images = asArray(canvas.images);
            images.forEach(img => {
                const res = img.resource || img.body;
                const parsed = parseBody(res);
                imageSources.push(...parsed.imageSources);
            });
            return {
                id: getId(canvas),
                label: getLabel(canvas.label),
                imageSources,
                avItems,
                modelItems
            };
        };
        const manifestType = getType(manifest).toLowerCase();
        const isCollection = manifestType.includes('collection');
        const label = getLabel(manifest.label);
        const summary = getSummary(manifest.summary || manifest.description);
        const metadata = asArray(manifest.metadata);

        const canvases = [];
        const canvasIndexById = {};
        const imageSources = [];
        const avItems = [];
        const modelItems = [];

        const v3Canvases = asArray(manifest.items);
        if (v3Canvases.length) {
            v3Canvases.forEach(c => {
                const parsed = parseCanvas(c);
                const idx = canvases.length;
                canvases.push({ id: parsed.id, label: parsed.label });
                if (parsed.id) canvasIndexById[parsed.id] = idx;
                imageSources.push(...parsed.imageSources);
                avItems.push(...parsed.avItems);
                modelItems.push(...parsed.modelItems);
            });
        }
        const v2Seq = asArray(manifest.sequences)[0];
        const v2Canvases = v2Seq ? asArray(v2Seq.canvases) : [];
        if (v2Canvases.length) {
            v2Canvases.forEach(c => {
                const parsed = parseCanvas(c);
                const idx = canvases.length;
                canvases.push({ id: parsed.id, label: parsed.label });
                if (parsed.id) canvasIndexById[parsed.id] = idx;
                imageSources.push(...parsed.imageSources);
                avItems.push(...parsed.avItems);
                modelItems.push(...parsed.modelItems);
            });
        }

        const ranges = asArray(manifest.structures || manifest.ranges).map(r => ({
            id: getId(r),
            label: getLabel(r.label),
            items: asArray(r.items || r.canvases || r.members).map(getId).filter(Boolean)
        }));

        const items = asArray(manifest.items || manifest.members).map(item => ({
            id: getId(item),
            label: getLabel(item.label),
            type: getType(item)
        })).filter(i => i.id);

        const dedupe = (arr) => {
            const seen = new Set();
            return arr.filter(item => {
                const key = typeof item === 'string' ? item : JSON.stringify(item);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        };

        const parsed = {
            type: isCollection ? 'collection' : this.detectType(manifest, { imageSources, avItems, modelItems }),
            label,
            summary,
            metadata,
            canvases,
            canvasIndexById,
            imageSources: dedupe(imageSources),
            avItems: dedupe(avItems),
            modelItems: dedupe(modelItems),
            ranges,
            items
        };

        return parsed;
    }

    resetExplorers() {
        this.els.osd.classList.add('gengr-hidden'); this.els.av.classList.add('gengr-hidden'); this.els.threeD.classList.add('gengr-hidden'); this.els.message.classList.add('gengr-hidden'); this.els.topBar.style.opacity = '0'; this.showToolbar(false);
        this.els.av.innerHTML = ''; this.els.threeD.innerHTML = ''; this.avPlayer = null;
        if (this.osdExplorer) { this.osdExplorer.destroy(); this.osdExplorer = null; }
        this.avItems = []; this.modelItems = []; this.currentAvIndex = 0; this.currentModelIndex = 0;
    }

    showToolbar(show) {
        this.els.toolbars.forEach(tb => {
            tb.classList.toggle('gengr-toolbar-hidden', !show);
        });
    }
    showMessage(text) {
        if (this.els.messageText) this.els.messageText.innerText = text;
        this.els.message.classList.remove('gengr-hidden', 'hidden');
    }
    hideMessage() { this.els.message.classList.add('gengr-hidden', 'hidden'); }
    showLoader(show) {
        this.els.loader.classList.toggle('gengr-hidden', !show);
        this.els.loader.classList.toggle('hidden', !show);
    }

}

// Browser-global fallback for direct download usage
if (typeof window !== 'undefined') {
    window.GengrExplorer = GengrExplorer;
}

export default GengrExplorer;

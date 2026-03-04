<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mimir Recipes</title>

    <link rel="icon" type="image/png" href="{{ Vite::asset('resources/img/mimir_favicon.png') }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,900" rel="stylesheet" />

    <script>
        if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        .mimir-recipe-content {
            display: grid;
            gap: 1.25rem;
            background: rgba(17,17,17,0.03);
            border: 1px solid rgba(17,17,17,0.08);
            border-radius: 1.25rem;
            padding: 2rem;
        }
        .dark .mimir-recipe-content {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.16);
        }
        .mimir-recipe-content h1,
        .mimir-recipe-content h2,
        .mimir-recipe-content h3 {
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #111111;
        }
        .dark .mimir-recipe-content h1,
        .dark .mimir-recipe-content h2,
        .dark .mimir-recipe-content h3 {
            color: #ffffff;
        }
        .mimir-recipe-content p,
        .mimir-recipe-content li {
            font-size: 0.98rem;
            color: rgba(17,17,17,0.85);
            line-height: 1.7;
        }
        .dark .mimir-recipe-content p,
        .dark .mimir-recipe-content li {
            color: rgba(237,237,236,0.9);
        }
        .mimir-recipe-content ul {
            display: grid;
            gap: 0.4rem;
            list-style: none;
            padding-left: 0;
            margin: 0;
        }
        .mimir-recipe-content li {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
        }
        .mimir-recipe-content li > ul {
            margin-top: 0.5rem;
            padding-left: 1.25rem;
            width: 100%;
        }
        .mimir-recipe-content x-success-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1rem;
            height: 1rem;
            flex: 0 0 auto;
            color: #6b7280;
        }
        .mimir-recipe-content x-success-icon::before {
            content: "✓";
            font-size: 0.85rem;
            line-height: 1;
        }
        .dark .mimir-recipe-content x-success-icon {
            color: #cbd5e1;
        }
        .mimir-recipe-content a {
            color: #451F8D;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }
        .dark .mimir-recipe-content a {
            color: #c7baff;
        }
        .mimir-recipe-content a:hover {
            text-decoration: underline;
        }
        .mimir-recipe-content svg {
            max-width: 1rem;
            max-height: 1rem;
            width: 1rem;
            height: 1rem;
            display: inline-block;
            vertical-align: middle;
        }
    </style>
</head>
<body class="bg-white dark:bg-black text-[#1b1b18] dark:text-[#EDEDEC] min-h-screen flex flex-col font-sans transition-colors duration-300">
    <header class="h-16 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-black z-10 relative">
        <div class="flex items-center gap-4">
            <a href="/explorer" class="flex items-center gap-2">
                <img src="{{ Vite::asset('resources/img/mimir_logo_lightmode.png') }}" alt="Mimir Logo" class="w-8 h-8 block dark:hidden">
                <img src="{{ Vite::asset('resources/img/mimir_logo_darkmode.png') }}" alt="Mimir Logo" class="w-8 h-8 hidden dark:block">
                <span class="font-black text-2xl tracking-tighter text-black dark:text-white">Mimir<span class="text-[#451F8D]">.</span></span>
            </a>
            <div class="h-6 w-px bg-black/10 dark:bg-white/10"></div>
            <span class="text-xs font-mono opacity-50 uppercase tracking-widest text-black dark:text-white">IIIF Cookbook Recipes</span>
        </div>
        <div class="flex items-center gap-4">
            <a href="/recipes" class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-black dark:text-white">Cookbook</a>
            <a href="/explorer" class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-black dark:text-white">Explorer</a>
            <button onclick="window.toggleDarkMode()" class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Toggle Dark Mode">
                <svg id="sun-icon" class="hidden dark:block text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.93"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <svg id="moon-icon" class="block dark:hidden text-black" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
        </div>
    </header>

    <main class="flex-1 px-6 py-8">
        <div class="max-w-5xl mx-auto">
            @php ob_start(); @endphp
            <div class="mimir-recipe-content">

                <h2>
                    The following list is a mutated HTML copy from <a href="https://iiif.io/api/cookbook/" target="_blank">https://iiif.io/api/cookbook/</a>
                </h2>

                <ul>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json" title="Simplest Manifest - Image">Simplest Manifest - Image</a> (1) (use static image as content resource, w.h) </li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0002-mvm-audio/manifest.json" title="Simplest Manifest - Audio">Simplest Manifest - Audio</a> (1) (use single audio as content resource, d)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0003-mvm-video/manifest.json" title="Simplest Manifest - Video">Simplest Manifest - Video</a> (1) (use single video as content resource, w,h,d)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0004-canvas-size/manifest.json" title="Image and Canvas with Differing Dimensions">Image and Canvas with Differing Dimensions</a> (26)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0005-image-service/manifest.json" title="Support Deep Viewing with Basic Use of a IIIF Image Service">Support Deep Viewing with Basic Use of a IIIF Image Service</a> (24,25)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0006-text-language/manifest.json" title="Internationalization and Multi-language Values">Internationalization and Multi-language Values</a> (3,4,6)</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0118-multivalue/manifest.json" title="Displaying Multiple Values with Language Maps">Displaying Multiple Values with Language Maps</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0007-string-formats/manifest.json" title="Embedding HTML">Embedding HTML in descriptive properties</a> (64)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0029-metadata-anywhere/manifest.json" title="Metadata on any Resource">Metadata on any Resource</a> (21)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0008-rights/manifest.json" title="Rights">Rights statement(s)</a> (7)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0009-book-1/manifest.json" title="Simple Manifest - Book">Simple Manifest - Book</a> (19)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0011-book-3-behavior/manifest-continuous.json" title="Book behavior (paging) variations">Book behavior (paging) variations</a> (15,16,17)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0299-region/manifest.json" title="Addressing a spatial region">Addressing a spatial region</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0010-book-2-viewing-direction/manifest.json" title="Viewing direction and its effect on navigation">Viewing direction and its effect on navigation</a> (11,12,13,14)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0283-missing-image/manifest.json" title="Missing Images in a Sequence">Missing Images in a Sequence</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0117-add-image-thumbnail/manifest.json" title="Image Thumbnail for Manifest">Image Thumbnail for Manifest</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0232-image-thumbnail-canvas/manifest-av.json" title="Implementation discussion: Thumbnails on Canvases">Implementation discussion: Thumbnails on Canvases (Video)</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0232-image-thumbnail-canvas/manifest-image.json" title="Implementation discussion: Thumbnails on Canvases">Implementation discussion: Thumbnails on Canvases (Image)</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0013-placeholderCanvas/manifest.json" title="Load a Preview Image Before the Main Content">Load a Preview Image Before the Main Content</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/manifest.json" title="Audio Presentation with Accompanying Image">Audio Presentation with Accompanying Image</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0202-start-canvas/manifest.json" title="Load Manifest Beginning with a Specific Canvas">Load Manifest Beginning with a Specific Canvas</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0015-start/manifest.json" title="Begin playback at a specific point - Time-based media">Begin playback at a specific point - Time-based media</a> (65)</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0230-navdate/manifest.json" title="Navigation by Chronology">Navigation by Chronology</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0154-geo-extension/manifest.json" title="Locate a Manifest on a Web Map">Locate a Manifest on a Web Map</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0240-navPlace-on-canvases/manifest.json" title="Locate Multiple Canvases on a Web Map">Locate Multiple Canvases on a Web Map</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0234-provider/manifest.json" title="Acknowledge Content Contributors">Acknowledge Content Contributors</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0032-collection/collection.json" title="Simple Collection">Simple Collection</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0464-reuse-manifest/manifest.json" title="Reuse parts of a Manifest">Reuse parts of a Manifest</a></li>
                </ul>

                <h2 id="textual-and-other-supplementary-content">Textual and other supplementary content</h2>

                <ul>
                    <li>[Transcription of image-based content][016]</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0017-transcription-av/manifest.json" title="Providing Access to Transcript Files of A/V Content">Using Transcripts with A/V Content</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0219-using-caption-file/manifest.json" title="Using Caption and Subtitle Files with Video Content">Using Captions and Subtitles with Video Content</a></li>
                    <li>Transcription of content into XML, with XPaths to select a segment</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0046-rendering/manifest.json" title="Providing Alternative Representations">Providing Alternative Representations</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0231-transcript-meta-recipe/manifest.json" title="Transcripts, Captions, and Subtitles - General Considerations">Transcripts, Captions, and Subtitles - General Considerations</a>
                        <ul>
                            <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0017-transcription-av/manifest.json" title="Providing Access to Transcript Files of A/V Content">Providing Access to Transcript Files of A/V Content</a></li>
                            <li>[Using Annotations for Timed Text][0079]</li>
                            <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0219-using-caption-file/manifest.json" title="Using Caption and Subtitle Files with Video Content">Using Caption and Subtitle Files with Video Content</a></li>
                            <li>[A Side-by-side Transcript of a Video Recording][0253]</li>
                        </ul>
                    </li>
                    <li>Transcription of content into XML, with XPaths to select a segment</li>
                </ul>

                <h2 id="other-kinds-of-annotations">Other kinds of annotations</h2>
                <p><em>(leading on to segmentation examples later)</em></p>

                <ul>
                    <li>comments - various examples (51,52,54)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/manifest.json" title="Simplest Annotation">Simplest Annotation</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0019-html-in-annotations/manifest.json" title="HTML in Annotations">HTML in Annotations</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0045-css/manifest.json" title="CSS in an Annotation">CSS in an Annotation</a></li>
                    <li>Fragment selectors (61)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0021-tagging/manifest.json" title="Simple Annotation — Tagging">Simple Annotation - Tagging</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/manifest.json" title="Annotation with a Non-Rectangular Polygon">Annotation with a Non-Rectangular Polygon</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0258-tagging-external-resource/manifest.json" title="Tagging with an External Resource">Tagging with an External Resource</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0022-linking-with-a-hotspot/manifest.json" title="Redirecting from one Canvas to another resource (Hotspot linking)">Redirecting from one Canvas to another resource (Hotspot linking)</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0326-annotating-image-layer/manifest.json" title="Annotate a specific images or layers">Annotate a specific images or layers</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0135-annotating-point-in-canvas/manifest.json" title="Annotating a specific point of an image">Annotating a specific point of an image</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0139-geolocate-canvas-fragment/manifest.json" title="Represent Canvas Fragment as a Geographic Area on a Web Map">Geographic coordinates</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/manifest.json" title="Embedded or Referenced Annotations">Embedded or Referenced Annotations</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0306-linking-annotations-to-manifests/manifest.json" title="Linking external Annotations targeting a Canvas to a Manifest">Linking external Annotations targeting a Canvas to a Manifest</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0309-annotation-collection/manifest.json" title="Using Annotation Collections">Using Annotation collections</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/manifest.json" title="Image in annotation">Image in annotations</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0346-multilingual-annotation-body/manifest.json" title="Annotating in Multiple Languages">Annotating in Multiple Languages</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0561-text-on-image/manifest.json" title="Visible Text Resource on a Canvas">Visible Text Resource on a Canvas</a></li>
                </ul>

                <h2 id="internal-structure">Internal structure</h2>

                <ul>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0024-book-4-toc/manifest.json" title="Book with Table of contents (ranges)">Table of Contents for Book Chapters</a></li>
                    <li>table of contents (ranges) - articles in a newspaper</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0026-toc-opera/manifest.json" title="Table of Contents for A/V Content">Table of contents for A/V content</a> (26)</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0229-behavior-ranges/manifest.json" title="Adding Thumbnail Navigation and `no-nav` to a Video Resource">Adding Thumbnail Navigation and <code>no-nav</code> to a Video Resource</a></li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0027-alternative-page-order/manifest.json" title="Alternative Page Sequences">Alternative Page Sequences</a></li>
                    <li><code>sequence</code> Range with partial canvases</li>
                </ul>

                <h2 id="higher-level-structure">Higher-level structure</h2>

                <ul>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0030-multi-volume/manifest.json" title="Multi-volume Work with Individually-bound Volumes">Multi-volume Work with Individually-bound Volumes</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0031-bound-multivolume/manifest.json" title="Multiple Volumes in a Single Bound Volume">Multiple Volumes in a Single Bound Volume</a></li>
                    <li>paged Collections (from #1343)</li>
                </ul>

                <h2 id="segmentation-and-complex-resources">Segmentation and complex resources</h2>

                <ul>
                    <li><a href="/api/cookbook/recipe/0033-choice/" title="Multiple choice of images in a single view">Multiple choice of images in a single view</a> (29)</li>
                    <li><a href="/api/cookbook/recipe/0035-foldouts/" title="Foldouts, Flaps, and Maps">Foldouts, Flaps, and Maps</a></li>
                    <li><a href="/api/cookbook/recipe/0036-composition-from-multiple-images/" title="Composition from Multiple Images">Composition from Multiple Images</a> (30,31)</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0560-resources-on-a-timeline/manifest.json" title="Rendering Resources Sequentially on a Timeline">Rendering Resources Sequentially on a Timeline</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0489-multimedia-canvas/manifest.json" title="Rendering Multiple Media Types on a Time-Based Canvas">Rendering Multiple Media Types on a Time-Based Canvas</a></li>
                    <li>Multiple images and multiple choices (32,33,34)</li>
                    <li>[Annotating part of an image to a Canvas][recipe-segment-image-part] (e.g., crop out scanner) (35,36,37,38)</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0040-image-rotation-service/manifest-service.json" title="Image Rotation Two Ways">Image Rotation Two Ways</a></li>
                    <li>Reusing an image service (ImageApiSelector) (41)</li>
                    <li>non-rectangular segmentation</li>
                    <li>temporal segmentation</li>
                    <li>Audio only from video (and other xxxContentSelector scenarios)</li>
                    <li>canvas on canvas (#1191)</li>
                    <li>CSS styling</li>
                </ul>

                <h2 id="linking">Linking</h2>

                <ul>
                    <li>alternative representations (rendering (?))</li>
                    <li><x-success-icon /><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json" title="Linking to Web Page of an Object">Linking to Web Page of an Object (homepage)</a></li>
                    <li>Linking from Image API to Presentation API (via partOf as per #600, #1507)</li>
                    <li>Linking from Image API to external metadata</li>
                    <li>Linking from external metadata to Image API</li>
                    <li>Linking from external metadata to Presentation API</li>
                    <li>Linking between Presentation API representations</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0053-seeAlso/manifest.json" title="Linking to Structured Metadata">Linking to Structured Metadata</a> (8)</li>
                </ul>

                <h2 id="sharing-iiif-content">Sharing IIIF content</h2>
                <p>Recipes using <a href="https://iiif.io/api/content-state/1.0/">Content State API</a></p>

                <ul>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0466-link-for-loading-manifest/manifest.json" title="Loading a manifest with a viewer using a link">Loading a manifest with a viewer using a link</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0485-contentstate-canvas-region/manifest.json" title="Open a specific region of a canvas in a viewer">Open a specific region of a canvas in a viewer</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0540-link-for-opening-multiple-canvases/manifest.json" title="Sharing a link for opening two or more Canvases">Sharing a link for opening two or more Canvases</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0599-drag-and-drop/manifest.json" title="Drag and Drop">Drag and drop</a></li>
                </ul>

                <h2 id="technical">Technical</h2>

                <ul>
                    <li>extensions (18)</li>
                    <li>services (9,10)</li>
                    <li>Mixed version scenarios (Prezi 3+Image 2)</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0057-publishing-v2-and-v3/manifest.json" title="Making IIIF Presentation API v2 and v3 manifests available at the same URL">Making IIIF Presentation API v2 and v3 manifests available at the same URL</a></li>
                </ul>

                <h2 id="real-world-complex-objects-ideally-taken-from-actual-collections">Real-world complex objects (ideally taken from actual collections)</h2>

                <ul>
                    <li>An Image gallery</li>
                    <li>museum object (fwd ref to renderings)</li>
                    <li>A complex printed work with foldouts and choice</li>
                    <li>A music album’s audio resources</li>
                    <li>…and its image resoures</li>
                    <li>…combined to demonstrate <em>together</em></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0434-choice-av/manifest.json" title="Multiple Choice of Audio Formats in a Single View (Canvas)">Multiple Choice of Audio Formats in a Single View (Canvas)</a></li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/manifest.json" title="Table of Contents for Multiple A/V Files on a Single Canvas">Table of Contents for Multiple A/V files on a Single Canvas</a> (64)</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0065-opera-multiple-canvases/manifest.json" title="Table of Contents for Multiple A/V Files on Multiple Canvases">Table of Contents for Multiple A/V files on Multiple Canvases</a> (65)</li>
                    <li>Adaptive bit rate AV examples</li>
                    <li>A field recording</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0068-newspaper/manifest.json" title="Basic Newspaper">Basic Newspaper</a></li>
                    <li>Example with extensions and services</li>
                    <li>A manuscript with multiple orderings</li>
                    <li>a Sammelband</li>
                    <li>Archival collection (hierarchy, paging)</li>
                    <li>Thumbnail range for video navigation</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/manifest.json" title="Using Caption and Subtitle Files in Multiple Languages with Video Content">Using Caption and Subtitle Files in Multiple Languages with Video Content</a></li>
                    <li>Mixed Image Service references (a mashup, with img2 and img3 services)</li>
                    <li>Glenn Gould - score and performance scenarios (transcribing)</li>
                    <li>A Map</li>
                    <li><a href="/explorer?manifest=https://iiif.io/api/cookbook/recipe/0318-navPlace-navDate/manifest.json" title="Locating an Item in Place and Time">Locating an Item in Place and Time</a></li>
                </ul>

                <h2 id="access-control">Access Control</h2>
                <p><em>this might be in a separate auth cookbook</em></p>

                <ul>
                    <li>probe service for simple resource</li>
                    <li>auth for adaptive bit rate media (MPEG-DASH)</li>
                    <li>Anyone can deep zoom, auth reqd for hi-res download</li>
                </ul>

                <!-- acronyms.md as placeholder for API equivalent -->


            </div>
            @php
                $raw = ob_get_clean();
                $withLinks = preg_replace_callback(
                    '/<a([^>]*?)href="(https:\\/\\/iiif\\.io\\/api\\/cookbook\\/recipe\\/[^"]+)"([^>]*)>(.*?)<\\/a>/i',
                    function ($m) {
                        $manifestUrl = rtrim($m[2], '/') . '/manifest.json';
                        $href = '/explorer?manifest=' . urlencode($manifestUrl);
                        $attrs = trim($m[1] . ' ' . $m[3]);
                        if (preg_match('/class="([^"]*)"/i', $attrs, $cm)) {
                            $newClass = trim($cm[1] . ' mimir-recipe-link');
                            $attrs = preg_replace('/class="[^"]*"/i', 'class="' . $newClass . '"', $attrs, 1);
                        } else {
                            $attrs = 'class="mimir-recipe-link" ' . $attrs;
                        }
                        $attrs = trim($attrs);
                        $attrs = $attrs ? ' ' . $attrs : '';
                        return '<a href="' . $href . '"' . $attrs . '>' . $m[4] . '</a>';
                    },
                    $raw
                );
                echo $withLinks;
            @endphp
        </div>
    </main>
</body>

</html>

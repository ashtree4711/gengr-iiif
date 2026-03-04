import MimirExplorer from 'mimir-iiif-explorer';

document.addEventListener('DOMContentLoaded', () => {
    const containerId = 'mimir-container';
    const container = document.getElementById(containerId);
    if (!container) return;

    const logoLight = document.getElementById('mimir-logo-src')?.src || '';
    const logoDark = document.getElementById('mimir-logo-dark-src')?.src || '';

    const explorer = new MimirExplorer(containerId, {
        logoUrl: logoLight,
        logoUrlDark: logoDark,
        darkMode: 'app'
    });

    window.Mimir = explorer;

    const params = new URLSearchParams(window.location.search);
    const manifestUrl = params.get('iiif-content') || params.get('manifest');
    if (manifestUrl) {
        const input = document.getElementById('manifest-url');
        if (input) input.value = manifestUrl;
        explorer.loadManifest(manifestUrl);
    }
});

import { GengrExplorer } from './gengr.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize with app dark mode syncing
    window.Gengr = new GengrExplorer('gengr-container', {
        primaryColor: '#451F8D',
        darkMode: 'app',
        logoUrl: document.getElementById('gengr-logo-src').src,
        logoUrlDark: document.getElementById('gengr-logo-dark-src').src
    });
});

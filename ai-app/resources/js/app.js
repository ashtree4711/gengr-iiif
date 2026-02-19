import './bootstrap';

import.meta.glob([
    '../img/**',
]);

// Dark Mode Support
(function() {
    const setTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Initial check
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        setTheme(true);
    } else {
        setTheme(false);
    }

    // Export toggle function to window
    window.toggleDarkMode = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(!isDark);
    };
})();

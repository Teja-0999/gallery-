// ========================================
// AUTH GUARD FOR PROTECTED PAGES
// ========================================

'use strict';

(function guardProtectedPages() {
    const raw = localStorage.getItem('galleryCurrentUser');
    if (!raw) {
        window.location.replace('index.html');
        return;
    }

    try {
        const user = JSON.parse(raw);
        if (!user || !user.email) {
            window.location.replace('index.html');
        }
    } catch {
        window.location.replace('index.html');
    }
})();

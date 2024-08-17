// ==UserScript==
// @name         Forum style
// @namespace    https://gamesense.pub/
// @version      v1.0
// @description  Does some adjustments to the header
// @author       Jozkah
// @match        https://gamesense.pub/forums/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gamesense.pub
// @require      https://raw.githubusercontent.com/Jozkah/gamesense-theme/main/forum%20style.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Adjust layout when the page loads
    window.addEventListener('load', adjustLayout);

    // Adjust layout dynamically as the window is resized
    window.addEventListener('resize', adjustLayout);

    // Adjust layout when DOM content is fully loaded
    document.addEventListener('DOMContentLoaded', adjustLayout);

    // Adjust layout when the page visibility changes (e.g., when switching tabs)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            adjustLayout();
        }
    });

    // Adjust layout when the device orientation changes
    window.addEventListener('orientationchange', adjustLayout);

    // Adjust layout when the history state changes (for SPAs)
    window.addEventListener('popstate', adjustLayout);

    // Watch for changes in the DOM (if the page is dynamically updated)
    const observer = new MutationObserver(() => adjustLayout());
    observer.observe(document.body, { childList: true, subtree: true });
})();

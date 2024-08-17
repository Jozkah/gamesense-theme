// ==UserScript==
// @name         Forum style
// @namespace    https://gamesense.pub/
// @version      v1.1
// @description  Does some adjustments to the header
// @author       Jozkah
// @match        https://gamesense.pub/forums/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gamesense.pub
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Show or hide 'brdwelcome' based on the current page
    (function() {
        if (window.location.pathname.endsWith('/index.php')) {
            document.getElementById('brdwelcome').style.display = 'block';
        } else {
            document.getElementById('brdwelcome').style.display = 'none';
        }
    })();

    function adjustLayout() {
        var titleHeight = document.getElementById('brdtitle').offsetHeight;
        var menuHeight = document.getElementById('brdmenu').offsetHeight;
        var welcomeHeight = document.getElementById('brdwelcome').offsetHeight;
        var totalHeight = titleHeight + menuHeight;

        var brdHeader = document.getElementById('brdheader');
        if (brdHeader) {
            brdHeader.style.height = totalHeight + 'px';
        }

        var noticeBars = document.querySelectorAll('.notice-bar');
        var chat = document.getElementById('shout');
        var offset = totalHeight + welcomeHeight - 12; // Space between welcome and first notice bar

        noticeBars.forEach(function(noticeBar, index) {
            if (noticeBar && chat) {
                noticeBar.style.position = 'absolute';
                noticeBar.style.width = chat.offsetWidth + 1 + 'px';
                noticeBar.style.left = chat.offsetLeft - 1 + 'px';
                noticeBar.style.boxSizing = 'border-box';

                // Apply consistent margin-top to each notice bar
                noticeBar.style.marginTop = (index === 0) ? '12px' : '12px';
                noticeBar.style.top = offset + 'px';

                offset += noticeBar.offsetHeight; // Space between consecutive notice bars
            }
        });

        var mainContent = document.getElementById('brdmain');
        if (mainContent) {
            mainContent.style.marginTop = offset + 12 + 'px';
        }
    }

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

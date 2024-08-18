// ==UserScript==
// @name         Forum style
// @namespace    https://gamesense.pub/
// @version      v1.4
// @description  Does some adjustments to the header
// @author       Jozkah, NotZw3tty
// @match        https://gamesense.pub/forums/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gamesense.pub
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Jozkah/gamesense-theme/main/forum%20style.js
// @downloadURL  https://raw.githubusercontent.com/Jozkah/gamesense-theme/main/forum%20style.js
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


    let checkInterval;
    function displayCustomErrorMessage() {
        const shoutbox = document.getElementById('shout');
        if (!shoutbox) return;

        // Get the form element inside the shoutbox
        const form = shoutbox.querySelector('form');
        if (!form) return;

        const label = form.querySelector('label span');
        if (label && label.innerHTML.includes('Your connection is <strong>closed</strong>, please <strong>refresh</strong>')) {
            // Preserve the original container size
            shoutbox.style.display = 'flex';
            shoutbox.style.alignItems = 'center';
            shoutbox.style.justifyContent = 'center';
            shoutbox.innerHTML = '';

            // Create and insert the custom error message
            const errorOverlay = document.createElement('div');
            errorOverlay.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                background-color: #272726;
                width: 100%;
                height: 200px; /* Exact height to match original shoutbox */
                color: #ccc;
                overflow: hidden;
            `;
            errorOverlay.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="60" height="60" viewBox="0 0 20 20" nighteye="disabled">
                    <path fill="#e25950" d="M18.5 19h-18c-0.178 0-0.342-0.094-0.432-0.248s-0.091-0.343-0.004-0.498l9-16c0.089-0.157 0.255-0.255 0.436-0.255s0.347 0.097 0.436 0.255l9 16c0.087 0.155 0.085 0.344-0.004 0.498s-0.254 0.248-0.432 0.248zM1.355 18h16.29l-8.145-14.48-8.145 14.48z"/>
                    <path fill="#e25950" d="M9.5 14c-0.276 0-0.5-0.224-0.5-0.5v-5c0-0.276 0.224-0.5 0.5-0.5s0.5 0.224 0.5 0.5v5c0 0.276-0.224 0.5-0.5 0.5z"/>
                    <path fill="#e25950" d="M9.5 17c-0.276 0-0.5-0.224-0.5-0.5v-1c0-0.276 0.224-0.5 0.5-0.5s0.5 0.224 0.5 0.5z"/>
                </svg>
                <span style="padding: 10px;font-size: 1em;">Your connection is <strong style="color: #fff;">closed</strong>, please <strong style="color: #fff;">refresh</strong></span>
            `;

            shoutbox.appendChild(errorOverlay);
        }
    }

    displayCustomErrorMessage();
    checkInterval = setInterval(displayCustomErrorMessage, 0);




    // Listeners
    // Adjust layout when the page loads
    window.addEventListener('load', adjustLayout);
    // Adjust layout dynamically as the window is resized
    window.addEventListener('resize', adjustLayout);
    // Adjust layout when DOM content is fully loaded
    document.addEventListener('DOMContentLoaded', adjustLayout);
    // Adjust layout when the device orientation changes
    window.addEventListener('orientationchange', adjustLayout);
    // Adjust layout when the history state changes (for SPAs)
    window.addEventListener('popstate', adjustLayout);
    // Watch for changes in the DOM (if the page is dynamically updated)
    const observer = new MutationObserver(() => adjustLayout());
    observer.observe(document.body, { childList: true, subtree: true });
    // Adjust layout when the page visibility changes (e.g., when switching tabs)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            adjustLayout();
        }
    });
})();


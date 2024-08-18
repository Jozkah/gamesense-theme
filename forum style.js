// ==UserScript==
// @name         Forum style
// @namespace    https://gamesense.pub/
// @version      v1.3
// @description  Does some adjustments to the header
// @author       Jozkah
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



    // Shoutbox check
    let checkInterval;
    function checkForClosedConnection() {

        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const labelText = form.innerText || form.textContent;
            if (labelText.includes('Your connection is closed, please refresh')) {
                form.style.display = 'none'; // This hides the form
                displayMessageInShout();
                clearInterval(checkInterval);
            }
        });
    }

    function displayMessageInShout() {
        const shoutDiv = document.getElementById('shout');
        if (shoutDiv) {

            // Create a container div for the message
            const messageDiv = document.createElement('div');
            messageDiv.style.position = 'absolute';
            messageDiv.style.top = '35%';
            messageDiv.style.left = '50%';
            messageDiv.style.transform = 'translate(-50%, -50%)';
            messageDiv.style.color = 'white';
            messageDiv.style.textAlign = 'center';
            messageDiv.style.fontSize = '10px';

            // Add the image
            const imgElement = document.createElement('img');
            imgElement.className = 'statusimg';
            imgElement.src = '/static/img/warning.svg';
            imgElement.style.display = 'block';
            imgElement.style.margin = '0 auto 10px';
            imgElement.style.width = '80px';
            imgElement.style.height = '80px';

            // Set the message text
            const textElement = document.createElement('div');
            textElement.innerHTML = 'Your connection is <strong>closed</strong>, please <strong>refresh</strong>';

            // Append the image and the text to the messageDiv
            messageDiv.appendChild(imgElement);
            messageDiv.appendChild(textElement);

            // Append the messageDiv to the shoutDiv
            shoutDiv.appendChild(messageDiv);
        }
    }

    checkForClosedConnection();
    checkInterval = setInterval(checkForClosedConnection, 0);




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

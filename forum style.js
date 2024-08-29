// ==UserScript==
// @name         Forum style
// @namespace    https://gamesense.pub/
// @version      v1.7
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

    //Hide email
    (function() {
        if (window.location.href.includes('section=essentials')) {
            const emailInput = document.querySelector('input[name="req_email"]');
            if (emailInput) {
                const originalEmail = emailInput.value;

                // Create a span element to wrap the email
                const spanElement = document.createElement('span');
                spanElement.textContent = originalEmail;
                spanElement.style.filter = 'blur(5px)';
                spanElement.style.transition = 'filter 0.3s ease';

                // Replace the input field with the span element to keep the layout consistent
                emailInput.style.display = 'none'; // Hide the original input field
                emailInput.parentNode.insertBefore(spanElement, emailInput);

                // Show the real email on hover
                spanElement.addEventListener('mouseover', function() {
                    spanElement.style.filter = 'none';
                });

                // Reapply the blur when not hovering
                spanElement.addEventListener('mouseout', function() {
                    spanElement.style.filter = 'blur(5px)';
                });
            }
        }
    })();

    //Hide Authentication
    (function() {
        if (window.location.href.includes('/forums/2fa.php')) {
            // Select the recovery code element within the fieldset
            const recoveryCodeElement = document.querySelector('fieldset p:nth-child(2)');
            if (recoveryCodeElement) {
                // Extract the recovery code text after "Recovery code: "
                const originalCode = recoveryCodeElement.textContent.split(': ')[1];

                // Create a span element to wrap the recovery code
                const spanElement = document.createElement('span');
                spanElement.textContent = originalCode;
                spanElement.style.filter = 'blur(5px)';
                spanElement.style.transition = 'filter 0.3s ease';

                // Replace the text content with "Recovery code: " and the blurred span
                recoveryCodeElement.textContent = 'Recovery code: ';
                recoveryCodeElement.appendChild(spanElement);

                // Remove blur on hover
                spanElement.addEventListener('mouseover', function() {
                    spanElement.style.filter = 'none';
                });

                // Reapply blur when not hovering
                spanElement.addEventListener('mouseout', function() {
                    spanElement.style.filter = 'blur(5px)';
                });
            }
        }
    })();

    //Adjust layout automatically
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
        //var offset = totalHeight + welcomeHeight - 12; // Space between welcome and first notice bar
        var offset = totalHeight + welcomeHeight; // Start with no extra space

        // Only adjust offset if we're on /index.php
        if (window.location.pathname.endsWith('/index.php')) {
            if (noticeBars.length >= 0) {
                offset -= 12; // Reduce 12px margin before the first notice bar if on /index.php and notice bars exist
            }
        }

        noticeBars.forEach(function(noticeBar, index) {
            if (noticeBar && chat) {
                noticeBar.style.position = 'absolute';
                noticeBar.style.width = chat.offsetWidth + 1 + 'px';
                noticeBar.style.left = chat.offsetLeft - 1 + 'px';
                noticeBar.style.boxSizing = 'border-box';

                noticeBar.style.top = offset + 'px';

                offset += noticeBar.offsetHeight + 12; // Space between consecutive notice bars
            }
        });

        var mainContent = document.getElementById('brdmain');
        if (mainContent) {
            mainContent.style.marginTop = offset + 'px';
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
                <img src="/static/img/warning.svg" alt="Warning" width="60" height="60">
                <span style="padding: 10px;font-size: 1em;">Your connection is <strong style="color: #fff;">closed</strong>, please <strong style="color: #fff;">refresh</strong></span>
            `;

            shoutbox.appendChild(errorOverlay);
        }
    }

    displayCustomErrorMessage();
    checkInterval = setInterval(displayCustomErrorMessage, 0);



    //emojis stuff

    (async function() {
        const shout = document.querySelector('#shout')
        if (!shout) return

        const chat_input = shout.querySelector('#shouttext')
        const emoji_selector = shout.querySelector('#emojiselector')
        const emojis = (await getInnerText(emoji_selector)).split('\n')

        const button = element('button', { id: 'emojiselector', innerText: '😀', class: 'fake-link' }, emoji_selector.parentElement)
        button.addEventListener('click', onToggleEmojiSelector)

        const emoji_container = element('div', { id: 'emoji-container', state: false, style: {
            display: 'none',
            position: 'absolute',
            top: '-215px',
            left: '-327px',
            maxWidth: '391px',
            maxHeight: '185px', /*maxheight multiple of 23 for the buttons to fit in the container perfectly*/
            overflow: 'hidden scroll',
            gridTemplateColumns: 'repeat(auto-fill, 32px)',
            border: '1.5px solid #333333',
            color: '#D4D4D4'
        }}, element('div', { style: { isolation: 'isolate', position: 'relative' }}, button))

        emojis.forEach(emoji => {
            element('button', { class: 'emoji-button fake-link', innerText: emoji, style: {
                background: '#1d1d1c',
                border: 'none',
                padding: '5px',
                margin: '0',
                fontSize: 'inherit',
                color: 'inherit',
                textAlign: 'center',
                boxShadow: 'none',
                outline: '1px',
                cursor: 'pointer'
            }}, emoji_container).addEventListener('click', onEmojiClick)
        })

        shout.style.overflow = 'hidden'
        shout.querySelector(':scope > form').style.overflow = 'visible'
        emoji_selector.style.display = 'none'

        function onEmojiClick(event) {
            chat_input.value += event.target.innerText
        }

        function onToggleEmojiSelector() {
            const state = (emoji_container.state = !emoji_container.state)
            if (state) {
                requestAnimationFrame(() => void document.body.addEventListener('click', onToggleEmojiSelector))
                emoji_container.style.display = 'grid'
            } else {
                document.body.removeEventListener('click', onToggleEmojiSelector)
                emoji_container.style.display = 'none'
            }
        }

        async function getInnerText(e) {
            return e.innerText || new Promise(resolve => {
                new MutationObserver((_, observer) => {
                    if (e.innerText) {
                        resolve(e.innerText)
                        observer.disconnect()
                    }
                }).observe(e, { childList: true, subtree: true, characterData: true })
            })
        }

        function element(tag, properties = {}, parent = null) {
            const e = document.createElement(tag)
            for (const [property, value] of Object.entries(properties)) {
                if (property === 'class') {
                    value.split(' ').forEach(v => e.classList.add(v))
                } else if (property === 'children') {
                    value.forEach(child => e.appendChild(child))
                } else if (property === 'style') {
                    Object.assign(e.style, value)
                } else {
                    e[property] = value
                }
            }
            if (parent) parent.appendChild(e)
            return e
        }
    })()

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


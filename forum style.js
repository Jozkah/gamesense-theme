// ==UserScript==
// @name         Forum style
// @namespace    https://gamesense.pub/
// @version      1.9.0
// @description  Does some adjustments to the header
// @author       Jozkah
// @match        https://gamesense.pub/forums/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gamesense.pub
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Jozkah/gamesense-theme/main/forum%20style.js
// @downloadURL  https://raw.githubusercontent.com/Jozkah/gamesense-theme/main/forum%20style.js
// ==/UserScript==

(function () {
    'use strict';

    // ---- small helpers --------------------------------------------------

    // Wrap a string in a span that blurs until hovered. Used for email + 2FA code.
    function makeBlurredSpan(text) {
        const span = document.createElement('span');
        span.textContent = text;
        span.style.filter = 'blur(5px)';
        span.style.transition = 'filter 0.3s ease';
        span.addEventListener('mouseover', () => { span.style.filter = 'none'; });
        span.addEventListener('mouseout', () => { span.style.filter = 'blur(5px)'; });
        return span;
    }

    function element(tag, properties = {}, parent = null) {
        const e = document.createElement(tag);
        for (const [property, value] of Object.entries(properties)) {
            if (property === 'class') {
                value.split(' ').forEach(v => e.classList.add(v));
            } else if (property === 'children') {
                value.forEach(child => e.appendChild(child));
            } else if (property === 'style') {
                Object.assign(e.style, value);
            } else {
                e[property] = value;
            }
        }
        if (parent) parent.appendChild(e);
        return e;
    }

    // ---- brdwelcome visibility ------------------------------------------

    (function () {
        const welcome = document.getElementById('brdwelcome');
        if (!welcome) return;
        welcome.style.display = window.location.pathname.endsWith('/index.php') ? 'block' : 'none';
    })();

    // ---- hide email -----------------------------------------------------

    (function () {
        if (!window.location.href.includes('section=essentials')) return;
        const emailInput = document.querySelector('input[name="req_email"]');
        if (!emailInput) return;

        const span = makeBlurredSpan(emailInput.value);
        emailInput.style.display = 'none';
        emailInput.parentNode.insertBefore(span, emailInput);
    })();

    // ---- hide 2FA recovery code -----------------------------------------

    (function () {
        if (!window.location.href.includes('/forums/2fa.php')) return;
        const recoveryCodeElement = document.querySelector('fieldset p:nth-child(2)');
        if (!recoveryCodeElement) return;

        const parts = recoveryCodeElement.textContent.split(': ');
        if (parts.length < 2) return;

        const span = makeBlurredSpan(parts[1]);
        recoveryCodeElement.textContent = 'Recovery code: ';
        recoveryCodeElement.appendChild(span);
    })();

    // ---- layout adjustment ----------------------------------------------

    function adjustLayout() {
        const brdtitle = document.getElementById('brdtitle');
        const brdmenu = document.getElementById('brdmenu');
        const brdwelcome = document.getElementById('brdwelcome');
        // These three are required to compute the header offset; bail if missing.
        if (!brdtitle || !brdmenu || !brdwelcome) return;

        const totalHeight = brdtitle.offsetHeight + brdmenu.offsetHeight;
        const welcomeHeight = brdwelcome.offsetHeight;

        const brdHeader = document.getElementById('brdheader');
        if (brdHeader) {
            brdHeader.style.height = totalHeight + 'px';
        }

        const noticeBars = document.querySelectorAll('.notice-bar');
        const chat = document.getElementById('shout');
        let offset = totalHeight + welcomeHeight;

        // Reduce the 12px margin before the first notice bar on the index page.
        if (window.location.pathname.endsWith('/index.php') && noticeBars.length > 0) {
            offset -= 12;
        }

        if (chat) {
            noticeBars.forEach(function (noticeBar) {
                noticeBar.style.position = 'absolute';
                noticeBar.style.width = (chat.offsetWidth + 1) + 'px';
                noticeBar.style.left = (chat.offsetLeft - 1) + 'px';
                noticeBar.style.boxSizing = 'border-box';
                noticeBar.style.top = offset + 'px';
                offset += noticeBar.offsetHeight + 12;
            });
        }

        const mainContent = document.getElementById('brdmain');
        if (mainContent) {
            mainContent.style.marginTop = offset + 'px';
        }
    }

    // Coalesce many triggers into one layout pass per frame.
    let layoutScheduled = false;
    function scheduleLayout() {
        if (layoutScheduled) return;
        layoutScheduled = true;
        requestAnimationFrame(() => {
            layoutScheduled = false;
            adjustLayout();
        });
    }

    // ---- shoutbox "connection closed" overlay ---------------------------

    function displayCustomErrorMessage() {
        const shoutbox = document.getElementById('shout');
        if (!shoutbox) return false;

        const form = shoutbox.querySelector('form');
        if (!form) return false;

        const label = form.querySelector('label span');
        if (!label || !label.innerHTML.includes('Your connection is <strong>closed</strong>, please <strong>refresh</strong>')) {
            return false;
        }

        shoutbox.style.display = 'flex';
        shoutbox.style.alignItems = 'center';
        shoutbox.style.justifyContent = 'center';
        shoutbox.innerHTML = '';

        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background-color: #272726;
            width: 100%;
            height: 200px;
            color: #ccc;
            overflow: hidden;
        `;
        errorOverlay.innerHTML = `
            <img src="/static/img/warning.svg" alt="Warning" width="60" height="60">
            <span style="padding: 10px;font-size: 1em;">Your connection is <strong style="color: #fff;">closed</strong>, please <strong style="color: #fff;">refresh</strong></span>
        `;
        shoutbox.appendChild(errorOverlay);
        return true; // overlay applied
    }

    // ---- persistent payment history -------------------------------------
    // The "Recent payment activity" table only shows the last few charges.
    // We scrape it on every visit, merge into localStorage, and re-render the
    // full accumulated history so more than the server's cap is visible.

    const PAYMENT_STORAGE_KEY = 'gs_payment_history_v1';
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function ordinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // Convert "Today HH:MM:SS" / "Yesterday HH:MM:SS" into an absolute string
    // matching the server format ("7th Jun 2026 15:11:55"). Other formats pass through.
    function normalizePaymentDate(text) {
        const trimmed = text.trim();
        const m = /^(Today|Yesterday)\s+(.+)$/.exec(trimmed);
        if (!m) return trimmed;

        const d = new Date();
        if (m[1] === 'Yesterday') d.setDate(d.getDate() - 1);
        return `${ordinal(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()} ${m[2]}`;
    }

    function paymentRowKey(row) {
        return [row.date, row.type, row.amount, row.for, row.status].join('||');
    }

    function loadPaymentHistory() {
        try {
            const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function savePaymentHistory(rows) {
        try {
            localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(rows));
        } catch (e) { /* quota / disabled storage — ignore */ }
    }

    function renderPaymentHistory() {
        if (!window.location.pathname.endsWith('/payment.php')) return;

        // Locate the "Recent payment activity" table via its legend.
        let table = null;
        document.querySelectorAll('legend').forEach(legend => {
            if (!table && legend.textContent.trim() === 'Recent payment activity') {
                table = legend.closest('fieldset').querySelector('table');
            }
        });
        if (!table) return;

        const tbody = table.querySelector('tbody') || table;
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // First row is the header (contains <th>); keep a reference, drop the rest.
        const headerRow = allRows.find(tr => tr.querySelector('th'));

        // Parse the data rows the server gave us this visit (newest first).
        const scraped = [];
        allRows.forEach(tr => {
            if (tr.querySelector('th')) return; // skip header
            const cells = tr.querySelectorAll('td');
            if (cells.length < 5) return;
            scraped.push({
                date: normalizePaymentDate(cells[0].textContent),
                type: cells[1].textContent.trim(),
                amount: cells[2].textContent.trim(),
                for: cells[3].textContent.trim(),
                status: cells[4].textContent.trim(),
            });
        });

        // Merge: prepend rows we haven't stored before, preserving newest-first order.
        const stored = loadPaymentHistory();
        const storedKeys = new Set(stored.map(paymentRowKey));
        const fresh = scraped.filter(r => !storedKeys.has(paymentRowKey(r)));
        const merged = fresh.concat(stored);
        savePaymentHistory(merged);

        // Re-render: header + every stored row.
        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            if (tr !== headerRow) tr.remove();
        });

        const frag = document.createDocumentFragment();
        merged.forEach(row => {
            const tr = document.createElement('tr');
            [row.date, row.type, row.amount, row.for, row.status].forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            // Tint failed charges so they're easy to spot in a long list.
            if (/^fail/i.test(row.status)) tr.style.opacity = '0.55';
            frag.appendChild(tr);
        });
        tbody.appendChild(frag);

        // Caption with count + clear control (inserted once, above the table).
        const fieldset = table.closest('fieldset');
        if (fieldset && !fieldset.querySelector('.gs-payment-history-bar')) {
            const bar = document.createElement('p');
            bar.className = 'gs-payment-history-bar';
            bar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

            const count = document.createElement('span');
            count.textContent = `Tracked locally: ${merged.length} payment${merged.length === 1 ? '' : 's'}`;

            const clear = document.createElement('a');
            clear.href = '#';
            clear.textContent = 'Clear history';
            clear.addEventListener('click', (ev) => {
                ev.preventDefault();
                if (confirm('Clear the locally-stored payment history? This only affects your browser.')) {
                    savePaymentHistory([]);
                    window.location.reload();
                }
            });

            bar.appendChild(count);
            bar.appendChild(clear);
            table.parentNode.insertBefore(bar, table);
        } else if (fieldset) {
            const count = fieldset.querySelector('.gs-payment-history-bar span');
            if (count) count.textContent = `Tracked locally: ${merged.length} payment${merged.length === 1 ? '' : 's'}`;
        }
    }

    // ---- emoji selector -------------------------------------------------

    (async function () {
        const shout = document.querySelector('#shout');
        if (!shout) return;

        const chat_input = shout.querySelector('#shouttext');
        const emoji_selector = shout.querySelector('#emojiselector');
        if (!chat_input || !emoji_selector) return;

        const emojis = (await getInnerText(emoji_selector)).split('\n');

        // Rename the original <select> so we don't have two #emojiselector elements.
        emoji_selector.id = 'emojiselector-native';

        const button = element('button', { id: 'emojiselector', innerText: '😀', class: 'fake-link' }, emoji_selector.parentElement);
        button.addEventListener('click', onToggleEmojiSelector);

        const emoji_container = element('div', { id: 'emoji-container', state: false, style: {
            display: 'none',
            position: 'absolute',
            top: '-215px',
            left: '-328px',
            maxWidth: '391px',
            maxHeight: '185px', /* multiple of 23 so buttons fit perfectly */
            overflow: 'hidden scroll',
            gridTemplateColumns: 'repeat(auto-fill, 32px)',
            border: '1.5px solid #333333',
            color: '#D4D4D4',
            backgroundColor: '#1d1d1c',
        }}, element('div', { style: { isolation: 'isolate', position: 'relative' } }, button));

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
            }}, emoji_container).addEventListener('click', onEmojiClick);
        });

        shout.style.overflow = 'hidden';
        const form = shout.querySelector(':scope > form');
        if (form) form.style.overflow = 'visible';
        emoji_selector.style.display = 'none';

        function onEmojiClick(event) {
            chat_input.value += event.target.innerText;
        }

        function onToggleEmojiSelector() {
            const state = (emoji_container.state = !emoji_container.state);
            if (state) {
                requestAnimationFrame(() => void document.body.addEventListener('click', onToggleEmojiSelector));
                emoji_container.style.display = 'grid';
            } else {
                document.body.removeEventListener('click', onToggleEmojiSelector);
                emoji_container.style.display = 'none';
            }
        }

        async function getInnerText(e) {
            return e.innerText || new Promise(resolve => {
                new MutationObserver((_, observer) => {
                    if (e.innerText) {
                        resolve(e.innerText);
                        observer.disconnect();
                    }
                }).observe(e, { childList: true, subtree: true, characterData: true });
            });
        }
    })();

    // ---- listeners ------------------------------------------------------

    window.addEventListener('load', scheduleLayout);
    window.addEventListener('resize', scheduleLayout);
    document.addEventListener('DOMContentLoaded', scheduleLayout);
    window.addEventListener('orientationchange', scheduleLayout);
    window.addEventListener('popstate', scheduleLayout);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') scheduleLayout();
    });

    // Single observer drives both the layout pass and the connection-closed
    // overlay check, replacing the old setInterval(..., 0) busy loop.
    const observer = new MutationObserver(() => {
        scheduleLayout();
        displayCustomErrorMessage();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial passes.
    scheduleLayout();
    displayCustomErrorMessage();
    renderPaymentHistory();
})();

Security Hub (Chrome Extension)

Contents:
- manifest.json (MV3)
- background.js (service worker)
- content.js (phishing + behavior detection)
- popup.html/.js (quick toggles)
- options.html/.js (simple dashboard)
- rules/rules.json (ad blocker via declarativeNetRequest)
- blacklist.json (domains for phishing checks)

Install Instructions:
1) Open chrome://extensions
2) Turn on Developer mode (top-right)
3) Click "Load unpacked" and select the security-hub-extension folder
4) The extension icon appears. Click it to open the popup. Use the options page for more controls.

Features:
- Phishing detection using keywords, pattern checks, and a blacklist. Shows a non-intrusive banner on suspicious pages.
- Ad blocker using Declarative Net Request. Toggle in popup or options.
- Smart download scanner warns on risky file types when downloads start.
- Suspicious behavior detector (fake popups, hidden iframes, clipboard access, forced redirects) with on-page warnings.
- Basic dashboard in options page with toggles, logs view, and breach check using backend API.

Sync:
- Settings are stored in chrome.storage.sync, syncing across your Chrome profile when signed in.

Backend (optional but recommended):
- The included web app provides a hosted dashboard with logs and breach check. Set VITE_BACKEND_URL in the site build to your API.

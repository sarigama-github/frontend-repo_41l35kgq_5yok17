// Security Hub - Content Script
// Phishing detection (keywords, patterns, blacklist) and suspicious behavior detector.

const KEYWORDS = ['login', 'verify', 'account', 'password', 'bank', 'update', 'invoice'];
const PATTERNS = [/\bsecure-?\d{2,}\.\w+/i, /\bpaypal-?security/i, /\bblockchain-?support/i];

// Fetch blacklist (simple domain list)
let blacklist = [];
fetch(chrome.runtime.getURL('blacklist.json')).then(r => r.json()).then(d => blacklist = d).catch(() => {});

function isBlacklisted(url) {
  try {
    const { hostname } = new URL(url);
    return blacklist.some((d) => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

function detectPhishing(url, text) {
  const lower = `${url} ${(text || '').toLowerCase()}`;
  const keywordHit = KEYWORDS.some(k => lower.includes(k));
  const patternHit = PATTERNS.some(p => p.test(lower));
  const blacklisted = isBlacklisted(url);
  return { keywordHit, patternHit, blacklisted, suspicious: keywordHit || patternHit || blacklisted };
}

function banner(message) {
  if (document.getElementById('security-hub-banner')) return;
  const el = document.createElement('div');
  el.id = 'security-hub-banner';
  el.style.cssText = 'position:fixed;inset:auto 0 0 0;background:#052e2b;color:#a7f3d0;padding:10px 14px;font:14px/1.4 system-ui,Segoe UI,Roboto;border-top:1px solid #10b981;z-index:2147483647;display:flex;align-items:center;gap:8px;';
  el.innerHTML = `<strong style="color:#34d399">Security Hub</strong> ${message}`;
  const close = document.createElement('button');
  close.textContent = 'Dismiss';
  close.style.cssText = 'margin-left:auto;background:#065f46;color:#ecfdf5;border:1px solid #10b981;border-radius:8px;padding:4px 10px;cursor:pointer';
  close.onclick = () => el.remove();
  el.appendChild(close);
  document.documentElement.appendChild(el);
}

// Suspicious behavior detector
function detectSuspiciousBehavior() {
  // fake popups (oversized fixed positioned divs with high z-index)
  const popups = Array.from(document.querySelectorAll('div,section'))
    .filter(n => {
      const s = getComputedStyle(n);
      const zi = parseInt(s.zIndex || '0', 10);
      return (s.position === 'fixed' || s.position === 'absolute') && zi > 9999 && (n.clientWidth > innerWidth * 0.5 && n.clientHeight > innerHeight * 0.5);
    });

  // hidden iframes
  const hiddenIframes = Array.from(document.querySelectorAll('iframe'))
    .filter(f => {
      const s = getComputedStyle(f);
      return (s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none' || f.width < 5 || f.height < 5);
    });

  // forced redirects (meta refresh)
  const metaRefresh = Array.from(document.querySelectorAll('meta[http-equiv="refresh"]')).length > 0;

  // clipboard access attempt
  let clipboardAttempt = false;
  const origWriteText = navigator.clipboard && navigator.clipboard.writeText;
  if (origWriteText) {
    navigator.clipboard.writeText = function(...args) {
      clipboardAttempt = true;
      return origWriteText.apply(this, args);
    };
  }

  if (popups.length || hiddenIframes.length || metaRefresh || clipboardAttempt) {
    banner('Suspicious behavior detected on this page. Be cautious.');
    chrome.runtime.sendMessage({ type: 'LOG', payload: { type: 'suspicious_behavior', message: 'Suspicious behavior detected', data: { popups: popups.length, hiddenIframes: hiddenIframes.length, metaRefresh, clipboardAttempt } } });
  }
}

function init() {
  // Get settings to know if we should activate
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
    const settings = (res && res.settings) || {};

    if (settings.phishing_protection_enabled) {
      const info = detectPhishing(location.href, document.body.innerText.substring(0, 10000));
      if (info.suspicious) {
        banner('Possible phishing detected. Proceed carefully.');
        chrome.runtime.sendMessage({ type: 'LOG', payload: { type: 'phishing_warning', message: 'Phishing indicators found', data: info } });
      }

      document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (a) {
          const info2 = detectPhishing(a.href, a.textContent || '');
          if (info2.suspicious) {
            banner('This link looks suspicious.');
            e.preventDefault();
          }
        }
      }, { capture: true });
    }

    if (settings.behavior_detector_enabled) {
      setTimeout(detectSuspiciousBehavior, 1500);
      setInterval(detectSuspiciousBehavior, 10000);
    }
  });
}

init();

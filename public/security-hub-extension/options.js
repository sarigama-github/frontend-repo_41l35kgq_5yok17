const BACKEND = 'VITE_BACKEND_URL_PLACEHOLDER';

function setLabel(el, on){ el.textContent = on ? 'On' : 'Off'; el.style.background = on? '#065f46' : '#0b2a26'; el.style.color = on? '#ecfdf5' : '#bcf7e7'; }

function get(url){ return fetch(url).then(r=>r.json()); }

function init(){
  const els = { ad: document.getElementById('ad'), phish: document.getElementById('phish'), dl: document.getElementById('dl'), beh: document.getElementById('beh') };
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
    const s = (res && res.settings) || {};
    setLabel(els.ad, s.ad_blocker_enabled); setLabel(els.phish, s.phishing_protection_enabled); setLabel(els.dl, s.download_scanner_enabled); setLabel(els.beh, s.behavior_detector_enabled);

    const update = (next) => chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATE', settings: next }, () => {
      setLabel(els.ad, next.ad_blocker_enabled); setLabel(els.phish, next.phishing_protection_enabled); setLabel(els.dl, next.download_scanner_enabled); setLabel(els.beh, next.behavior_detector_enabled);
    });

    els.ad.onclick = () => update({ ...s, ad_blocker_enabled: !s.ad_blocker_enabled });
    els.phish.onclick = () => update({ ...s, phishing_protection_enabled: !s.phishing_protection_enabled });
    els.dl.onclick = () => update({ ...s, download_scanner_enabled: !s.download_scanner_enabled });
    els.beh.onclick = () => update({ ...s, behavior_detector_enabled: !s.behavior_detector_enabled });
  });

  // Backend logs
  const url = BACKEND.replace('VITE_BACKEND_URL_PLACEHOLDER', (typeof window !== 'undefined' ? window.location.origin : ''));
}

// Load logs from backend if available
async function loadLogs(){
  try {
    const base = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${base}/api/logs?limit=50`);
    const data = await res.json();
    const el = document.getElementById('logs');
    if (data.items && data.items.length){
      el.innerHTML = data.items.map(i => `<div style="padding:6px 0;border-bottom:1px solid #0c2f29"><strong>${i.type}</strong> — ${i.message}</div>`).join('');
    } else {
      el.textContent = 'No logs yet.';
    }
  } catch (e){
    document.getElementById('logs').textContent = 'Could not load logs.';
  }
}

// Breach check
function initBreach(){
  const input = document.getElementById('email');
  const out = document.getElementById('result');
  const btn = document.getElementById('check');
  btn.onclick = async () => {
    out.textContent = 'Checking...';
    try {
      const base = 'http://localhost:8000';
      const res = await fetch(`${base}/api/breach-check?email=${encodeURIComponent(input.value)}`);
      const data = await res.json();
      out.textContent = data.exposed ? 'This email appears in known breaches.' : 'No exposure found.';
    } catch (e){
      out.textContent = 'Error performing check.';
    }
  };
}

init();
initBreach();
loadLogs();

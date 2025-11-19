function setLabel(el, on){ el.textContent = on ? 'On' : 'Off'; el.style.background = on? '#065f46' : '#0b2a26'; el.style.color = on? '#ecfdf5' : '#bcf7e7'; }

function init(){
  const els = { ad: document.getElementById('ad'), phish: document.getElementById('phish'), dl: document.getElementById('dl'), beh: document.getElementById('beh') };
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
    const s = (res && res.settings) || {};
    setLabel(els.ad, s.ad_blocker_enabled);
    setLabel(els.phish, s.phishing_protection_enabled);
    setLabel(els.dl, s.download_scanner_enabled);
    setLabel(els.beh, s.behavior_detector_enabled);

    els.ad.onclick = () => update({ ...s, ad_blocker_enabled: !s.ad_blocker_enabled });
    els.phish.onclick = () => update({ ...s, phishing_protection_enabled: !s.phishing_protection_enabled });
    els.dl.onclick = () => update({ ...s, download_scanner_enabled: !s.download_scanner_enabled });
    els.beh.onclick = () => update({ ...s, behavior_detector_enabled: !s.behavior_detector_enabled });

    function update(next){
      chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATE', settings: next }, () => {
        setLabel(els.ad, next.ad_blocker_enabled);
        setLabel(els.phish, next.phishing_protection_enabled);
        setLabel(els.dl, next.download_scanner_enabled);
        setLabel(els.beh, next.behavior_detector_enabled);
      });
    }
  })
}

document.addEventListener('DOMContentLoaded', init);

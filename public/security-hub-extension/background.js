// Security Hub - Background Service Worker (MV3)
// Handles: ad-block toggles via DNR, download scanning, sync settings, logs

const DEFAULT_SETTINGS = {
  ad_blocker_enabled: true,
  phishing_protection_enabled: true,
  download_scanner_enabled: true,
  behavior_detector_enabled: true,
};

const BACKEND_URL = (typeof self !== 'undefined' && self.SECURITY_HUB_BACKEND) || 'https://example.com';

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['settings', 'user_id'], (res) => {
      const s = Object.assign({}, DEFAULT_SETTINGS, res.settings || {});
      resolve({ settings: s, user_id: res.user_id || null });
    });
  });
}

async function setSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ settings }, () => resolve(true));
  });
}

// Apply DNR rules (ad blocker toggle)
async function applyAdBlockToggle(enabled) {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enabled ? ['ads'] : [],
      disableRulesetIds: enabled ? [] : ['ads'],
    });
  } catch (e) {
    console.warn('DNR update failed', e);
  }
}

// Download scanner
chrome.downloads.onCreated.addListener(async (item) => {
  const { settings } = await getSettings();
  if (!settings.download_scanner_enabled) return;

  const riskyExt = ['.exe', '.msi', '.bat', '.cmd', '.scr', '.js', '.vbs', '.ps1', '.apk'];
  const lower = (item.filename || '').toLowerCase();
  const ext = riskyExt.find((e) => lower.endsWith(e));

  if (ext) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Security Hub: Risky download',
      message: `The file ${item.filename} appears risky (${ext}). Proceed with caution.`,
      priority: 2,
    });
    // Optional: pause download - requires downloads.shelf permission and not supported by all
  }
});

// Settings change listener from popup/options
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SETTINGS_UPDATE') {
    setSettings(msg.settings).then(() => {
      applyAdBlockToggle(!!msg.settings.ad_blocker_enabled);
      sendResponse({ ok: true });
    });
    return true; // async
  }
  if (msg.type === 'GET_SETTINGS') {
    getSettings().then((v) => sendResponse(v));
    return true;
  }
});

// Initialize
(async () => {
  const { settings } = await getSettings();
  await applyAdBlockToggle(!!settings.ad_blocker_enabled);
})();

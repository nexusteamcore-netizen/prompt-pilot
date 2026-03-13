// sync.js - This file is intentionally minimal.
// Token synchronization is now handled directly inside the extension popup (popup.js).
// The user logs in from the popup UI, and the token is saved to chrome.storage.local directly.
console.log("PromptPilot: Extension content script active on:", window.location.host);

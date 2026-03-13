// sync.js - Final Boss Sync Logic
console.log("PromptPilot Sync: Heartbeat [ACTIVE]");

function safeStorageSet(data, callback) {
    try {
        if (chrome?.storage?.local) {
            chrome.storage.local.set(data, callback);
        }
    } catch (e) {
        console.warn("PromptPilot Sync: chrome.storage unavailable", e);
    }
}

function syncFromBridge() {
    const bridge = document.getElementById("pp-sync-bridge");
    if (bridge) {
        const token = bridge.getAttribute("data-token");
        if (token) {
            console.log("PromptPilot Sync: Token captured from BRIDGE!");
            safeStorageSet({
                pp_token: token,
                pp_base_url: window.location.origin
            }, () => {
                console.log("PromptPilot Sync: Bridge storage successful.");
            });
            return true;
        }
    }
    return false;
}

function syncLatestToken() {
    const isOurSite = window.location.host.includes("localhost") || 
                     window.location.host.includes("prompt-pilot") || 
                     window.location.host.includes("promptpilot");

    if (!isOurSite) return;

    // 1. Try Bridge first (Fastest)
    if (syncFromBridge()) return;

    // 2. Scan Storages
    console.log("PromptPilot Sync: Scanning storages...");
    const storages = [localStorage, sessionStorage];
    storages.forEach(store => {
        for (let i = 0; i < store.length; i++) {
            const key = store.key(i);
            if (key && (key.includes("-auth-token") || key.endsWith("auth-token") || key.includes("supabase.auth.token"))) {
                try {
                    const rawData = store.getItem(key);
                    if (rawData) {
                        const data = JSON.parse(rawData);
                        const token = data.access_token || (data.currentSession?.access_token);
                        if (token) {
                            console.log("PromptPilot Sync: Token found in", store === localStorage ? "localStorage" : "sessionStorage");
                            safeStorageSet({
                                pp_token: token,
                                pp_base_url: window.location.origin
                            });
                        }
                    }
                } catch (e) {}
            }
        }
    });
}

// Watch for the bridge to appear (SPA transitions)
const observer = new MutationObserver(() => {
    if (syncFromBridge()) {
        // We found it, but keep observing in case of user swap or login
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
syncLatestToken();

// Listen for messages from AuthContext
window.addEventListener("message", (event) => {
    if (event?.data?.type === "PP_AUTH_TOKEN") {
        console.log("PromptPilot Sync: Message received from App.");
        const { token, baseUrl } = event.data;
        if (token) {
            safeStorageSet({
                pp_token: token,
                pp_base_url: baseUrl || window.location.origin
            });
        }
    }
});

// sync.js - Aggressive Token Synchronization
console.log("PromptPilot Sync: Script loaded on", window.location.host);

function safeStorageSet(data, callback) {
    try {
        if (chrome?.storage?.local) {
            chrome.storage.local.set(data, callback);
        }
    } catch (e) {
        console.warn("PromptPilot Sync: chrome.storage unavailable", e);
    }
}

function syncLatestToken() {
    // Precise detection for production and local
    const isOurSite = window.location.host.includes("localhost") || 
                     window.location.host.includes("prompt-pilot") || 
                     window.location.host.includes("promptpilot");

    if (!isOurSite) return;

    console.log("PromptPilot Sync: Scanning for tokens...");
    let found = false;

    // Check localStorage AND sessionStorage
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
                            }, () => {
                                console.log("PromptPilot Sync: Token saved successfully.");
                            });
                            found = true;
                        }
                    }
                } catch (e) {}
            }
        }
    });

    if (!found) {
        console.log("PromptPilot Sync: No token found in storages yet.");
    }
}

// Initial sync
syncLatestToken();

// Listen for messages from the React App (AuthProvider.tsx)
window.addEventListener("message", (event) => {
    if (event && event.data && event.data.type === "PP_AUTH_TOKEN") {
        console.log("PromptPilot Sync: Received auth message from app.");
        const { token, baseUrl } = event.data;
        const finalBaseUrl = baseUrl || window.location.origin;

        if (token) {
            safeStorageSet({
                pp_token: token,
                pp_base_url: finalBaseUrl
            }, () => {
                console.log("PromptPilot Sync: Token synced via message!");
            });
        }
    }
});

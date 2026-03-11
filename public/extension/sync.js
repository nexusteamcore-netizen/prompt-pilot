// Helper to sync token from localStorage (runs on localhost/promptpilot pages)
function safeStorageSet(data, callback) {
    try {
        if (chrome?.storage?.local) {
            chrome.storage.local.set(data, callback);
        }
    } catch (e) {
        console.warn("PromptPilot: chrome.storage unavailable", e);
    }
}

function syncLatestToken() {
    if (window.location.host.includes("localhost") || window.location.host.includes("promptpilot")) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes("-auth-token") || key.endsWith("auth-token"))) {
                try {
                    const rawData = localStorage.getItem(key);
                    if (rawData) {
                        const data = JSON.parse(rawData);
                        if (data && data.access_token) {
                            safeStorageSet({
                                pp_token: data.access_token,
                                pp_base_url: window.location.origin
                            }, () => {
                                console.log("PromptPilot: Token synced from localStorage!");
                            });
                            break;
                        }
                    }
                } catch (e) {
                    console.error("PromptPilot Sync Error:", e);
                }
            }
        }
    }
}

// Initial sync
syncLatestToken();

// Listen for messages from the app (for real-time sync after login)
window.addEventListener("message", (event) => {
    if (event && event.data && event.data.type === "PP_AUTH_TOKEN") {
        const { token, baseUrl } = event.data;
        const finalBaseUrl = baseUrl || window.location.origin;

        safeStorageSet({
            pp_token: token,
            pp_base_url: finalBaseUrl
        }, () => {
            console.log("PromptPilot: Token synced via message!", { url: finalBaseUrl });
        });
    }
});

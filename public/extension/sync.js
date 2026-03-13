// sync.js — Passive Token Synchronization
if (window.location.hostname.includes("prompt-pilot-lime.vercel.app") || window.location.hostname.includes("localhost")) {
    console.log("PromptPilot: Passive Sync initialized on", window.location.hostname);
    
    const syncToken = () => {
        const stores = [localStorage, sessionStorage];
        for (const store of stores) {
            for (let i = 0; i < store.length; i++) {
                const key = store.key(i);
                if (!key) continue;
                if (key.includes("-auth-token") || key.includes("supabase.auth")) {
                    try {
                        const data = JSON.parse(store.getItem(key));
                        const token = data?.access_token || data?.currentSession?.access_token;
                        if (token) {
                            chrome.storage.local.set({ 
                                pp_token: token, 
                                pp_base_url: window.location.origin,
                                pp_email: data?.user?.email || ""
                            });
                            return true; // Token found and synced
                        }
                    } catch {}
                }
            }
        }
        return false;
    };

    // Run on interval to catch login completion
    const syncInterval = setInterval(() => {
        if (syncToken()) {
            clearInterval(syncInterval); // Stop polling once token is found
        }
    }, 2000);

    // Re-check passively when the window regains focus to keep it fresh
    window.addEventListener("focus", syncToken);
}

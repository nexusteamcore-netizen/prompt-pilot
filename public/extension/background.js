// ── Main Message Router ─────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TRANSFORM_PROMPT") {
        handleTransformation(request.data)
            .then(sendResponse)
            .catch(err => sendResponse({ error: err.message }));
        return true;
    }

    if (request.type === "GET_TOKEN_FROM_SITE") {
        resolveToken()
            .then(token => sendResponse({ token }))
            .catch(() => sendResponse({ token: null }));
        return true;
    }
});

// ── Token resolution (3 layers) ─────────────────────────────────
async function resolveToken() {
    // Layer 1: Already in storage
    const storage = await chrome.storage.local.get(["pp_token"]);
    if (storage.pp_token) return storage.pp_token;

    // Layer 2: Open website tab found
    const fromTab = await getTokenFromOpenTab();
    if (fromTab) {
        await chrome.storage.local.set({ pp_token: fromTab.token, pp_base_url: fromTab.baseUrl });
        return fromTab.token;
    }

    // Layer 3: Open a silent background tab iteratively, grab token, close it
    const fromBg = await getFromBackgroundTabs();
    if (fromBg && fromBg.token) {
        await chrome.storage.local.set({ pp_token: fromBg.token, pp_base_url: fromBg.baseUrl });
        return fromBg.token;
    }

    return null;
}

// Inject script into any already-open site tab
async function getTokenFromOpenTab() {
    const tabs = await chrome.tabs.query({
        url: ["https://prompt-pilot-lime.vercel.app/*", "http://localhost:3000/*"]
    });
    if (!tabs?.length) return null;

    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: readTokenFromStorage
        });
        return results[0]?.result || null;
    } catch { return null; }
}

const SITE_URLS = [
    "http://localhost:3000/dashboard",
    "https://prompt-pilot-lime.vercel.app/dashboard"
];

// Open a background tab silently, grab token, close it
function getTokenFromBackgroundTab(url) {
    return new Promise((resolve) => {
        chrome.tabs.create({ url, active: false }, (tab) => {
            if (!tab || !tab.id) { resolve(null); return; }
            
            const timeout = setTimeout(() => {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.remove(tab.id).catch(() => {});
                resolve(null);
            }, 2500); // Super fast 2.5s timeout per url

            const listener = (tabId, changeInfo) => {
                if (tabId !== tab.id || changeInfo.status !== "complete") return;
                chrome.tabs.onUpdated.removeListener(listener);
                clearTimeout(timeout);

                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: readTokenFromStorage
                }).then(results => {
                    chrome.tabs.remove(tab.id).catch(() => {});
                    const result = results[0]?.result;
                    resolve(result || null);
                }).catch(() => {
                    chrome.tabs.remove(tab.id).catch(() => {});
                    resolve(null);
                });
            };

            chrome.tabs.onUpdated.addListener(listener);
        });
    });
}

async function getFromBackgroundTabs() {
    console.log("PromptPilot [BG]: Opening silent background tabs in parallel...");
    // ⚡ Execute all checks at once to avoid 8s+ sequential delay
    const results = await Promise.all(SITE_URLS.map(url => getTokenFromBackgroundTab(url)));
    
    // Find the first successful token fetch
    const success = results.find(res => res && res.token);
    if (success) {
        console.log(`PromptPilot [BG]: Found token via background tab!`);
        return success;
    }
    return null;
}

// This function runs inside the target tab. MUST be self-contained.
function readTokenFromStorage() {
    const stores = [localStorage, sessionStorage];
    for (const store of stores) {
        for (let i = 0; i < store.length; i++) {
            const key = store.key(i);
            if (!key) continue;
            if (key.includes("-auth-token") || key.includes("supabase.auth")) {
                try {
                    const data = JSON.parse(store.getItem(key));
                    const token = data?.access_token || data?.currentSession?.access_token;
                    if (token) return { token, baseUrl: window.location.origin, email: data?.user?.email || "" };
                } catch {}
            }
        }
    }
    return null;
}

// ── Transform ───────────────────────────────────────────────────
async function handleTransformation({ text, mode }) {
    const storage = await chrome.storage.local.get(["pp_token", "pp_base_url"]);
    let token = storage.pp_token;
    let BASE_URL = storage.pp_base_url || "https://prompt-pilot-lime.vercel.app";

    if (!token) {
        console.log("PromptPilot [BG]: No token, auto-resolving...");
        token = await resolveToken();
        const s = await chrome.storage.local.get(["pp_base_url"]);
        BASE_URL = s.pp_base_url || BASE_URL;
    }

    if (!token) {
        throw new Error("Login Required: Please open the PromptPilot website and sign in first.");
    }

    const response = await fetch(`${BASE_URL}/api/transform`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text, mode, context: "chrome-extension" })
    });

    if (!response.ok) {
        const err = await response.text();
        // Clear bad token if 401
        if (response.status === 401) {
            await chrome.storage.local.remove(["pp_token"]);
        }
        throw new Error(`Server Error ${response.status}`);
    }

    return await response.json();
}

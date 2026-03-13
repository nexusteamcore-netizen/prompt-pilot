const SITE_URLS = [
    "https://prompt-pilot-lime.vercel.app/*",
    "http://localhost:3000/*"
];

// ── Main Message Router ─────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TRANSFORM_PROMPT") {
        handleTransformation(request.data)
            .then(sendResponse)
            .catch(err => sendResponse({ error: err.message }));
        return true;
    }

    if (request.type === "GET_TOKEN_FROM_SITE") {
        getTokenFromSiteTab()
            .then(sendResponse)
            .catch(() => sendResponse({ token: null }));
        return true;
    }
});

// ── Auto-detect token from open website tab ─────────────────────
async function getTokenFromSiteTab() {
    const tabs = await chrome.tabs.query({
        url: ["https://prompt-pilot-lime.vercel.app/*", "http://localhost:3000/*"]
    });

    if (!tabs || tabs.length === 0) {
        console.log("PromptPilot [BG]: No website tab found.");
        return { token: null };
    }

    console.log("PromptPilot [BG]: Website tab found, injecting script...");

    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                // Scan all storages for Supabase token
                const stores = [localStorage, sessionStorage];
                for (const store of stores) {
                    for (let i = 0; i < store.length; i++) {
                        const key = store.key(i);
                        if (!key) continue;
                        if (key.includes("-auth-token") || key.includes("supabase.auth")) {
                            try {
                                const raw = store.getItem(key);
                                if (!raw) continue;
                                const data = JSON.parse(raw);
                                const token = data.access_token || data.currentSession?.access_token;
                                if (token) {
                                    return {
                                        token,
                                        email: data.user?.email || "",
                                        baseUrl: window.location.origin
                                    };
                                }
                            } catch {}
                        }
                    }
                }
                return { token: null };
            }
        });
        return results[0]?.result || { token: null };
    } catch (err) {
        console.error("PromptPilot [BG]: Script injection failed:", err.message);
        return { token: null };
    }
}

// ── Transform Handler ───────────────────────────────────────────
async function handleTransformation({ text, mode }) {
    const storage = await chrome.storage.local.get(["pp_token", "pp_base_url"]);
    let token = storage.pp_token;
    let BASE_URL = storage.pp_base_url || "https://prompt-pilot-lime.vercel.app";

    // Auto-refresh token from site tab if missing
    if (!token) {
        console.log("PromptPilot [BG]: No token in storage, trying website tab...");
        const result = await getTokenFromSiteTab();
        if (result?.token) {
            token = result.token;
            BASE_URL = result.baseUrl || BASE_URL;
            await chrome.storage.local.set({ pp_token: token, pp_base_url: BASE_URL });
            console.log("PromptPilot [BG]: Auto-synced token from site!");
        } else {
            throw new Error("Login Required: Please open the PromptPilot website and sign in.");
        }
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
        throw new Error(`Server Error ${response.status}: ${err}`);
    }

    return await response.json();
}

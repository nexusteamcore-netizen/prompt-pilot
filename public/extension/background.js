chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("PromptPilot [BG]: Message received:", request.type);

    if (request.type === "TRANSFORM_PROMPT") {
        handleTransformation(request.data)
            .then(res => {
                console.log("PromptPilot [BG]: Success! Sending response.");
                sendResponse(res);
            })
            .catch(err => {
                console.error("PromptPilot [BG]: Error:", err.message);
                sendResponse({ error: err.message });
            });
        return true; // Keep channel open for async response
    }
});

async function handleTransformation({ text, mode }) {
    console.log("PromptPilot [BG]: Fetching storage...");
    const storage = await chrome.storage.local.get(["pp_token", "pp_base_url"]);
    
    // PRIORITY: 1. Sync token, 2. Manual setting, 3. Production Fallback
    const BASE_URL = storage.pp_base_url || "https://prompt-pilot-lime.vercel.app";
    const token = storage.pp_token;

    console.log("PromptPilot [BG]: Using Base URL:", BASE_URL);

    if (!token) {
        throw new Error("Login Required: Please open the PromptPilot website and sign in.");
    }

    try {
        console.log("PromptPilot [BG]: Sending fetch request...");
        const response = await fetch(`${BASE_URL}/api/transform`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
                text, 
                mode, 
                context: "chrome-extension",
                origin: "extension-v1"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("PromptPilot [BG]: API Error:", response.status, errorText);
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("PromptPilot [BG]: Received transformed prompt.");
        return data;
    } catch (err) {
        console.error("PromptPilot [BG]: Fetch failed:", err);
        throw new Error(err.message.includes("Failed to fetch") ? "Connection Error: Is the site online?" : err.message);
    }
}

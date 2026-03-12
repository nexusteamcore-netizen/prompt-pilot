chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("PromptPilot: Message received in background!", request);

    if (request.type === "TRANSFORM_PROMPT") {
        // QUICK TEST: Uncomment this to test if the pipe works without the server
        // sendResponse({ transformed: "Pipe Test: " + request.data.text });
        // return;

        handleTransformation(request.data)
            .then(res => {
                console.log("PromptPilot: Sending success response back.");
                sendResponse(res);
            })
            .catch(err => {
                console.error("PromptPilot: Sending error response back:", err);
                sendResponse({ error: err.message });
            });
        return true;
    }
});

async function handleTransformation({ text, mode }) {
    console.log(`PromptPilot [BG]: Starting transformation in ${mode} mode...`);
    const { pp_token, pp_base_url } = await chrome.storage.local.get(["pp_token", "pp_base_url"]);
    const BASE_PATH = pp_base_url || "http://localhost:3000";

    if (!pp_token) {
        throw new Error("Login Required: Open the website and sign in first.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
        const res = await fetch(`${BASE_PATH}/api/transform`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${pp_token}`
            },
            body: JSON.stringify({ text, mode, context: "chrome-extension" }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server Error (${res.status})`);
        }

        const data = await res.json();
        if (!data.transformed) throw new Error("AI returned an empty response. Try re-phrasing.");
        
        console.log("PromptPilot [BG]: Transformation Complete!");
        return data;
    } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr.name === "AbortError") throw new Error("Request Timed Out (Prompt might be too complex)");
        if (fetchErr.message.includes("Failed to fetch")) throw new Error("Connection Failed: Ensure the server/site is online.");
        throw fetchErr;
    }
}

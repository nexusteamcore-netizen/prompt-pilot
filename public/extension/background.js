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
    console.log("PromptPilot: Received transformation request...");
    const { pp_token, pp_base_url } = await chrome.storage.local.get(["pp_token", "pp_base_url"]);
    const BASE_PATH = pp_base_url || "http://localhost:3000";

    if (!pp_token) {
        console.error("PromptPilot: Missing token. User might not be signed in.");
        throw new Error("Sign-In Required on Website");
    }

    console.log(`PromptPilot: Fetching from ${BASE_PATH}/api/transform...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for the fetch itself

    try {
        console.log("PromptPilot: Initiating fetch to server...");
        const res = await fetch(`${BASE_PATH}/api/transform`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${pp_token}`
            },
            body: JSON.stringify({ text, mode }),
            signal: controller.signal
        });

        console.log("PromptPilot: Fetch status:", res.status);
        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("PromptPilot: API error:", errorData);
            throw new Error(errorData.error || "Server Error (Credits/Quota)");
        }

        const data = await res.json();
        console.log("PromptPilot: Transformation successful!");
        return data;
    } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.error("PromptPilot Error:", fetchErr);

        if (fetchErr.name === "AbortError") {
            throw new Error("Request Timed Out (Server too slow)");
        }
        if (fetchErr.message.includes("Failed to fetch")) {
            throw new Error("Local Server Offline (Run: npx tsx server.ts)");
        }
        throw fetchErr;
    }
}

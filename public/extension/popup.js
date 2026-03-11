document.addEventListener("DOMContentLoaded", async () => {
    const modeSelect = document.getElementById("mode");
    const usageText = document.getElementById("usage-count");
    const dashboardLink = document.getElementById("go-dashboard");
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");

    // Load saved preferences
    const storage = await chrome.storage.local.get(["pp_mode", "pp_base_url", "pp_token"]);
    const { pp_mode, pp_base_url, pp_token } = storage;

    if (pp_mode && modeSelect) modeSelect.value = pp_mode;

    const BASE_URL = pp_base_url || "http://localhost:3000";
    if (dashboardLink) dashboardLink.href = `${BASE_URL}/dashboard`;

    if (modeSelect) {
        modeSelect.addEventListener("change", (e) => {
            chrome.storage.local.set({ pp_mode: e.target.value });
        });
    }

    // Check Login Status & Fetch Usage
    if (!pp_token) {
        statusDot.style.background = "#ef4444";
        statusText.innerText = "Not Signed In";
        usageText.innerText = "Login Required";
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/usage`, {
            headers: { "Authorization": `Bearer ${pp_token}` }
        });

        if (res.status === 401) {
            chrome.storage.local.remove("pp_token");
            statusDot.style.background = "#ef4444";
            statusText.innerText = "Session Expired";
            usageText.innerText = "Re-login needed";
        } else {
            const data = await res.json();
            statusDot.style.background = "#10b981";
            statusText.innerText = "Running";
            if (usageText) usageText.innerText = `${data.used} / ${data.total}`;
        }
    } catch (err) {
        statusDot.style.background = "#f59e0b";
        statusText.innerText = "Server Offline";
        if (usageText) usageText.innerText = "—";
    }
});

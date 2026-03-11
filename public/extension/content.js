// content.js - Minimalist Branding & Drag Interface

// Safety helpers — all chrome API calls must go through these
function safeGet(keys, cb) {
    try { if (chrome?.storage?.local) chrome.storage.local.get(keys, cb); else cb({}); }
    catch (e) { cb({}); }
}
function safeSet(data) {
    try { if (chrome?.storage?.local) chrome.storage.local.set(data); } catch (e) { }
}
function isContextValid() {
    try { return !!chrome.runtime?.id; } catch (e) { return false; }
}

let lastFocusedInput = null;
let ppBadge = null;
let isDragging = false;
let startX, startY;

const inputSelectors = [
    'div[contenteditable="true"]',
    'textarea',
    '#prompt-textarea',
    '.ProseMirror',
    'input[type="text"]'
];

function createStartupBadge() {
    if (ppBadge) return;

    ppBadge = document.createElement("button");
    ppBadge.className = "pp-enhance-btn";
    // The Pen-Rocket Sign 🖋️🚀
    ppBadge.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C12 2 17 8 17 13C17 18 12 21 12 21C12 21 7 18 7 13C7 8 12 2 12 2Z"/>
      <path d="M12 8V13"/>
      <path d="M7 16L3 20"/>
      <path d="M17 16L21 20"/>
    </svg>
  `;

    // Restore position & Hide by default
    safeGet(["pp_badge_pos"], (res) => {
        const pos = res.pp_badge_pos || { bottom: 40, right: 40 };
        Object.assign(ppBadge.style, {
            bottom: pos.bottom + (typeof pos.bottom === "number" ? "px" : ""),
            right: pos.right + (typeof pos.right === "number" ? "px" : ""),
            left: pos.left + (typeof pos.left === "number" ? "px" : ""),
            top: pos.top + (typeof pos.top === "number" ? "px" : ""),
            opacity: "0",
            pointerEvents: "none",
            transform: "scale(0.8) translateY(10px)"
        });
    });

    document.body.appendChild(ppBadge);

    // Minimalist Dragging logic
    ppBadge.addEventListener("mousedown", (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;

        const rect = ppBadge.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            if (!isDragging && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
                isDragging = true;
            }

            if (isDragging) {
                ppBadge.style.left = (moveEvent.clientX - offsetX) + "px";
                ppBadge.style.top = (moveEvent.clientY - offsetY) + "px";
                ppBadge.style.right = "auto";
                ppBadge.style.bottom = "auto";
                ppBadge.style.transition = "none";
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            if (isDragging) {
                ppBadge.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
                const rect = ppBadge.getBoundingClientRect();
                try {
                    if (chrome?.storage?.local) {
                        safeSet({
                            pp_badge_pos: { top: rect.top, left: rect.left, right: "auto", bottom: "auto" }
                        });
                    }
                } catch (e) { /* Extension context may be invalid */ }
            }
            // Reset dragging state after a tiny delay
            setTimeout(() => { isDragging = false; }, 50);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    // Action logic
    ppBadge.addEventListener("click", async () => {
        if (isDragging) return;
        if (!lastFocusedInput) {
            showFeedback("Click a text field first!", "#f59e0b");
            return;
        }

        if (!isContextValid()) return ppBadge.remove();

        let text = lastFocusedInput.value || lastFocusedInput.innerText || "";
        if (!text.trim()) {
            showFeedback("Write something first!", "#f59e0b");
            return;
        }

        console.log("PromptPilot: Click detected. Preparing request...");
        console.log("PromptPilot: Starting transformation...");
        showFeedback("Starting...", "#3b82f6");
        ppBadge.classList.add("enhancing");
        ppBadge.innerHTML = `<span class="pp-spinner"></span>`;

        try {
            // DIRECT FETCH — bypasses background service worker entirely
            const storage = await new Promise(resolve => safeGet(["pp_token", "pp_base_url", "pp_mode"], resolve));
            const token = storage.pp_token;
            const baseUrl = storage.pp_base_url || "http://localhost:3000";
            const mode = storage.pp_mode || "professional";

            console.log("PromptPilot: Direct fetch to", baseUrl, "| Token exists:", !!token);

            if (!token) {
                showFeedback("Sign In on Website First!", "#ef4444");
                resetBadge();
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                showFeedback("Timed Out ⏳ (Server slow?)", "#ef4444");
                resetBadge();
            }, 20000);

            try {
                const res = await fetch(`${baseUrl}/api/transform`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ text, mode }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log("PromptPilot: Server responded with status:", res.status);

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    showFeedback(errData.error || `Server Error ${res.status}`, "#ef4444");
                    resetBadge();
                    return;
                }

                const data = await res.json();
                const transformed = data.transformed;

                if (!transformed) {
                    showFeedback("Empty AI Response", "#ef4444");
                    resetBadge();
                    return;
                }

                // Inject the transformed text
                lastFocusedInput.focus();
                if (lastFocusedInput.tagName === "TEXTAREA" || lastFocusedInput.tagName === "INPUT") {
                    lastFocusedInput.value = transformed;
                } else {
                    document.execCommand('selectAll', false, null);
                    document.execCommand('insertText', false, transformed);
                }
                lastFocusedInput.dispatchEvent(new Event('input', { bubbles: true }));
                showFeedback("Done! ✨", "#10b981");
                console.log("PromptPilot: Success!");
                resetBadge();

            } catch (fetchErr) {
                clearTimeout(timeoutId);
                if (fetchErr.name === "AbortError") {
                    // Already handled by timeout
                    return;
                }
                console.error("PromptPilot fetch error:", fetchErr);
                if (fetchErr.message.includes("Failed to fetch") || fetchErr.message.includes("NetworkError")) {
                    showFeedback("Server Offline! Run npx tsx server.ts", "#ef4444");
                } else {
                    showFeedback("Error: " + fetchErr.message.substring(0, 30), "#ef4444");
                }
                resetBadge();
            }

        } catch (err) {
            console.error("PromptPilot Critical Catch:", err);
            showFeedback("Internal Error", "#ef4444");
            resetBadge();
        }
    });
}

function showFeedback(text, color) {
    const pop = document.createElement("div");
    pop.className = "pp-feedback-pop";
    pop.style.background = color;
    pop.innerText = text;
    ppBadge.appendChild(pop);
    setTimeout(() => pop.remove(), 2500);
}

function resetBadge() {
    if (!ppBadge) return;
    ppBadge.classList.remove("enhancing");
    ppBadge.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C12 2 17 8 17 13C17 18 12 21 12 21C12 21 7 18 7 13C7 8 12 2 12 2Z"/>
      <path d="M12 8V13"/>
      <path d="M7 16L3 20"/>
      <path d="M17 16L21 20"/>
    </svg>
  `;
}

// Use focusin to catch all focus events (clicks, tabs, etc.)
document.addEventListener("focusin", (e) => {
    if (!ppBadge) return;

    // Check if the focused element IS an input or INSIDE one
    const target = e.target;
    const inputElement = target.closest(inputSelectors.join(','));
    const isContentEditable = target.closest('[contenteditable="true"]');

    if (inputElement || isContentEditable) {
        lastFocusedInput = inputElement || isContentEditable;
        ppBadge.style.opacity = "0.8";
        ppBadge.style.pointerEvents = "auto";
        ppBadge.style.transform = "scale(1) translateY(0)";
    }
});

// Use mousedown only for hiding when clicking outside
document.addEventListener("mousedown", (e) => {
    if (!ppBadge) return;

    const target = e.target;
    const isInput = target.closest(inputSelectors.join(',')) || target.closest('[contenteditable="true"]');

    if (!isInput && !ppBadge.contains(target)) {
        // Small delay to ensure we're not in the middle of a drag
        setTimeout(() => {
            if (!isDragging) {
                ppBadge.style.opacity = "0";
                ppBadge.style.pointerEvents = "none";
                ppBadge.style.transform = "scale(0.8) translateY(10px)";
            }
        }, 150);
    }
});

// Create badge
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createStartupBadge);
} else {
    createStartupBadge();
}

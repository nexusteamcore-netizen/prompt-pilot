let lastFocusedInput = null;
let ppBadge = null;
let isDragging = false;
let startX, startY;

const inputSelectors = [
    '#prompt-textarea',
    '.ProseMirror',
    'div[contenteditable="true"]',
    'textarea',
    'input[type="text"]'
].join(',');

function createBadge() {
    if (ppBadge) return;
    console.log("PromptPilot: Creating badge...");

    ppBadge = document.createElement("button");
    ppBadge.id = "pp-badge";
    ppBadge.className = "pp-enhance-btn";
    ppBadge.title = "Enhance with PromptPilot";
    ppBadge.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C12 2 17 8 17 13C17 18 12 21 12 21C12 21 7 18 7 13C7 8 12 2 12 2Z"/>
        <path d="M12 8V13"/>
        <path d="M7 16L3 20"/>
        <path d="M17 16L21 20"/>
      </svg>
    `;

    Object.assign(ppBadge.style, {
        position: "fixed",
        bottom: "80px",
        right: "24px",
        opacity: "0",
        pointerEvents: "none",
        zIndex: "999999",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        transform: "scale(0.8)"
    });

    document.body.appendChild(ppBadge);

    // Click to enhance
    ppBadge.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (isDragging) return;
        console.log("PromptPilot: Click detected.");

        if (!chrome?.runtime?.id) {
            showFeedback("Page refresh needed", "#f59e0b");
            return;
        }

        if (!lastFocusedInput) {
            showFeedback("Click a chat input first!", "#f59e0b");
            return;
        }

        const text = (lastFocusedInput.value || lastFocusedInput.innerText || "").trim();
        if (!text) {
            showFeedback("Write something first!", "#f59e0b");
            return;
        }

        ppBadge.classList.add("enhancing");
        ppBadge.innerHTML = `<span class="pp-spinner"></span>`;
        showFeedback("Enhancing...", "#3b82f6");

        try {
            console.log("PromptPilot: Fetching settings from storage...");
            const storage = await chrome.storage.local.get(["pp_mode"]);
            const mode = storage.pp_mode || "professional";

            console.log("PromptPilot: Sending message to background for mode:", mode);
            chrome.runtime.sendMessage({
                type: "TRANSFORM_PROMPT",
                data: { text, mode }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError.message);
                    showFeedback("Service Error — Refresh page", "#ef4444");
                    resetBadge();
                    return;
                }

                console.log("PromptPilot: Response received from background:", !!response);
                if (response?.error) {
                    console.error("PromptPilot API Error:", response.error);
                    showFeedback(response.error.includes("Login") ? "Sign in from extension popup!" : "Error: " + response.error, "#ef4444");
                } else if (response?.transformed) {
                    injectText(response.transformed);
                    showFeedback("Done! ✨", "#10b981");
                } else {
                    showFeedback("No response", "#ef4444");
                }
                resetBadge();
            });
        } catch (err) {
            console.error("PromptPilot Task Error:", err);
            showFeedback("Error", "#ef4444");
            resetBadge();
        }
    });

    // Drag support
    ppBadge.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = ppBadge.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const onMove = (mE) => {
            if (Math.abs(mE.clientX - startX) > 5 || Math.abs(mE.clientY - startY) > 5) {
                isDragging = true;
            }
            if (isDragging) {
                ppBadge.style.left = (mE.clientX - offsetX) + "px";
                ppBadge.style.top = (mE.clientY - offsetY) + "px";
                ppBadge.style.right = "auto";
                ppBadge.style.bottom = "auto";
            }
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });
}

function showBadge() {
    if (!ppBadge) return;
    ppBadge.style.opacity = "1";
    ppBadge.style.pointerEvents = "auto";
    ppBadge.style.transform = "scale(1)";
}

function hideBadge() {
    if (!ppBadge) return;
    ppBadge.style.opacity = "0";
    ppBadge.style.pointerEvents = "none";
    ppBadge.style.transform = "scale(0.8)";
}

function injectText(text) {
    if (!lastFocusedInput) return;
    lastFocusedInput.focus();
    if (lastFocusedInput.tagName === "TEXTAREA" || lastFocusedInput.tagName === "INPUT") {
        lastFocusedInput.value = text;
        lastFocusedInput.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
        // contenteditable
        lastFocusedInput.focus();
        document.execCommand("selectAll", false, null);
        document.execCommand("insertText", false, text);
        lastFocusedInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
}

function showFeedback(text, color) {
    const existing = document.getElementById("pp-feedback-pop");
    if (existing) existing.remove();

    const pop = document.createElement("div");
    pop.id = "pp-feedback-pop";
    pop.className = "pp-feedback-pop";
    pop.style.cssText = `
        position: fixed;
        bottom: 140px;
        right: 24px;
        background: ${color};
        color: white;
        font-size: 12px;
        font-weight: 600;
        padding: 8px 14px;
        border-radius: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: 260px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: ppFadeIn 0.2s ease;
    `;
    pop.textContent = text;
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 3500);
}

function resetBadge() {
    if (!ppBadge) return;
    ppBadge.classList.remove("enhancing");
    ppBadge.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C12 2 17 8 17 13C17 18 12 21 12 21C12 21 7 18 7 13C7 8 12 2 12 2Z"/>
        <path d="M12 8V13"/>
        <path d="M7 16L3 20"/>
        <path d="M17 16L21 20"/>
      </svg>
    `;
}

// Show badge when an input is focused
document.addEventListener("focusin", (e) => {
    const target = e.target;
    if (!target) return;
    const el = target.closest(inputSelectors);
    if (el) {
        lastFocusedInput = el;
        showBadge();
    }
}, true);

// Hide badge when focus moves away from inputs
document.addEventListener("focusout", (e) => {
    // Small delay to allow click on badge itself
    setTimeout(() => {
        const focused = document.activeElement;
        if (!focused || (!focused.closest(inputSelectors) && focused.id !== "pp-badge")) {
            hideBadge();
        }
    }, 200);
}, true);

// Also hide when clicking anywhere EXCEPT on an input or the badge
document.addEventListener("click", (e) => {
    if (e.target === ppBadge || ppBadge?.contains(e.target)) return;
    const onInput = e.target.closest(inputSelectors);
    if (!onInput) {
        setTimeout(hideBadge, 150);
    }
}, true);

// Inject keyframe animation
const style = document.createElement("style");
style.textContent = `@keyframes ppFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

createBadge();

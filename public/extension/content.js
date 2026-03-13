let lastFocusedInput = null;
let ppBadge = null;
let isDragging = false;
let startX, startY;
let cachedMode = "professional"; // Cache mode — updated once on load

// Pre-load mode setting once (not on every click)
chrome.storage.local.get(["pp_mode"], (data) => {
    if (data.pp_mode) cachedMode = data.pp_mode;
});

// Listen for mode changes from popup
chrome.storage.onChanged.addListener((changes) => {
    if (changes.pp_mode) cachedMode = changes.pp_mode.newValue || "professional";
});

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

        // ⚡ Use cached mode — no storage read needed
        console.log("PromptPilot: Sending message to background for mode:", cachedMode);
        chrome.runtime.sendMessage({
            type: "TRANSFORM_PROMPT",
            data: { text, mode: cachedMode }
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
                showFeedback(response.error.includes("Login") ? "Click extension icon to sign in!" : "Error", "#ef4444");
            } else if (response?.transformed) {
                injectText(response.transformed);
                showFeedback("Done! ✨", "#10b981");
            } else {
                showFeedback("No response", "#ef4444");
            }
            resetBadge();
        });
    });
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

function showFeedback(text, type = "info") {
    const existing = document.getElementById("pp-feedback-pop");
    if (existing) existing.remove();

    const pop = document.createElement("div");
    pop.id = "pp-feedback-pop";
    pop.className = "pp-feedback-pop";

    let iconSvg = '';
    let iconColor = '';
    
    if (type === "loading") {
        iconColor = "#3b82f6";
        iconSvg = `<svg class="pp-toast-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
    } else if (type === "success") {
        iconColor = "#10b981";
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "error") {
        iconColor = "#ef4444";
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
        iconColor = "#f5f5f5";
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    pop.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: ${iconColor}20; flex-shrink: 0;">
            ${iconSvg}
        </div>
        <span style="letter-spacing: 0.2px; font-weight: 500;">${text}</span>
    `;

    pop.style.cssText = `
        position: fixed;
        bottom: 140px;
        right: 24px;
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #f5f5f4;
        font-size: 13.5px;
        padding: 10px 18px 10px 10px;
        border-radius: 999px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), 0 2px 8px rgba(0, 0, 0, 0.12);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: ppToastEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-origin: bottom right;
        pointer-events: none;
    `;

    document.body.appendChild(pop);
    
    setTimeout(() => {
        if (pop) {
            pop.style.animation = 'ppToastExit 0.3s cubic-bezier(0.7, 0, 0.84, 0) forwards';
            setTimeout(() => pop.remove(), 300);
        }
    }, 4000);
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
    setTimeout(() => {
        const focused = document.activeElement;
        if (!focused || (!focused.closest(inputSelectors) && focused.id !== "pp-badge")) {
            hideBadge();
        }
    }, 200);
}, true);

// Hide when clicking outside
document.addEventListener("click", (e) => {
    if (e.target === ppBadge || ppBadge?.contains(e.target)) return;
    const onInput = e.target.closest(inputSelectors);
    if (!onInput) {
        setTimeout(hideBadge, 150);
    }
}, true);

// Premium generic animations
const style = document.createElement("style");
style.textContent = `
    @keyframes ppToastEnter {
        0% { opacity: 0; transform: translateY(24px) scale(0.9); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ppToastExit {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(12px) scale(0.95); }
    }
    @keyframes ppSpinAnim {
        100% { transform: rotate(360deg); }
    }
    .pp-toast-spin {
        animation: ppSpinAnim 1.2s linear infinite;
    }
`;
document.head.appendChild(style);

createBadge();

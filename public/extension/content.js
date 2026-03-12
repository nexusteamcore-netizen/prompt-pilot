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
    console.log("PromptPilot: Creating badge...");

    ppBadge = document.createElement("button");
    ppBadge.className = "pp-enhance-btn";
    ppBadge.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C12 2 17 8 17 13C17 18 12 21 12 21C12 21 7 18 7 13C7 8 12 2 12 2Z"/>
      <path d="M12 8V13"/>
      <path d="M7 16L3 20"/>
      <path d="M17 16L21 20"/>
    </svg>
  `;

    // Initialize style
    Object.assign(ppBadge.style, {
        bottom: "40px",
        right: "40px",
        opacity: "0",
        pointerEvents: "none",
        position: "fixed"
    });

    document.body.appendChild(ppBadge);

    // Click Logic
    ppBadge.addEventListener("click", async (e) => {
        if (isDragging) return;
        console.log("PromptPilot: Click detected.");

        if (!chrome?.runtime?.id) {
            console.error("PromptPilot: Context invalidated. Please refresh the page.");
            alert("PromptPilot: Please refresh the page (Session expired).");
            return;
        }

        if (!lastFocusedInput) {
            console.warn("PromptPilot: No input field focused.");
            showFeedback("Click a chat box first!", "#f59e0b");
            return;
        }

        const text = (lastFocusedInput.value || lastFocusedInput.innerText || "").trim();
        if (!text) {
            console.warn("PromptPilot: Input is empty.");
            showFeedback("Write something first!", "#f59e0b");
            return;
        }

        // Start animation
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
                    console.error("Runtime error:", chrome.runtime.lastError);
                    showFeedback("Service Error", "#ef4444");
                    resetBadge();
                    return;
                }

                console.log("PromptPilot: Response received from background:", !!response);
                if (response?.error) {
                    console.error("PromptPilot API Error:", response.error);
                    showFeedback(response.error, "#ef4444");
                } else if (response?.transformed) {
                    console.log("PromptPilot: Injecting transformed text.");
                    injectText(response.transformed);
                    showFeedback("Done! ✨", "#10b981");
                } else {
                    console.error("PromptPilot: Empty or invalid response.");
                    showFeedback("Failed (No Data)", "#ef4444");
                }
                resetBadge();
            });
        } catch (err) {
            console.error("PromptPilot Task Error:", err);
            showFeedback("System Error", "#ef4444");
            resetBadge();
        }
    });

    // Dragging logic
    ppBadge.addEventListener("mousedown", (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = ppBadge.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const move = (mE) => {
            if (Math.abs(mE.clientX - startX) > 5 || Math.abs(mE.clientY - startY) > 5) isDragging = true;
            if (isDragging) {
                ppBadge.style.left = (mE.clientX - offsetX) + "px";
                ppBadge.style.top = (mE.clientY - offsetY) + "px";
                ppBadge.style.right = "auto"; ppBadge.style.bottom = "auto";
            }
        };
        const up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        };
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    });
}

function injectText(text) {
    if (!lastFocusedInput) return;
    lastFocusedInput.focus();
    if (lastFocusedInput.tagName === "TEXTAREA" || lastFocusedInput.tagName === "INPUT") {
        lastFocusedInput.value = text;
    } else {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
    }
    lastFocusedInput.dispatchEvent(new Event('input', { bubbles: true }));
}

function showFeedback(text, color) {
    const pop = document.createElement("div");
    pop.className = "pp-feedback-pop";
    pop.style.background = color;
    pop.innerText = text;
    ppBadge.appendChild(pop);
    setTimeout(() => pop.remove(), 3000);
}

function resetBadge() {
    if (!ppBadge) return;
    ppBadge.classList.remove("enhancing");
    ppBadge.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C12 2 17 8 17 13C17 18 12 21 12 21C12 21 7 18 7 13C7 8 12 2 12 2Z"></path><path d="M12 8V13"></path><path d="M7 16L3 20"></path><path d="M17 16L21 20"></path></svg>`;
}

document.addEventListener("focusin", (e) => {
    const target = e.target;
    if (!target) return;
    const inputElement = target.closest && target.closest(inputSelectors.join(','));
    const isContentEditable = target.closest && target.closest('[contenteditable="true"]');
    if (inputElement || isContentEditable) {
        lastFocusedInput = inputElement || isContentEditable;
        if (ppBadge) {
            ppBadge.style.opacity = "1";
            ppBadge.style.pointerEvents = "auto";
            ppBadge.style.transform = "scale(1)";
        }
    }
});

createStartupBadge();

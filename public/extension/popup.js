const BASE_URL = "https://prompt-pilot-lime.vercel.app";

// Sections
const sLoading = document.getElementById("s-loading");
const sConnected = document.getElementById("s-connected");
const sNosite = document.getElementById("s-nosite");
const sLogin = document.getElementById("s-login");

function show(el) {
  [sLoading, sConnected, sNosite, sLogin].forEach(s => s.style.display = "none");
  el.style.display = "block";
}

function showConnected(email) {
  document.getElementById("disp-email").textContent = email || "";
  show(sConnected);
}

// ── On popup open ────────────────────────────────────────────────
show(sLoading);

chrome.storage.local.get(["pp_token", "pp_email", "pp_mode"], async (data) => {
  if (data.pp_token) {
    // Already have a saved token
    showConnected(data.pp_email || "");
    if (data.pp_mode) highlightMode(data.pp_mode);
    return;
  }

  // Try to auto-detect from open website tab
  chrome.runtime.sendMessage({ type: "GET_TOKEN_FROM_SITE" }, (resp) => {
    if (resp?.token) {
      chrome.storage.local.set({
        pp_token: resp.token,
        pp_email: resp.email || "",
        pp_base_url: resp.baseUrl || BASE_URL,
        pp_mode: "professional"
      }, () => showConnected(resp.email || "Auto-connected ✓"));
    } else {
      // Show no-site screen
      show(sNosite);
    }
  });
});

// ── Mode selection ───────────────────────────────────────────────
function highlightMode(mode) {
  document.querySelectorAll(".mode-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });
}

document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    highlightMode(btn.dataset.mode);
    chrome.storage.local.set({ pp_mode: btn.dataset.mode });
  });
});

// ── Logout ───────────────────────────────────────────────────────
document.getElementById("btn-logout").addEventListener("click", () => {
  chrome.storage.local.remove(["pp_token", "pp_email", "pp_mode", "pp_base_url"], () => {
    show(sNosite);
  });
});

// ── Open website button ──────────────────────────────────────────
document.getElementById("btn-open-site").addEventListener("click", () => {
  chrome.tabs.create({ url: BASE_URL + "/dashboard" });
  window.close();
});

// ── Manual login (from s-nosite) ─────────────────────────────────
async function doLogin(email, password, errEl, btnEl) {
  errEl.style.display = "none";
  if (!email || !password) { errEl.textContent = "Fill in email and password."; errEl.style.display = "block"; return; }
  btnEl.disabled = true; btnEl.textContent = "Signing in...";

  try {
    const res = await fetch(`${BASE_URL}/api/ext-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Login failed");

    chrome.storage.local.set({
      pp_token: json.access_token,
      pp_email: json.email || email,
      pp_base_url: BASE_URL,
      pp_mode: "professional"
    }, () => showConnected(json.email || email));
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "block";
    btnEl.disabled = false;
    btnEl.textContent = "Sign In";
  }
}

document.getElementById("btn-manual-login").addEventListener("click", () => {
  doLogin(
    document.getElementById("em").value.trim(),
    document.getElementById("pw").value.trim(),
    document.getElementById("err-nosite"),
    document.getElementById("btn-manual-login")
  );
});

document.getElementById("btn-login2")?.addEventListener("click", () => {
  doLogin(
    document.getElementById("em2").value.trim(),
    document.getElementById("pw2").value.trim(),
    document.getElementById("err-login"),
    document.getElementById("btn-login2")
  );
});

// Enter key support
["pw", "pw2"].forEach(id => {
  document.getElementById(id)?.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById(id === "pw" ? "btn-manual-login" : "btn-login2")?.click();
  });
});

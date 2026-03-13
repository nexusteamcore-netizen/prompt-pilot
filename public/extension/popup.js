const BASE_URL = "https://prompt-pilot-lime.vercel.app";

const loginSection = document.getElementById("login-section");
const loggedInSection = document.getElementById("logged-in-section");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const errorMsg = document.getElementById("error-msg");
const userEmailDisplay = document.getElementById("user-email-display");

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

function hideError() {
  errorMsg.style.display = "none";
}

function showLoggedIn(email) {
  loginSection.style.display = "none";
  loggedInSection.style.display = "block";
  userEmailDisplay.textContent = email || "";
}

function showLoginForm() {
  loginSection.style.display = "block";
  loggedInSection.style.display = "none";
}

// On popup open, check if already logged in
chrome.storage.local.get(["pp_token", "pp_email", "pp_mode"], (data) => {
  if (data.pp_token) {
    showLoggedIn(data.pp_email || "");
    // Highlight active mode
    const currentMode = data.pp_mode || "professional";
    document.querySelectorAll(".mode-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === currentMode);
    });
  } else {
    showLoginForm();
  }
});

// Login handler
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  hideError();

  if (!email || !password) {
    showError("Please enter email and password.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";

  try {
    const res = await fetch(`${BASE_URL}/api/ext-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Login failed. Check your credentials.");
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";
      return;
    }

    // Save token and email
    chrome.storage.local.set({
      pp_token: data.access_token,
      pp_email: data.email || email,
      pp_base_url: BASE_URL,
      pp_mode: "professional"
    }, () => {
      console.log("PromptPilot: Token saved successfully!");
      showLoggedIn(data.email || email);
    });

  } catch (err) {
    showError("Connection error. Is the extension online?");
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";
  }
});

// Allow pressing Enter to login
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});
emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") passwordInput.focus();
});

// Mode selection
document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    chrome.storage.local.set({ pp_mode: btn.dataset.mode });
  });
});

// Logout
logoutBtn.addEventListener("click", () => {
  chrome.storage.local.remove(["pp_token", "pp_email", "pp_mode", "pp_base_url"], () => {
    showLoginForm();
  });
});

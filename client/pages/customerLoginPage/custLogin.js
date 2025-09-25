// ==================== CAPTCHA ====================
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const captchaText = document.getElementById("captcha-text");
  captchaText.innerText = captcha;
  document.getElementById("captcha-input").value = ""; 
}

window.addEventListener("load", generateCaptcha);

// ==================== Password Validation with Eye Toggle ====================
const passwordInput = document.getElementById("password");
const errorList = document.getElementById("password-error");
const toggleEye = document.getElementById("toggle-password");

// Eye toggle show/hide
if (toggleEye) {
  toggleEye.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  });
}

// Password rules definition
const rules = [
  { regex: /.{8,}/, message: "Must be at least 8 characters long" },
  { regex: /[A-Z]/, message: "Must contain at least 1 uppercase letter" },
  { regex: /[a-z]/, message: "Must contain at least 1 lowercase letter" },
  { regex: /[0-9]/, message: "Must contain at least 1 number" },
  { regex: /[!@#$%^&*]/, message: "Must contain at least 1 special character (!@#$%^&*)" },
];

// Real-time validation
passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  errorList.innerHTML = "";

  rules.forEach(rule => {
    if (!rule.regex.test(password)) {
      const li = document.createElement("li");
      li.textContent = rule.message;
      li.style.color = "red";
      errorList.appendChild(li);
    }
  });
});

// Check if all rules are satisfied
function validatePassword() {
  const password = passwordInput.value;
  return rules.every(rule => rule.regex.test(password));
}

// ==================== Login ====================
document.getElementById("password-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const custId = document.getElementById("custId").value.trim();
  const password = passwordInput.value.trim();
  const enteredCaptcha = document.getElementById("captcha-input").value.trim();
  const actualCaptcha = document.getElementById("captcha-text").innerText.trim();

  // ===== FORM VALIDATION =====
  if (!custId) {
    alert("Please enter your Customer ID.");
    document.getElementById("custId").focus();
    return;
  }
  if (!password) {
    alert("Please enter your password.");
    passwordInput.focus();
    return;
  }
  if (!validatePassword()) {
    alert("Please ensure your password meets all requirements.");
    passwordInput.focus();
    return;
  }
  if (!enteredCaptcha) {
    alert("Please enter the CAPTCHA.");
    document.getElementById("captcha-input").focus();
    return;
  }
  if (enteredCaptcha.toUpperCase() !== actualCaptcha.toUpperCase()) {
    alert("Captcha does not match. Try again.");
    generateCaptcha();
    document.getElementById("captcha-input").focus();
    return;
  }

  // ===== Show loading state =====
  const submitButton = document.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Logging in...';
  submitButton.disabled = true;

  try {
    const requestBody = { custId, password };
    console.log("=== DEBUG INFO ===");
    console.log("Request URL:", "http://localhost:8080/auth/userlogin");
    console.log("Request method:", "POST");
    console.log("Request body:", { custId, password: password.substring(0, 2) + "***" });

    // ===== Login request =====
    const response = await fetch("http://localhost:8080/auth/userlogin", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    console.log("=== RESPONSE INFO ===");
    console.log("Status:", response.status, response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    // Read body ONCE
    const responseText = await response.text();
    console.log("Raw response body:", responseText);

    let responseData = null;
    try {
      responseData = JSON.parse(responseText);
      console.log("Parsed JSON:", responseData);
    } catch {
      console.log("Response is not JSON");
    }

    if (response.ok) {
      if (responseData && responseData.token) {
        localStorage.setItem("userToken", responseData.token);
        localStorage.setItem("custId", custId);

        if (responseData.user) {
          localStorage.setItem("userData", JSON.stringify(responseData.user));
        }

        const loginInfo = {
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
          custId: custId,
          role: responseData.role || 'USER'
        };
        localStorage.setItem("userLoginInfo", JSON.stringify(loginInfo));

        alert("Login successful!");
        setTimeout(() => {
          window.location.href = '/dashBoardPage/accounts.html';
        }, 1000);
      } else {
        alert("Login failed: No token received from server.");
        generateCaptcha();
      }
    } else {
      const errorMessage = responseData?.message || responseData?.error || `Login failed with status: ${response.status}`;
      console.error("Login failed:", errorMessage);
      alert("Login failed: " + errorMessage);
      generateCaptcha();
    }

  } catch (error) {
    console.error("Network error during login:", error);
    alert("Failed to connect to server. Please check your internet connection and try again.");
    generateCaptcha();
  } finally {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
});

// ==================== Additional Helpers ====================
window.addEventListener("load", function() {
  document.getElementById("custId").value = "";
  passwordInput.value = "";
  document.getElementById("captcha-input").value = "";
  document.getElementById("custId").focus();
});

window.addEventListener("beforeunload", function() {
  passwordInput.value = "";
  document.getElementById("captcha-input").value = "";
});

document.getElementById("custId").addEventListener("keypress", function(e) {
  if (e.key === "Enter") passwordInput.focus();
});
passwordInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") document.getElementById("captcha-input").focus();
});
document.getElementById("captcha-input").addEventListener("keypress", function(e) {
  if (e.key === "Enter") document.getElementById("password-form").dispatchEvent(new Event('submit'));
});

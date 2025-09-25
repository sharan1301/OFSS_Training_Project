
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
toggleEye.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});
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
  // Show only rules that are not yet satisfied
  rules.forEach(rule => {
    if (!rule.regex.test(password)) {
      const li = document.createElement("li");
      li.textContent = rule.message;
      li.style.color = "red";  // unsatisfied rules in red
      errorList.appendChild(li);
    }
  });
});
// Check if all rules are satisfied (used for form submission)
function validatePassword() {
  const password = passwordInput.value;
  return rules.every(rule => rule.regex.test(password));
}
// ==================== Login ====================
document.getElementById("password-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validatePassword()) return;
  const custId = document.getElementById("custId").value.trim();
  const password = passwordInput.value.trim();
  const enteredCaptcha = document.getElementById("captcha-input").value.trim();
  const actualCaptcha = document.getElementById("captcha-text").innerText.trim();
  // ===== CAPTCHA validation =====
  if (!enteredCaptcha) {
    alert("Please enter the CAPTCHA.");
    return;
  }
  if (enteredCaptcha.toUpperCase() !== actualCaptcha.toUpperCase()) {
    alert("Captcha does not match. Try again.");
    generateCaptcha(); // regenerate captcha
    return;
  }
  // ===== Login request =====
  fetch("http://localhost:8080/auth/userlogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ custId, password })
  })
    .then(async res => {
      if (res.ok) {
        const data = await res.json(); // :point_left: expect JWT in response
        if (data.token) {
          localStorage.setItem("jwtToken", data.token);  // Store JWT token
          localStorage.setItem("custId", custId); // :key: save token
          alert("Login successful!");
          setTimeout(() => window.location.href = "../dashBoardPage/accounts.html", 1000);
        } else {
          alert("Login failed: No token received.");
        }
      } else {
        const msg = await res.text();
        alert("Invalid Customer ID or Password. " + msg);
      }
    })
    .catch(() => alert("Server error"));
});




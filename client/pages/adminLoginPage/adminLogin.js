// ✅ Captcha generator
 function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("captcha-text").innerText = captcha;
}
document.addEventListener("DOMContentLoaded", generateCaptcha);

// ✅ Password validation
function validatePassword() {
  const password = document.getElementById("password").value;
  const errorList = document.getElementById("password-error");
  errorList.innerHTML = "";

  let errors = [];

  if (password.length < 8) errors.push("Must be at least 8 characters long");
  if (!/[A-Z]/.test(password)) errors.push("Must contain at least 1 uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Must contain at least 1 lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Must contain at least 1 number");
  if (!/[!@#$%^&*]/.test(password)) errors.push("Must contain at least 1 special character (!@#$%^&*)");

  if (errors.length > 0) {
    errors.forEach(err => {
      let li = document.createElement("li");
      li.textContent = err;
      errorList.appendChild(li);
    });
    return false;
  }
  return true;
}
document.getElementById("password").addEventListener("input", validatePassword);

// ✅ Toast message
function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.textContent = type === "success" ? "🎉 " + message : message;

  toast.className = "toast " + type + " show";

  if (type === "success") {
    launchConfetti();
  }

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ✅ Confetti animation
function launchConfetti() {
  const duration = 1.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 1, y: 0 } // from right
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// ✅ Password form submission
document.getElementById("password-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validatePassword()) return;

  const enteredCaptcha = document.getElementById("captcha-input").value;
  const actualCaptcha = document.getElementById("captcha-text").innerText;

  // 👇 Collect login details (assuming you also have username field)
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      // ✅ Save JWT to localStorage
      localStorage.setItem("jwtToken", data.token);

      showToast("✅ Successful Login", "success");
      setTimeout(() => window.location.href = "admin.html", 2000);
    } else {
      const errorMsg = await response.text();
      showToast("❌ " + errorMsg, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("❌ Failed to connect to server", "error");
  }
});

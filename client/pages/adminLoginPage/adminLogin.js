// ✅ Captcha generator
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("captcha-text").innerText = captcha;
}

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

// ✅ Clear any existing session data when login page loads
function clearExistingSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("adminData");
  localStorage.removeItem("loginInfo");
  localStorage.removeItem("adminName");
  localStorage.removeItem("userData");
}

// ✅ Password form submission with admin data storage
document.getElementById("password-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validatePassword()) return;

  const enteredCaptcha = document.getElementById("captcha-input").value;
  const actualCaptcha = document.getElementById("captcha-text").innerText;

  // Validate captcha
  if (enteredCaptcha !== actualCaptcha) {
    showToast("❌ Invalid captcha. Please try again.", "error");
    generateCaptcha();
    document.getElementById("captcha-input").value = "";
    return;
  }

  // 👇 Collect login details
  const workId = document.getElementById("workId").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8080/auth/adminlogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({workId, password})
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Login response:", data);
      
      // ✅ Save JWT token (using adminToken to match dashboard)
      localStorage.setItem("adminToken", data.token);
      
      // ✅ Save admin data (the logged-in admin's information)
      if (data.admin) {
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        console.log("✅ Admin data stored:", data.admin);
      }
      
      // ✅ Save login session info
      const loginInfo = {
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
        workId: workId,
        role: data.role || data.admin?.role || 'admin',
        adminName: data.admin?.name || workId
      };
      localStorage.setItem("loginInfo", JSON.stringify(loginInfo));
      console.log("✅ Login info stored:", loginInfo);

      showToast("✅ Successful Login", "success");
      setTimeout(() => window.location.href = '../admin/admindashboard.html', 2000);
    } else {
      const errorMsg = await response.text();
      showToast("❌ " + errorMsg, "error");
      generateCaptcha();
      document.getElementById("captcha-input").value = "";
    }
  } catch (err) {
    console.error(err);
    showToast("❌ Failed to connect to server", "error");
    generateCaptcha();
    document.getElementById("captcha-input").value = "";
  }
});

// ✅ Utility functions to get stored admin data
function getAdminData() {
  try {
    const adminData = localStorage.getItem("adminData");
    const loginInfo = localStorage.getItem("loginInfo");
    return {
      admin: adminData ? JSON.parse(adminData) : null,
      loginInfo: loginInfo ? JSON.parse(loginInfo) : null,
      token: localStorage.getItem("adminToken")
    };
  } catch (error) {
    console.error("Error getting admin data:", error);
    return { admin: null, loginInfo: null, token: null };
  }
}

// ✅ Clear admin session
function clearAdminSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("adminData");
  localStorage.removeItem("loginInfo");
  localStorage.removeItem("adminName");
  localStorage.removeItem("userData");
}

// ✅ Initialize login page - clear any existing session and generate captcha
document.addEventListener("DOMContentLoaded", function() {
  // Clear any existing session data for fresh login
  clearExistingSession();
  
  // Generate new captcha
  generateCaptcha();
  
  // Focus on work ID field
  document.getElementById("workId").focus();
  
  console.log("✅ Login page initialized - ready for fresh login");
});

// ✅ Clear form data when page is about to unload (for security)
window.addEventListener("beforeunload", function() {
  document.getElementById("password").value = "";
  document.getElementById("captcha-input").value = "";
});

// ✅ Export functions for use in other pages
window.adminAuth = {
  getAdminData,
  clearAdminSession
};
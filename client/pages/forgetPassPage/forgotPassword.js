function sendOTP() {
  const email = document.getElementById("email").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email");
    return;
  }

  fetch(`http://localhost:8080/users/auth/send-otp?email=${encodeURIComponent(email)}`, {
    method: "POST"
  })
    .then(async res => {
      const msg = await res.text();
      if (res.ok) {
        alert("OTP sent to " + email);
        document.getElementById("otp-section").style.display = "block";
      } else {
        alert(msg);
      }
    })
    .catch(() => alert("Server error"));
}

// Verify OTP
document.getElementById("otp-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();

  fetch(`http://localhost:8080/users/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`, {
    method: "POST"
  })
    .then(async res => {
      const msg = await res.text();
      if (res.ok) {
        launchConfetti();
        setTimeout(() => window.location.href = "../dashBoardPage/accounts.html", 2000);
      } else {
        alert("Invalid OTP");
      }
    })
    .catch(() => alert("Server error"));
});

function showResetForm() {
  document.getElementById("otp-form").style.display = "none"; 
  const container = document.querySelector(".login-card");

  container.innerHTML += `
    <form id="reset-form" class="login-form">
      <input type="text" id="username" placeholder="Enter your username" required />
      <input type="password" id="newPassword" placeholder="Enter new password" required />
      <input type="password" id="confirmPassword" placeholder="Confirm new password" required />
      <ul id="password-error"></ul>
      <button type="submit">Reset Password</button>
    </form>
  `;

document.getElementById("reset-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    fetch(`http://localhost:8080/users/auth/reset-password?username=${encodeURIComponent(username)}&newPassword=${encodeURIComponent(newPassword)}`, {
      method: "POST"
    })
    .then(async res => {
      const msg = await res.text();
      if (res.ok) {
        alert(msg);
        window.location.href = "../customerLogin/custLogin.html";
      } else {
        alert(msg);
      }
    })
    .catch(() => alert("Server error"));
  });
}
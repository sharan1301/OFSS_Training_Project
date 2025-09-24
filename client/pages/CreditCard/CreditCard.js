const token =localStorage.getItem("jwtToken");
if(!token){
    window.location.href="../loginPage/login.html"
}
let generatedEmailOTP = null;
let generatedAadhaarOTP = null;

// Utility to generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Email OTP flow
function sendEmailOTP() {
  generatedEmailOTP = generateOTP();
  alert("Email OTP: " + generatedEmailOTP);
  console.log("Email OTP:", generatedEmailOTP);
}

function verifyEmailOTP() {
  const enteredOtp = document.getElementById("emailOtp").value;
  if (enteredOtp == generatedEmailOTP) {
    alert("✅ Email OTP Verified Successfully!");
  } else {
    alert("❌ Invalid Email OTP. Try again.");
  }
}

// Aadhaar OTP flow
function sendAadhaarOTP() {
  generatedAadhaarOTP = generateOTP();
  alert("Aadhaar OTP: " + generatedAadhaarOTP);
  console.log("Aadhaar OTP:", generatedAadhaarOTP);
}

function verifyAadhaarOTP() {
  const enteredOtp = document.getElementById("aadhaarOtp").value;
  if (enteredOtp == generatedAadhaarOTP) {
    alert("✅ Aadhaar OTP Verified Successfully!");
  } else {
    alert("❌ Invalid Aadhaar OTP. Try again.");
  }
}


  function showForm(cardName) {
    // Show confirmation message
    const msg = `You are applying for the card:\n\nName: ${cardName}\nNumber: ${cardNumber}\n\nDo you want to proceed?`;
    if (confirm(msg)) {
      // Show the form
      document.getElementById("apply-form").classList.remove("hidden");
      
    }
  }
document.addEventListener('DOMContentLoaded', function() {
    const cardContainers = document.querySelectorAll('.card-container');
    cardContainers.forEach(cardContainer => {
        // Flip on click
        cardContainer.addEventListener('click', function() {
            this.classList.toggle('flipped');
            // Reset transform when flipped/unflipped
            if (this.classList.contains('flipped')) {
                this.style.transform = 'perspective(1000px) rotateY(180deg)';
            } else {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            }
        });
        // Tilt effect on mouse move relative to each card individually
        cardContainer.addEventListener('mousemove', function(e) {
            if (this.classList.contains('flipped')) return;
            const boundingRect = this.getBoundingClientRect();
            const cardCenterX = boundingRect.left + boundingRect.width / 2;
            const cardCenterY = boundingRect.top + boundingRect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const deltaX = (mouseX - cardCenterX) / (boundingRect.width / 2);
            const deltaY = (mouseY - cardCenterY) / (boundingRect.height / 2);
            const tiltX = deltaY * 10;  // Tilt card around X axis
            const tiltY = -deltaX * 10; // Tilt card around Y axis, increased for better effect
            this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });
        // Reset tilt on mouse leave
        cardContainer.addEventListener('mouseleave', function() {
            if (!this.classList.contains('flipped')) {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            }
        });
        // Shine effect on touchstart (tap)
        cardContainer.addEventListener('touchstart', function() {
            const shine = this.querySelector('.shine');
            if (!shine) return;
            shine.style.animation = 'none';
            setTimeout(() => {
                shine.style.animation = 'shine 5s infinite';
            }, 10);
        });
    });
});


// Form Submit Handler
async function submitApplication(event) {
  event.preventDefault();

  const data = {
    fullName: document.getElementById("fullName").value,
    dateOfBirth: document.getElementById("dateOfBirth").value,
    gender: document.getElementById("gender").value,
    mobileNumber: document.getElementById("mobileNumber").value,
    emailAddress: document.getElementById("emailAddress").value,
    panNumber: document.getElementById("panNumber").value,
    aadhaarNumber: document.getElementById("aadhaarNumber").value,
    address: document.getElementById("address").value,
    pincode: document.getElementById("pincode").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    occupation: document.getElementById("occupation").value,
    employer: document.getElementById("employer").value,
    annualIncome: parseFloat(document.getElementById("annualIncome").value),
    cardType: document.getElementById("cardType").value,
    paymentMethod: document.getElementById("paymentMethod").value
  };
  
  const token = localStorage.getItem("jwtToken");

  const username = "user"; // or "admin"
  const password = "1234"; 
  try {
    const res = await fetch("http://localhost:8080/credit-card/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json",
                // "Authorization": "Basic " + btoa(username + ":" + password),
                 "Authorization": token ? `Bearer ${token}` : "" 
       },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Application submitted successfully!");
      document.getElementById("creditForm").reset(); // clear form
    } else {
      const err = await res.text();
      alert("Error submitting application: " + err);
    }
  } catch (error) {
    alert("Network error: " + error.message);
  }
}

// Attach event listener when DOM loads
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("creditForm").addEventListener("submit", submitApplication);
});


function checkStatus() {
    const aadhaar = document.getElementById("statusAadhaar").value;
    const resultDiv = document.getElementById("statusResult");

    // Clear previous result
    resultDiv.innerHTML = "";

    const username = "user"; // or "admin"
    const password = "1234";
    
    const token = localStorage.getItem("jwtToken"); 

    fetch(`http://localhost:8080/credit-card/status/${aadhaar}`, {
        method: "GET",
        headers: {
            // "Authorization": "Basic " + btoa(username + ":" + password),
            "Content-Type": "application/json",
             "Authorization": token ? `Bearer ${token}` : "" 
        }
    })
    .then(response => {
        if (response.ok) return response.json();
        if (response.status === 404) return response.json().then(data => { throw new Error(data.error) });
        throw new Error("Something went wrong");
    })
    .then(data => {
        if (data.length === 0) {
            resultDiv.innerHTML = `<p>No applications found.</p>`;
            return;
        }

        // Create a table for multiple results
        let html = `<table border="1" cellpadding="5">
                        <tr>
                            <th>Full Name</th>
                            <th>Aadhaar</th>
                            <th>Status</th>
                            <th>Card Type</th>
                            <th>Remark</th>
                        </tr>`;

        data.forEach(app => {
            html += `<tr>
                        <td>${app.fullName}</td>
                        <td>${app.aadhaarNumber}</td>
                        <td>${app.status}</td>
                        <td>${app.cardType}</td>
                        <td>${app.remark}</td>
                    </tr>`;
        });

        html += `</table>`;
        resultDiv.innerHTML = html;
    })
    .catch(err => {
        resultDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
    });

    return false;
}












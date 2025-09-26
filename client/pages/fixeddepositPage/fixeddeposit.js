// fixeddeposit.js

// Sample Fixed Deposit data
const fixedDeposits = [
    {
        "fdId": 808,
        "account": {
            "accountId": 700,
        },
        "depositAmount": 110000.0,
        "interestRate": 6.5,
        "maturityAmount": 117326.176967065,
        "maturityDate": "2026-09-18",
        "startDate": "2025-09-18",
        "status": "MATURED",
        "tenureMonths": 12,
        "autoRenewal": null,
        "createdAt": "2025-09-19T01:44:38",
        "updatedAt": "2025-09-19T09:23:45"
    },
    {
        "fdId": 821,
        "account": {
            "accountId": 700,
        },
        "depositAmount": 2000.0,
        "interestRate": 7.5,
        "maturityAmount": 2075.83333333333,
        "maturityDate": "2026-02-17",
        "startDate": "2025-02-17",
        "status": "MATURED",
        "tenureMonths": 12,
        "autoRenewal": null,
        "createdAt": "2025-09-20T16:27:33",
        "updatedAt": "2025-09-20T16:30:20"
    },
    {
        "fdId": 804,
        "account": {
            "accountId": 700,
        },
        "depositAmount": 100000.0,
        "interestRate": 6.5,
        "maturityAmount": 106660.16087915,
        "maturityDate": "2026-09-18",
        "startDate": "2025-09-18",
        "status": "ACTIVE",
        "tenureMonths": 12,
        "autoRenewal": null,
        "createdAt": "2025-09-19T00:09:12",
        "updatedAt": "2025-09-19T00:09:12"
    }
];


let registrationEntryDate = null;
let authToken = localStorage.getItem("jwtToken"); // store JWT token here

function toggleRegisterForm() {
    const form = document.getElementById('registerForm');
    form.classList.toggle('hidden');

    if (!form.classList.contains('hidden')) {
        // Set current date as default for start date
        document.getElementById('startDate').valueAsDate = new Date();
    }
}

function cancelRegistration() {
    document.getElementById('registerForm').classList.add('hidden');
    // Clear form
    document.getElementById('depositAmount').value = '';
    document.getElementById('interestRate').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('tenureMonths').value = '';
}


function updateInterestRate() {
    const tenure = parseInt(document.getElementById("tenureMonths").value);
    let rate = "";

    if (tenure === 6) {
        rate = 5.5;
    } else if (tenure >= 12 && tenure <= 18) {
        rate = 6.8;
    } else if (tenure >= 24 && tenure <= 54) { // 2y - 4.5y
        rate = 7.2;
    } else if (tenure === 60) {
        rate = 7.5;
    }

    document.getElementById("interestRate").value = rate;
}

function clearErrors() {
    document.getElementById("depositError").textContent = "";
    document.getElementById("tenureError").textContent = "";
}

// function loginUser() {
//     const loginData = {
//         "custId":"Shar!17%",
//         "password": "K5&AHSROEd"
//     };

//     fetch("http://localhost:8080/auth/userlogin", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(loginData)
//     })
//     .then(res => {
//         if (!res.ok) throw new Error("Login failed");
//         return res.json();
//     })
//     .then(data => {
//         authToken = data.token; // save token
//         console.log("✅ Logged in. Token:", authToken);
//         alert("Login successful! Now you can register FD.");
//     })
//     .catch(err => {
//         console.error("❌ Login error:", err);
//         alert("Login failed! Check console for details.");
//     });
// }


function submitRegistration() {
    clearErrors();

    if (!authToken) {
        alert("❌ Please login first!");
        return;
    }

    const userId = localStorage.getItem("userId");
    const accountId = document.getElementById('accountId').value;
    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const startDate = document.getElementById('startDate').value;
    const tenureMonths = parseInt(document.getElementById('tenureMonths').value);

    let isValid = true;

    if (!depositAmount || depositAmount < 1000 || depositAmount > 200000) {
        document.getElementById("depositError").textContent =
            "❌ Deposit must be between ₹1,000 and ₹2,00,000";
        isValid = false;
    }
    if (!tenureMonths || tenureMonths < 6 || tenureMonths > 60) {
        document.getElementById("tenureError").textContent =
            "❌ Tenure must be between 6 and 60 months";
        isValid = false;
    }
    if (!interestRate) {
        document.getElementById("tenureError").textContent =
            "❌ Select a valid tenure to auto-assign interest rate";
        isValid = false;
    }
    if (!isValid) return;

    // Build FD request
    const fdRequest = {
        account: { accountId: parseInt(accountId) },
        depositAmount: depositAmount,
        interestRate: interestRate,
        startDate: startDate,
        tenureMonths: tenureMonths
    };

    fetch(`http://localhost:8080/users/FixedDeposit/${userId}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken
        },
        body: JSON.stringify(fdRequest)
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "FD registration failed");
        }
        return response.json();
    })
    .then(savedFd => {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = `✅ Registered successfully! Your FD ID: ${savedFd.fdId}`;
        const form = document.getElementById('registerForm');
        form.parentNode.insertBefore(successDiv, form);

        setTimeout(() => successDiv.remove(), 3000);

        cancelRegistration();
        if (!document.getElementById('fdListContainer').classList.contains('hidden')) {
            showAllFixedDeposits();
        }
    })
    .catch(error => {
                Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message,
            confirmButtonColor: '#d33'
        });
    });
}



function updateCalendarConstraints() {
    const entryDate = document.getElementById('entryDate').value;
    registrationEntryDate = entryDate;

    // Update all calendar inputs in the FD list
    const calendarInputs = document.querySelectorAll('.calendar-input');
    calendarInputs.forEach(input => {
        if (entryDate) {
            input.min = entryDate;
        }
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
}

function showAllFixedDeposits() {
    const container = document.getElementById('fdListContainer');
    const fdList = document.getElementById('fdList');
    container.classList.remove('hidden');
    fdList.innerHTML = '';

    const entryDate = document.getElementById('entryDate').value;
    if (!entryDate) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please select Today's date first!",
            confirmButtonColor: '#d33'
        });
        return;
    }

    const userId = localStorage.getItem("userId");
    // Make request to Spring Boot backend
    fetch(`http://localhost:8080/users/fdshowall/${userId}?date=${entryDate}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken
        }
    })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(fixedDeposits => {
            fixedDeposits.forEach((fd, index) => {
                const fdItem = document.createElement('div');
                fdItem.className = 'fd-item';
                fdItem.setAttribute('data-fd-index', index);

                const minDate = entryDate || fd.startDate;

                fdItem.innerHTML = `
                    <div class="fd-header">
                        <div class="fd-id">FD ID: ${fd.fdId}</div>
                        <div class="status ${fd.status.toLowerCase()}">${fd.status}</div>
                    </div>
                    <div class="fd-details">
                        <div class="detail-item">
                            <span class="detail-label">Deposit Amount</span>
                            <span class="detail-value">${formatCurrency(fd.depositAmount)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Account Id</span>
                            <span class="detail-value">${fd.account.accountId}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Interest Rate</span>
                            <span class="detail-value">${fd.interestRate}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Maturity Amount</span>
                            <span class="detail-value">${formatCurrency(fd.maturityAmount)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Start Date</span>
                            <span class="detail-value">${formatDate(fd.startDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Maturity Date</span>
                            <span class="detail-value">${formatDate(fd.maturityDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tenure</span>
                            <span class="detail-value">${fd.tenureMonths} months</span>
                        </div>
                    </div>
                    <div class="fd-actions ${fd.status === 'PREMATURE_CLOSURE' || fd.status === 'CLOSED' ? 'disabled' : ''}">
                        <input type="date" class="calendar-input" min="${minDate}" placeholder="Select withdrawal date" ${fd.status === 'PREMATURE_CLOSURE' || fd.status === 'CLOSED' ? 'disabled' : ''}>
                        <button class="withdraw-btn" onclick="initiateWithdrawal(${fd.fdId}, ${fd.maturityAmount}, ${index})" ${fd.status === 'PREMATURE_CLOSURE' || fd.status === 'CLOSED' ? 'disabled' : ''}>Withdraw</button>
                    </div>
                `;
                fdList.appendChild(fdItem);
            });
        })
        .catch(error => {
            console.error('Error fetching FD data:', error);
            alert('Failed to fetch fixed deposit data.');
        });
}

let currentFdId = null;
let currentWithdrawDate = null;
let currentWithdrawAmount = null;

function initiateWithdrawal(fdId, maturityAmount, index) {
    // Get the date from the corresponding input field
    const fdItem = document.querySelector(`.fd-item[data-fd-index='${index}']`);
    const withdrawalDateInput = fdItem.querySelector('.calendar-input');
    const selectedDate = withdrawalDateInput.value;
    if (!selectedDate) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please select Today's date first!",
            confirmButtonColor: '#d33'
        });
        return;
    }

    // Call backend endpoint
    fetch(`http://localhost:8080/users/FixedDeposit/check-withdrawal?fdId=${fdId}&date=${selectedDate}`,{
        method: "GET",
        headers: {
            "Authorization": "Bearer " + authToken
        }
    }).then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text(); // backend returns plain text message
        })
        .then(message => {
            currentFdId = fdId;
            currentWithdrawDate = selectedDate;

            // Show modal and set message
            const modalOverlay = document.getElementById('modalOverlay');
            const modalMessage = document.getElementById('modalMessage');

            modalMessage.textContent = message; // Set the response message
            modalOverlay.style.display = 'flex'; // Show modal
             // Add this
             modalOverlay.setAttribute('data-fd-index', index);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to preview withdrawal.');
        });
}


function confirmWithdrawal() {
    const modal = document.getElementById('modalOverlay');
    const fdIndex = modal.getAttribute('data-fd-index');
    modal.style.display = 'none';

    if (!currentFdId || !currentWithdrawDate) {
        alert("Invalid withdrawal data!");
        return;
    }

    fetch(`http://localhost:8080/users/FixedDeposit/withdraw?fdId=${currentFdId}&date=${currentWithdrawDate}`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + authToken }
    })
    .then(res => res.text())
    .then(message => {
        // Refresh FD list from backend to update status
        showAllFixedDeposits();
        // Wait a bit for FD list to render, then show success message
        setTimeout(() => {
            const fdItem = document.querySelector(`.fd-item[data-fd-index="${fdIndex}"]`);
            if (fdItem) {
                const existingMessage = fdItem.querySelector('.success-message');
                if (existingMessage) existingMessage.remove();

                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = message;
                successDiv.style.marginBottom = '15px';

                fdItem.insertBefore(successDiv, fdItem.firstChild);

                setTimeout(() => {
                    if (successDiv.parentNode) successDiv.remove();
                }, 10000);
            }
        }, 200);
    })
    .catch(err => {
        console.error(err);
        alert("Failed to complete withdrawal.");
    });
}


function cancelWithdrawal() {
    const modalOverlay = document.getElementById("modalOverlay");
    modalOverlay.style.display = "none"; // hides the modal
}

function openCalculator() {
    document.getElementById('calculatorModal').style.display = 'flex';
    document.getElementById('calculatorResult').classList.add('hidden');
}

function closeCalculator() {
    document.getElementById('calculatorModal').style.display = 'none';
    // Clear calculator inputs
    document.getElementById('calcDepositAmount').value = '';
    document.getElementById('calcInterestRate').value = '';
    document.getElementById('calcTenure').value = '';
    document.getElementById('calculatorResult').classList.add('hidden');
}

function calculateMaturity() {
    const depositAmount = parseFloat(document.getElementById('calcDepositAmount').value);
    const interestRate = parseFloat(document.getElementById('calcInterestRate').value);
    const tenure = parseInt(document.getElementById('calcTenure').value);

    // Validate inputs
    if (isNaN(depositAmount) || depositAmount <= 0) {
        alert('Please enter a valid deposit amount');
        return;
    }

    if (isNaN(interestRate) || interestRate <= 0) {
        alert('Please enter a valid interest rate');
        return;
    }

    if (isNaN(tenure) || tenure <= 0) {
        alert('Please enter a valid tenure');
        return;
    }

    // Call backend API
    fetch(`http://localhost:8080/users/FixedDeposit/calculatematurity?depositAmount=${depositAmount}&interestRate=${interestRate}&tenureMonths=${tenure}`,{
        method: "GET",
        headers: {
            "Authorization": "Bearer " + authToken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to calculate maturity");
        }
        return response.json();
    })
    .then(maturityAmount => {
        // Show result
        document.getElementById('maturityAmountResult').textContent = formatCurrency(maturityAmount);
        document.getElementById('calculatorResult').classList.remove('hidden');
    })
    .catch(error => {
        alert("❌ Error: " + error.message);
    });
}

// Close modal when clicking outside
document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        cancelWithdrawal();
    }
});

// Set current date as default for entry date
document.getElementById('entryDate').valueAsDate = new Date();
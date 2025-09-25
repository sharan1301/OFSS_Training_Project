// recurringdeposit.js

// const recurringDeposits = [
//     {
//         "rdId": 901,
//         "account": {"accountId": 700},
//         "monthlyAmount": 5000.0,
//         "interestRate": 6.5,
//         "maturityAmount": 65500.0,
//         "maturityDate": "2026-09-18",
//         "startDate": "2025-09-18",
//         "status": "ACTIVE",
//         "tenureMonths": 12,
//         "fine": 0.00
//     },
//     {
//         "rdId": 902,
//         "account": {"accountId": 700},
//         "monthlyAmount": 2000.0,
//         "interestRate": 7.5,
//         "maturityAmount": 25800.0,
//         "maturityDate": "2026-02-17",
//         "startDate": "2025-02-17",
//         "status": "MATURED",
//         "tenureMonths": 12,
//         "fine": 250.00
//     }
// ];

let currentWithdrawAmount = 0;
let currentrdId = null;
let currentPayRdId = null;
let registrationEntryDate = null;
let rdIdCounter = 903;
let authToken = null;

function toggleRegisterForm() {
    const form = document.getElementById('registerForm');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        document.getElementById('startDate').valueAsDate = new Date();
    }
}

function cancelRegistration() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('monthlyAmount').value = '';
    document.getElementById('interestRate').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('tenureMonths').value = '';
}

function updateInterestRate() {
    const tenure = parseInt(document.getElementById("tenureMonths").value);
    let rate = "";
    if (tenure === 6) rate = 5.5;
    else if (tenure >= 12 && tenure <= 18) rate = 6.8;
    else if (tenure >= 24 && tenure <= 54) rate = 7.2;
    else if (tenure === 60) rate = 7.5;
    document.getElementById("interestRate").value = rate;
}

function clearErrors() {
    document.getElementById("monthlyAmountError").textContent = "";
    document.getElementById("tenureError").textContent = "";
}

// function loginUser() {
//     // This function should ideally open a login form for the user to enter credentials.
//     // For now, we will use the same hardcoded credentials for demonstration purposes.
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
//         authToken = data.token;
//         console.log("✅ Logged in. Token:", authToken);
//         alert("Login successful! Now you can register RD.");
//     })
//     .catch(err => {
//         console.error("❌ Login error:", err);
//         alert("Login failed! Check console for details.");
//     });
// }

function submitRegistration() {
    clearErrors();
    if (!authToken) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please login first!",
            confirmButtonColor: '#d33'
        });
        return;
    }
    const userId = document.getElementById('userId').value;
    const accountId = document.getElementById('accountId').value;
    const monthlyAmount = parseFloat(document.getElementById('monthlyAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const startDate = document.getElementById('startDate').value;
    const tenureMonths = parseInt(document.getElementById('tenureMonths').value);

    let isValid = true;
    if (!monthlyAmount || monthlyAmount < 500 || monthlyAmount > 50000) {
        document.getElementById("monthlyAmountError").textContent = "❌ Monthly amount must be between ₹500 and ₹50,000";
        isValid = false;
    }
    if (!tenureMonths || tenureMonths < 6 || tenureMonths > 60) {
        document.getElementById("tenureError").textContent = "❌ Tenure must be between 6 and 60 months";
        isValid = false;
    }
    if (!interestRate) {
        document.getElementById("tenureError").textContent = "❌ Select a valid tenure to auto-assign interest rate";
        isValid = false;
    }
    if (!isValid) return;

    const newRd = {
        account: { accountId: parseInt(accountId) },
        monthlyInstallment: monthlyAmount,
        interestRate: interestRate,
        startDate: startDate,
        tenureMonths: tenureMonths
    };

    fetch(`http://localhost:8080/users/RecurringDeposit/${userId}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken
        },
        body: JSON.stringify(newRd)
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "RD registration failed");
        }
        return response.json();
    })
    .then(data => {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = `✅ Registered successfully! Your RD ID: ${data.rdId}`;
        const form = document.getElementById('registerForm');
        form.parentNode.insertBefore(successDiv, form);
        setTimeout(() => successDiv.remove(), 3000);

        cancelRegistration();
        if (!document.getElementById('rdListContainer').classList.contains('hidden')) {
            showAllRecurringDeposits();
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


function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
}

function showAllRecurringDeposits() {
    const container = document.getElementById('rdListContainer');
    const rdList = document.getElementById('rdList');
    container.classList.remove('hidden');
    rdList.innerHTML = '';


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

    return fetch(`http://localhost:8080/users/RecurringDeposit/showall?date=${entryDate}`, {
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
        .then(RecurringDeposits => {
            RecurringDeposits.forEach((rd, index) => {
                const rdItem = document.createElement('div');
                rdItem.className = 'rd-item';
                rdItem.setAttribute('data-rd-index', index);

                const minDate = entryDate || fd.startDate;

                rdItem.innerHTML = `
                    <div class="rd-header">
                        <div class="rd-id">RD ID: ${rd.rdId}</div>
                        <div class="status ${rd.status.toLowerCase()}">${rd.status}</div>
                    </div>
                    <div class="rd-details">
                        <div class="detail-item">
                            <span class="detail-label">Monthly Installment</span>
                            <span class="detail-value">${formatCurrency(rd.monthlyInstallment)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Interest Rate</span>
                            <span class="detail-value">${rd.interestRate}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Maturity Amount</span>
                            <span class="detail-value">${formatCurrency(rd.maturityAmount)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Start Date</span>
                            <span class="detail-value">${formatDate(rd.startDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Maturity Date</span>
                            <span class="detail-value">${formatDate(rd.maturityDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tenure months</span>
                            <span class="detail-value">${rd.tenureMonths} months</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Deposited</span>
                            <span class="detail-value">${formatCurrency(rd.totalDeposited)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Installment Date</span>
                            <span class="detail-value">${formatDate(rd.lastInstallmentDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fine</span>
                            <span class="detail-value">${formatCurrency(rd.fine)}</span>
                        </div>
                    </div>
                    <div class="rd-actions ${rd.status === 'PREMATURE_CLOSURE' || rd.status === 'CLOSED' ? 'disabled' : ''}">
                        <input type="date" class="calendar-input" min="${minDate}" placeholder="Select date" ${rd.status === 'PREMATURE_CLOSURE' || rd.status === 'CLOSED' ? 'disabled' : ''}>
                        <button class="Pay-btn" onclick="openPayModal(${rd.rdId}, ${index})" ${rd.status === 'PREMATURE_CLOSURE' || rd.status === 'CLOSED' ? 'disabled' : ''}>Pay</button>
                        <button class="withdraw-btn" onclick="initiateWithdrawal(${rd.rdId}, ${rd.maturityAmount}, ${index})" ${rd.status === 'PREMATURE_CLOSURE' || rd.status === 'CLOSED' ? 'disabled' : ''}>Withdraw</button>
                    </div>
                `;
                rdList.appendChild(rdItem);
            });
        })
        .catch(error => {
            console.error('Error fetching FD data:', error);
            alert('Failed to fetch fixed deposit data.');
        });
}

function openPayModal(rdId, index) {
    const rdItems = document.querySelectorAll('.calendar-input');
    const selectedDate = rdItems[index].value;

    if (!selectedDate) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please select Date first!",
            confirmButtonColor: '#d33'
        });
        return;
    }

    currentPayRdId = rdId;
    document.getElementById('PayRdId').value = rdId;
    document.getElementById('PayDate').value = selectedDate;
    document.getElementById('PayInstallmentAmount').value = '';
    document.getElementById('PayModal').style.display = 'flex';
    document.getElementById('PayModal').setAttribute('data-rd-index', index);
}

function closePayModal() {
    document.getElementById('PayModal').style.display = 'none';
    currentPayRdId = null;
}

function confirmPayment() {
    const installmentAmount = parseFloat(document.getElementById('PayInstallmentAmount').value);

    if (isNaN(installmentAmount) || installmentAmount <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please enter a valid installment amount",
            confirmButtonColor: '#d33'
        });
        return;
    }

    const rdId = parseInt(document.getElementById('PayRdId').value);
    const paymentDate = document.getElementById('PayDate').value;
    const modal = document.getElementById('PayModal');
    const rdIndex = modal.getAttribute('data-rd-index');

    const url = `http://localhost:8080/users/RecurringDeposit/pay?rdId=${rdId}&amount=${installmentAmount}&paymentDate=${paymentDate}`;

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Payment failed");
            }
            return response.text();  // backend returns String message
        })
        .then(message => {
            closePayModal();
            showAllRecurringDeposits().then(() => {
                const rdItem = document.querySelector(`.rd-item[data-rd-index="${rdIndex}"]`);
                if (rdItem) {
                    const existingMessage = rdItem.querySelector('.success-message');
                    if (existingMessage) existingMessage.remove();

                    const successDiv = document.createElement('div');
                    successDiv.className = 'success-message';
                    successDiv.textContent = message;
                    successDiv.style.marginBottom = '15px';
                    rdItem.insertBefore(successDiv, rdItem.firstChild);

                    setTimeout(() => {
                        if (successDiv.parentNode) successDiv.remove();
                    }, 8000);
                }
            });
        })
        .catch(error => {
            alert("❌ Error: " + error.message);
        });
}

let currentWithdrawDate=null;

function initiateWithdrawal(rdId, amount, rdIndex) {
    const rdItem = document.querySelector(`.rd-item[data-rd-index='${rdIndex}']`);
    const rdItems = document.querySelectorAll('.calendar-input');
    const selectedDate = rdItems[rdIndex].value;
    if (!selectedDate) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please select a date first!",
            confirmButtonColor: '#d33'
        });
        return;
    }

    fetch(`http://localhost:8080/users/RecurringDeposit/check-withdrawal/${rdId}/${selectedDate}`,{
        method: "GET",
        headers: {
            "Authorization": "Bearer " + authToken
        }
    }).then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(message => {
            currentrdId = rdId;
            currentWithdrawDate = selectedDate;

            const modalOverlay = document.getElementById('modalOverlay');
            const modalMessage = document.getElementById('modalMessage');

            modalMessage.textContent = message;
            modalOverlay.style.display = 'flex';
            modalOverlay.setAttribute('data-rd-index', rdIndex);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to preview withdrawal.');
        });
}

function confirmWithdrawal() {
    const modal = document.getElementById('modalOverlay');
    const rdIndex = modal.getAttribute('data-rd-index');
    modal.style.display = 'none';

    if (!currentrdId || !currentWithdrawDate) {
        alert("Invalid withdrawal data!");
        return;
    }

    fetch(`http://localhost:8080/users/RecurringDeposit/withdraw?rdId=${currentrdId}&date=${currentWithdrawDate}`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + authToken }
    })
    .then(res => res.text())
    .then(message => {
        showAllRecurringDeposits().then(() => {
            const rdItem = document.querySelector(`.rd-item[data-rd-index="${rdIndex}"]`);
            if (rdItem) {
                const existingMessage = rdItem.querySelector('.success-message');
                if (existingMessage) existingMessage.remove();

                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = message;
                successDiv.style.marginBottom = '15px';

                rdItem.insertBefore(successDiv, rdItem.firstChild);

                setTimeout(() => {
                    if (successDiv.parentNode) successDiv.remove();
                }, 10000);
            }
        });
    })
    .catch(err => {
        console.error(err);
        alert("Failed to complete withdrawal.");
    });
}

function cancelWithdrawal() {
    document.getElementById('modalOverlay').style.display = 'none';
    currentrdId = null;
    currentWithdrawAmount = 0;
}

function openCalculator() {
    document.getElementById('calculatorModal').style.display = 'flex';
    document.getElementById('calculatorResult').classList.add('hidden');
}

function closeCalculator() {
    document.getElementById('calculatorModal').style.display = 'none';
    document.getElementById('calcMonthlyAmount').value = '';
    document.getElementById('calcInterestRate').value = '';
    document.getElementById('calcTenure').value = '';
    document.getElementById('calculatorResult').classList.add('hidden');
}

function calculateMaturity() {
    const monthlyAmount = parseFloat(document.getElementById('calcMonthlyAmount').value);
    const interestRate = parseFloat(document.getElementById('calcInterestRate').value);
    const tenure = parseInt(document.getElementById('calcTenure').value);

    if (isNaN(monthlyAmount) || monthlyAmount <= 0) {
        alert('Please enter a valid monthly amount');
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

    fetch(`http://localhost:8080/users/RecurringDeposit/calculatematurity?depositAmount=${monthlyAmount}&interestRate=${interestRate}&tenureMonths=${tenure}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
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
        document.getElementById('maturityAmountResult').textContent = formatCurrency(maturityAmount);
        document.getElementById('calculatorResult').classList.remove('hidden');
    })
    .catch(error => {
        alert("❌ Error: " + error.message);
    });
}


function updateCalendarConstraints() {
    const entryDate = document.getElementById('entryDate').value;
    registrationEntryDate = entryDate;
    const calendarInputs = document.querySelectorAll('.calendar-input');
    calendarInputs.forEach(input => {
        if (entryDate) input.min = entryDate;
    });
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) cancelWithdrawal();
});

document.getElementById('PayModal').addEventListener('click', function(e) {
    if (e.target === this) closePayModal();
});

document.getElementById('calculatorModal').addEventListener('click', function(e) {
    if (e.target === this) closeCalculator();
});

document.getElementById('entryDate').valueAsDate = new Date();
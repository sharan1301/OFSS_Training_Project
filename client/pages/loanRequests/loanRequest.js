document.getElementById('loanRequestForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get values
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const loanType = document.getElementById('loanType').value;
    const loanAmount = document.getElementById('loanAmount').value;
    const tenureMonths = document.getElementById('tenure').value;
    const consent = document.getElementById('consent').checked;
    const terms = document.getElementById('terms').checked;

    if (!accountNumber || !loanType || !loanAmount || !tenureMonths) {
        alert('Please fill all required fields.');
        return;
    }

    if (!consent || !terms) {
        alert('Please accept consent and terms to proceed.');
        return;
    }

    const requestBody = {
        accountNumber: Number(accountNumber),
        loanType: loanType,
        loanAmount: Number(loanAmount),
        tenureMonths: Number(tenureMonths)
    };

    try {
        // Get JWT token from localStorage
        const token = localStorage.getItem('userToken');
        if (!token) {
            alert('User not authenticated. Please login.');
            window.location.href = '../loginPage/login.html';
            return;
        }

        const response = await fetch('http://localhost:8080/users/loan-requests', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // JWT token added here
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.text();
        if (response.ok) {
            alert('Loan request submitted successfully.');
            document.getElementById('loanRequestForm').reset();
            window.location.href = "../loanPage/loan.html";
        } else {
            alert('Error: ' + result);
        }
    } catch (err) {
        console.error(err);
        alert('Something went wrong. Please try again.');
    }
});

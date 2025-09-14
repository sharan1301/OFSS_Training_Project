let users = [
    {
        id: 1,
        username: "Sachin",
        accountNumber: "ACC001234",
        accountType: "Savings",
        balance: "$15,000",
        cardStatus: "enabled",
        frozen: false,
        pendingLoan: true
    },
    {
        id: 2,
        username: "Johnson",
        accountNumber: "ACC005678",
        accountType: "Checking",
        balance: "$8,500",
        cardStatus: "enabled",
        frozen: false,
        pendingLoan: false
    },
    {
        id: 3,
        username: "Virat",
        accountNumber: "ACC009012",
        accountType: "Business",
        balance: "$25,000",
        cardStatus: "disabled",
        frozen: false,
        pendingLoan: true
    },
    {
        id: 4,
        username: "Rahul",
        accountNumber: "ACC003456",
        accountType: "Savings",
        balance: "$12,300",
        cardStatus: "enabled",
        frozen: false,
        pendingLoan: false
    },
    {
        id: 5,
        username: "Rohit",
        accountNumber: "ACC007890",
        accountType: "Premium",
        balance: "$45,000",
        cardStatus: "enabled",
        frozen: true,
        pendingLoan: false
    }
];

let loanRequests = [
    {
        id: 1,
        userId: 1,
        name: "Ramesh",
        accountNumber: "ACC001234",
        balance: "$15,000",
        loanType: "Personal Loan",
        loanAmount: "$10,000",
        purpose: "Home renovation",
        document: "income_statement.pdf",
        requestDate: "2024-01-15",
        status: "pending"
    },
    {
        id: 2,
        userId: 3,
        name: "Virat",
        accountNumber: "ACC009012",
        balance: "$25,000",
        loanType: "Business Loan",
        loanAmount: "$50,000",
        purpose: "Equipment purchase",
        document: "business_plan.pdf",
        requestDate: "2024-01-18",
        status: "pending"
    }
];

let allUsers = [...users]; 


document.addEventListener('DOMContentLoaded', function() {
    showUsersList();
});


function showUsersList() {
    document.getElementById('usersPage').classList.add('active');
    document.getElementById('pendingPage').classList.remove('active');
    updateActiveNavItem('users');
    displayUsers(users);
}


function showPendingRequests() {
    document.getElementById('usersPage').classList.remove('active');
    document.getElementById('pendingPage').classList.add('active');
    updateActiveNavItem('pending');
    displayPendingRequests();
}


function updateActiveNavItem(activeItem) {
    const navItems = document.querySelectorAll('.nav-link'); // Changed from '.nav-item' to '.nav-link'
    navItems.forEach(item => item.classList.remove('active'));
    
    if (activeItem === 'users') {
        navItems[2].classList.add('active'); // Changed from [1] to [2]
    } else if (activeItem === 'pending') {
        navItems[1].classList.add('active'); // Changed from [2] to [1]
    }
}


function displayUsers(usersToShow) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    usersToShow.forEach(user => {
        const row = document.createElement('tr');
        
        const statusClass = user.frozen ? 'frozen' : user.status;
        const statusText = user.frozen ? 'Frozen' : user.status;
        
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.accountNumber}</td>
            <td>${user.accountType}</td>
            <td>${user.balance}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    ${user.frozen ? 
                        `<button class="btn btn-unfreeze" onclick="toggleFreeze(${user.id})">Unfreeze</button>` :
                        `<button class="btn btn-freeze" onclick="toggleFreeze(${user.id})">Freeze</button>`
                    }
                    ${user.cardStatus === 'enabled' ? 
                        `<button class="btn btn-disable-card" onclick="toggleCard(${user.id})">Disable Card</button>` :
                        `<button class="btn btn-enable-card" onclick="toggleCard(${user.id})">Enable Card</button>`
                    }
                    ${user.pendingLoan ? 
                        `<button class="btn btn-pending" onclick="viewPendingLoan(${user.id})">Pending Loan</button>` : 
                        ''
                    }
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}


function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayUsers(allUsers);
        return;
    }
    
    const filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.accountNumber.toLowerCase().includes(searchTerm)
    );
    
    displayUsers(filteredUsers);
}


document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchUsers);
    }
});

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        showNotification('Logging out... Goodbye!', 'success');
        
        // Simulate logout process
        setTimeout(() => {
            // In a real application, you would redirect to login page
            alert('Redirecting to login page...');
            // For now, just reload the page or redirect to dashboard
            window.location.href = '../admin/admindashboard.html';
        }, 2000);
    }
}
function toggleFreeze(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.frozen = !user.frozen;
        displayUsers(users);
        
        const action = user.frozen ? 'frozen' : 'unfrozen';
        alert(`Account ${user.accountNumber} has been ${action}.`);
    }
}


function toggleCard(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.cardStatus = user.cardStatus === 'enabled' ? 'disabled' : 'enabled';
        displayUsers(users);
        
        alert(`Card for account ${user.accountNumber} has been ${user.cardStatus}.`);
    }
}


function viewPendingLoan(userId) {
    const loanRequest = loanRequests.find(request => request.userId === userId);
    if (loanRequest) {
        showLoanModal(loanRequest);
    } else {
        alert('No pending loan request found for this user.');
    }
}


function displayPendingRequests() {
    const container = document.getElementById('pendingRequestsList');
    container.innerHTML = '';
    
    if (loanRequests.length === 0) {
        container.innerHTML = '<div class="request-card"><p>No pending loan requests at the moment.</p></div>';
        return;
    }
    
    loanRequests.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        
        requestCard.innerHTML = `
            <div class="request-header">
                <h3>Loan Request #${request.id}</h3>
                <span class="status pending">Pending Approval</span>
            </div>
            
            <div class="request-info">
                <div class="info-item">
                    <div class="info-label">Customer Name</div>
                    <div class="info-value">${request.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Account Number</div>
                    <div class="info-value">${request.accountNumber}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Current Balance</div>
                    <div class="info-value">${request.balance}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Loan Type</div>
                    <div class="info-value">${request.loanType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Loan Amount</div>
                    <div class="info-value">${request.loanAmount}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Purpose</div>
                    <div class="info-value">${request.purpose}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Request Date</div>
                    <div class="info-value">${request.requestDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Document</div>
                    <div class="info-value">
                        ${request.document ? 
                            `<a href="#" class="document-link" onclick="viewDocument('${request.document}')">${request.document}</a>` : 
                            'No document uploaded'
                        }
                    </div>
                </div>
            </div>
            
            <div class="request-actions">
                <button class="btn-approve" onclick="approveLoan(${request.id})">Approve</button>
                <button class="btn-decline" onclick="declineLoan(${request.id})">Decline</button>
            </div>
        `;
        
        container.appendChild(requestCard);
    });
}


function showLoanModal(loanRequest) {
    const modal = document.getElementById('loanModal');
    const loanDetails = document.getElementById('loanDetails');
    
    loanDetails.innerHTML = `
        <div class="request-info">
            <div class="info-item">
                <div class="info-label">Customer Name</div>
                <div class="info-value">${loanRequest.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Account Number</div>
                <div class="info-value">${loanRequest.accountNumber}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Current Balance</div>
                <div class="info-value">${loanRequest.balance}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Loan Type</div>
                <div class="info-value">${loanRequest.loanType}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Loan Amount</div>
                <div class="info-value">${loanRequest.loanAmount}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Purpose</div>
                <div class="info-value">${loanRequest.purpose}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Request Date</div>
                <div class="info-value">${loanRequest.requestDate}</div>
            </div>
        </div>
        
        ${loanRequest.document ? `
            <div class="document-display">
                <div class="info-label">Uploaded Document</div>
                <a href="#" class="document-link" onclick="viewDocument('${loanRequest.document}')">${loanRequest.document}</a>
            </div>
        ` : ''}
        
        <div class="request-actions">
            <button class="btn-approve" onclick="approveLoan(${loanRequest.id}); closeLoanModal();">Approve</button>
            <button class="btn-decline" onclick="declineLoan(${loanRequest.id}); closeLoanModal();">Decline</button>
        </div>
    `;
    
    modal.style.display = 'block';
}


function closeLoanModal() {
    document.getElementById('loanModal').style.display = 'none';
}


window.onclick = function(event) {
    const modal = document.getElementById('loanModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}


function approveLoan(loanId) {
    const loanIndex = loanRequests.findIndex(request => request.id === loanId);
    if (loanIndex !== -1) {
        const approvedLoan = loanRequests[loanIndex];
        
        
        const user = users.find(u => u.id === approvedLoan.userId);
        if (user) {
            user.pendingLoan = false;
        }
        
      
        loanRequests.splice(loanIndex, 1);
        
        alert(`Loan request for ${approvedLoan.name} has been approved.`);
        
        
        displayPendingRequests();
        displayUsers(users);
    }
}


function declineLoan(loanId) {
    const loanIndex = loanRequests.findIndex(request => request.id === loanId);
    if (loanIndex !== -1) {
        const declinedLoan = loanRequests[loanIndex];
        
        
        const user = users.find(u => u.id === declinedLoan.userId);
        if (user) {
            user.pendingLoan = false;
        }
        
        
        loanRequests.splice(loanIndex, 1);
        
        alert(`Loan request for ${declinedLoan.name} has been declined.`);
        
        
        displayPendingRequests();
        displayUsers(users);
    }
}


function viewDocument(documentName) {
    alert(`Opening document: ${documentName}\n\nThis would typically open the document in a new window or download it.`);
}

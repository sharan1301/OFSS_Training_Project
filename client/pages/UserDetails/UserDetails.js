// Global variables
let users = [];
let loanRequests = [];
let allUsers = [];

// API Configuration
const API_BASE_URL = 'http://localhost:8080/'; // Update with your backend URL

// Utility function to get JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('authToken');
}

// Utility function to check if user is authenticated
function checkAuthentication() {
    const token = getAuthToken();
    if (!token) {
        showNotification('Please login to access this page', 'warning');
        setTimeout(() => {
            window.location.href = '../landingPage/landingPage.html'; // Update path as needed
        }, 2000);
        return false;
    }
    return true;
}

// API call utility function
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        
        // Handle unauthorized access
        if (response.status === 401) {
            showNotification('Session expired. Please login again.', 'warning');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('authToken');
            setTimeout(() => {
                window.location.href = '../auth/login.html';
            }, 2000);
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Fetch all approved users from database
async function fetchUsers() {
    try {
        showLoading(true);
        const response = await apiCall('admin/allUsers'); // Endpoint for approved users
        users = response.data || response;
        allUsers = [...users];
        
        // Map backend fields to frontend expected structure
        users = users.map(user => ({
            id: user.userId,
            accId :user.accountId,
            username: `${user.firstName} ${user.lastName}`,
            accountNumber: user.accountNumber || `ACC${user.id.toString().padStart(6, '0')}`,
            accountType: user.accountType || 'Savings',
            balance: formatCurrency(user.balance || 0),
            cardStatus: user.cardStatus || 'enabled',
            frozen: user.frozen || false,
            pendingLoan: user.pendingLoan || false,
            status: user.status || 'active',
            email: user.email,
            phone: user.phone
        }));
        
        allUsers = [...users];
        showLoading(false);
        
        if (document.getElementById('usersPage').classList.contains('active')) {
            displayUsers(users);
        }
        
    } catch (error) {
        showLoading(false);
        showNotification('Failed to fetch users: ' + error.message, 'error');
        // Show empty state or fallback data
        users = [];
        allUsers = [];
        displayUsers(users);
    }
}

async function fetchLoanRequests() {
    try {
        showLoading(true);

        const response = await apiCall('admin/pendingloanrequests'); // fetch all pending loans
        let requests = response.data || response;

        // map backend data to frontend structure
        loanRequests = requests.map(req => ({
            requestId: req.requestId,
            user: {
                userId: req.user.userId,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
            },
            account: {
                accountNumber: req.account.accountNumber,
                balance: req.account.balance || 0
            },
            loanType: req.loanType.replace('_', ' '), // PERSONAL_LOAN -> Personal Loan
            loanAmount: req.loanAmount || 0,
            tenureMonths: req.tenureMonths || 0,
            purpose: req.purpose || 'Not specified',
            createdAt: req.createdAt || new Date(),
            status: req.status || 'PENDING',
            document: req.document || null
        }));

        showLoading(false);

        // update UI if pending page is active
        if (document.getElementById('pendingPage')?.classList.contains('active')) {
            displayPendingRequests();
        }

    } catch (error) {
        showLoading(false);
        console.error('fetchLoanRequests error:', error);
        showNotification('Failed to fetch loan requests: ' + error.message, 'error');
        loanRequests = [];
        displayPendingRequests();
    }
}


// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
    
    showUsersList();
    
    // Set up search input listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchUsers);
    }
});

// Show users list page
function showUsersList() {
    document.getElementById('usersPage').classList.add('active');
    document.getElementById('pendingPage').classList.remove('active');
    updateActiveNavItem('users');
    fetchUsers();
}

// Show pending requests page
function showPendingRequests() {
    document.getElementById('usersPage').classList.remove('active');
    document.getElementById('pendingPage').classList.add('active');
    updateActiveNavItem('pending');
    fetchLoanRequests();
}

// Update active navigation item
function updateActiveNavItem(activeItem) {
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => item.classList.remove('active'));
    
    if (activeItem === 'users') {
        navItems[2].classList.add('active'); // Adjust index based on your nav structure
    } else if (activeItem === 'pending') {
        navItems[1].classList.add('active'); // Adjust index based on your nav structure
    }
}

// Display users in table
function displayUsers(usersToShow) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        console.error('Users table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (usersToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <h3>No users found</h3>
                    <p>No approved users available at the moment.</p>
                </td>
            </tr>
        `;
        return;
    }
    
   usersToShow.forEach(user => {
    const row = document.createElement('tr');

    const isFrozen = user.status === 'FROZEN';
    const statusClass = isFrozen ? 'frozen' : user.status.toLowerCase();
    const statusText = isFrozen ? 'Frozen' : capitalizeFirst(user.status || 'Active');

    // Fixed card status logic - if card is blocked/disabled, show "Enable Card", if enabled show "Disable Card"
    const isCardBlocked = user.cardStatus === 'disabled' || user.cardStatus === 'blocked';
    
    row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.accountNumber}</td>
        <td>${user.accountType}</td>
        <td>${user.balance}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>
            <div class="action-buttons">
                ${user.status === 'FROZEN' ? 
                    `<button class="btn btn-unfreeze" onclick="toggleFreeze(${user.accId}, false)">Unfreeze</button>` :
                    `<button class="btn btn-freeze" onclick="toggleFreeze(${user.accId}, true)">Freeze</button>`
                }
                ${isCardBlocked ? 
                    `<button class="btn btn-enable-card" onclick="toggleCard(${user.accId}, 'enabled')">Enable Card</button>` :
                    `<button class="btn btn-disable-card" onclick="toggleCard(${user.accId}, 'disabled')">Disable Card</button>`
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
        displayUsers(allUsers); // show all if search is empty
        return;
    }

    const filteredUsers = allUsers.filter(user => 
        (user.username || '').toLowerCase().includes(searchTerm) ||
        (user.accountNumber || '').toString().toLowerCase().includes(searchTerm) || 
        (user.email || '').toLowerCase().includes(searchTerm) ||
        (user.phone || '').toLowerCase().includes(searchTerm) ||
        (user.accountType || '').toLowerCase().includes(searchTerm) // ✅ account type search
    );

    console.log("Search Term:", searchTerm, "Results:", filteredUsers); // debug
    displayUsers(filteredUsers);
}




// Toggle freeze/unfreeze user account
// Toggle freeze/unfreeze user account
// Toggle freeze/unfreeze user account
async function toggleFreeze(userId, shouldFreeze) {
    const action = shouldFreeze ? 'freeze' : 'unfreeze';
    
    if (!confirm(`Are you sure you want to ${action} this user's account?`)) {
        return;
    }
    
    try {
        showLoading(true);
        
        await apiCall(`admin/accounts/${userId}/${action}`, {
            method: 'PUT'
        });
        
        // Update local user data correctly
        const user = users.find(u => u.userId === userId);
        if (user) {
            user.status = shouldFreeze ? 'FROZEN' : 'ACTIVE';
            const allUser = allUsers.find(u => u.userId === userId);
            if (allUser) allUser.status = user.status;
        }

        //  Force table to re-render with latest data
        const tbody = document.querySelector('#userTable tbody'); 
        if (tbody) tbody.innerHTML = ''; 
        fetchUsers(users); 
        displayUsers(users);
        
        showNotification(`Account has been ${action}d successfully!`, 'success');
        
    } catch (error) {
        showNotification(`Failed to ${action} account: ` + error.message, 'error');
    } finally {
        showLoading(false);
    }
}


// Toggle card enable/disable
async function toggleCard(userId, newStatus) {
    const action = newStatus === 'enabled' ? 'enable' : 'disable';
    const apiAction = newStatus === 'enabled' ? 'cards-enable' : 'cards-disable';
    
    if (!confirm(`Are you sure you want to ${action} this user's card?`)) {
        return;
    }
    
    try {
        showLoading(true);
        
        await apiCall(`admin/accounts/${userId}/${apiAction}`, {
            method: 'PUT'
        });
        
        // Update local user data
        const user = users.find(u => u.accId === userId);
        if (user) {
            user.cardStatus = newStatus;
            const allUser = allUsers.find(u => u.accId === userId);
            if (allUser) allUser.cardStatus = newStatus;
        }
        
        displayUsers(users);
        showNotification(`Card has been ${action}d successfully!`, 'success');
        
    } catch (error) {
        showNotification(`Failed to ${action} card: ` + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// View pending loan for a user
function displayPendingRequests() {
    const container = document.getElementById('pendingRequestsList');
    if (!container) return;

    container.innerHTML = '';

    if (!loanRequests || loanRequests.length === 0) {
        container.innerHTML = '<div class="request-card"><p>No pending loan requests at the moment.</p></div>';
        return;
    }

    loanRequests.forEach(req => {
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        const statusText = capitalizeFirst(req.status.toLowerCase());

        requestCard.innerHTML = `
            <div class="request-header">
                <h3>Loan Request #${req.requestId}</h3>
                <span class="status ${req.status.toLowerCase()}">${statusText}</span>
            </div>

            <div class="request-info">
                <div class="info-item"><div class="info-label">Customer Name</div><div class="info-value">${req.user.firstName} ${req.user.lastName}</div></div>
                <div class="info-item"><div class="info-label">Account Number</div><div class="info-value">${req.account.accountNumber}</div></div>
                <div class="info-item"><div class="info-label">Current Balance</div><div class="info-value">${formatCurrency(req.account.balance)}</div></div>
                <div class="info-item"><div class="info-label">Loan Type</div><div class="info-value">${req.loanType}</div></div>
                <div class="info-item"><div class="info-label">Loan Amount</div><div class="info-value">${formatCurrency(req.loanAmount)}</div></div>
                <div class="info-item"><div class="info-label">Request Date</div><div class="info-value">${formatDate(req.createdAt)}</div></div>
            </div>

            <div class="request-actions">
                <button class="btn-approve" onclick="approveLoan(${req.requestId})">Approve</button>
                <button class="btn-decline" onclick="declineLoan(${req.requestId})">Decline</button>
                <button class="btn-view" onclick="viewPendingLoan(${req.user.userId})">View</button>
            </div>
        `;
        container.appendChild(requestCard);
    });
}
function viewPendingLoan(userId) {
    if (!userId) return;

    // first try to find in memory
    const req = loanRequests.find(r => r.user.userId === userId);
    if (req) {
        showLoanModal(req);
    } else {
        fetchUserLoanRequest(userId); // fetch from backend if not in memory
    }
}

async function fetchUserLoanRequest(userId) {
    if (!userId) return;

    try {
        showLoading(true);
        const response = await apiCall(`admin/pendingloanrequests/${userId}`);
        const req = response.data || response;
        if (!req) {
            showNotification('No pending loan request found for this user.', 'info');
            showLoading(false);
            return;
        }

        const mappedRequest = {
            requestId: req.requestId,
            user: {
                userId: req.user.userId,
                firstName: req.user.firstName,
                lastName: req.user.lastName
            },
            account: {
                accountNumber: req.account.accountNumber,
                balance: req.account.balance || 0
            },
            loanType: req.loanType.replace('_', ' '),
            loanAmount: req.loanAmount || 0,
            tenureMonths: req.tenureMonths || 0,
            purpose: req.purpose || 'Not specified',
            createdAt: req.createdAt || new Date(),
            status: req.status || 'PENDING',
        };

        showLoanModal(mappedRequest);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        console.error('fetchUserLoanRequest error:', error);
        showNotification('Failed to fetch loan request: ' + error.message, 'error');
    }
}

// Show loan modal
function showLoanModal(req) {
    const modal = document.getElementById('loanModal');
    const loanDetails = document.getElementById('loanDetails');
    if (!modal || !loanDetails) return;

    loanDetails.innerHTML = `
        <div class="request-info">
            <div class="info-item"><div class="info-label">Customer Name</div><div class="info-value">${req.user.firstName} ${req.user.lastName}</div></div>
            <div class="info-item"><div class="info-label">Account Number</div><div class="info-value">${req.account.accountNumber}</div></div>
            <div class="info-item"><div class="info-label">Current Balance</div><div class="info-value">${formatCurrency(req.account.balance)}</div></div>
            <div class="info-item"><div class="info-label">Loan Type</div><div class="info-value">${req.loanType}</div></div>
            <div class="info-item"><div class="info-label">Loan Amount</div><div class="info-value">${formatCurrency(req.loanAmount)}</div></div>
            <div class="info-item"><div class="info-label">Tenure</div><div class="info-value">${req.tenureMonths} months</div></div>
            <div class="info-item"><div class="info-label">Request Date</div><div class="info-value">${formatDate(req.createdAt)}</div></div>
        </div>
        <div class="request-actions">
            <button class="btn-approve" onclick="approveLoan(${req.requestId}); closeLoanModal();">Approve</button>
            <button class="btn-decline" onclick="declineLoan(${req.requestId}); closeLoanModal();">Decline</button>
        </div>
    `;

    modal.style.display = 'block';
}
// Close loan modal
function closeLoanModal() {
    const modal = document.getElementById('loanModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loanModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Approve loan request
async function approveLoan(loanId) {
    if (!confirm('Are you sure you want to approve this loan request?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        await apiCall(`admin/loanrequest/${loanId}/approve`, {
            method: 'PUT'
        });
        
        // Remove from local array and update user status
        const loanIndex = loanRequests.findIndex(request => request.requestId === loanId);
        if (loanIndex !== -1) {
            const approvedLoan = loanRequests[loanIndex];
            
            // Update user's pending loan status
            const user = users.find(u => u.userId === approvedLoan.userId);
            if (user) {
                user.pendingLoan = false;
                const allUser = allUsers.find(u => u.userId === approvedLoan.userId);
                if (allUser) allUser.pendingLoan = false;
            }
            
            loanRequests.splice(loanIndex, 1);
            showNotification(`Loan request has been approved successfully!`, 'success');
        } else {
            showNotification('Loan approved successfully!', 'success');
        }
        
        displayPendingRequests();
        displayUsers(users);
        
    } catch (error) {
        showNotification('Failed to approve loan: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Decline loan request
async function declineLoan(loanId) {
    if (!confirm('Are you sure you want to decline this loan request? This action cannot be undone.')) {
        return;
    }
    
    try {
        showLoading(true);
        
        await apiCall(`admin/loanrequest/${loanId}/decline`, {
            method: 'PUT'
        });
        
        // Remove from local array and update user status
        const loanIndex = loanRequests.findIndex(request => request.requestId === loanId);
        if (loanIndex !== -1) {
            const declinedLoan = loanRequests[loanIndex];
            
            // Update user's pending loan status
            const user = users.find(u => u.userId === declinedLoan.userId);
            if (user) {
                user.pendingLoan = false;
                const allUser = allUsers.find(u => u.userId === declinedLoan.userId);
                if (allUser) allUser.pendingLoan = false;
            }
            
            loanRequests.splice(loanIndex, 1);
            showNotification(`Loan request has been declined.`, 'warning');
        } else {
            showNotification('Loan declined successfully.', 'warning');
        }
        
        displayPendingRequests();
        displayUsers(users);
        
    } catch (error) {
        showNotification('Failed to decline loan: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// View document
// async function viewDocument(documentPath, loanId) {
//     try {
//         // Option 1: Open document URL directly
//         if (documentPath.startsWith('http')) {
//             window.open(documentPath, '_blank');
//             return;
//         }
        
//         // Option 2: Download document via API
//         const token = getAuthToken();
//         const downloadUrl = `${API_BASE_URL}/admin/loans/${loanId}/document?token=${token}`;
        
//         // Create temporary link to trigger download
//         const link = document.createElement('a');
//         link.href = downloadUrl;
//         link.target = '_blank';
//         link.download = documentPath.split('/').pop();
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
        
//     } catch (error) {
//         showNotification('Failed to open document: ' + error.message, 'error');
//     }


// Utility functions
function formatCurrency(amount) {
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
        return 'Invalid Date';
    }
}

function capitalizeFirst(str) {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Loading indicator
function showLoading(show) {
    let loadingElement = document.getElementById('loadingIndicator');
    
    if (show && !loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.id = 'loadingIndicator';
        loadingElement.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            ">
                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #3498db;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 10px;
                    "></div>
                    <p>Loading...</p>
                </div>
            </div>
        `;
        
        // Add spinner animation if not already present
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loadingElement);
    } else if (!show && loadingElement) {
        loadingElement.remove();
    }
}

// Enhanced notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const bgColors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${bgColors[type] || bgColors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    // Add styles if not present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease;
            }
            .notification-close:hover {
                background-color: rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });

    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

function removeNotification(notification) {
    if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        showNotification('Logging out... Goodbye!', 'success');
        
        // Clear tokens and user data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminName');
        localStorage.removeItem('userData');
        
        setTimeout(() => {
            window.location.href = '../auth/login.html'; // Update path as needed
        }, 2000);
    }
}

// Refresh data
function refreshData() {
    if (document.getElementById('usersPage').classList.contains('active')) {
        fetchUsers();
    } else {
        fetchLoanRequests();
    }
}

// Auto-refresh every 5 minutes
setInterval(refreshData, 5 * 60 * 1000);
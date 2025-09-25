// Global variables
let pendingAccountRequests = [];
let pendingCreditCardRequests = [];
let currentUser = null;
let currentRequestType = 'account'; // 'account' or 'creditcard'

// DOM elements
const requestsTableBody = document.getElementById('requestsTableBody');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalApprove = document.getElementById('modalApprove');
const modalDecline = document.getElementById('modalDecline');
const commentsTextarea = document.getElementById('commentsTextarea');

// API Configuration
const API_BASE_URL = 'http://localhost:8080/';

// Utility function to get JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem('adminToken');
}

// Utility function to check if user is authenticated
function checkAuthentication() {
    const token = getAuthToken();
    if (!token) {
        showNotification('Please login to access this page', 'warning');
        setTimeout(() => {
            window.location.href = '../adminLoginPage/adminLogin.html';
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
            'Authorization': `Bearer ${token}`,
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
        console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);

        if (response.status === 401) {
            showNotification('Session expired. Please login again.', 'warning');
            localStorage.removeItem('adminToken');
            setTimeout(() => {
                window.location.href = '../adminLoginPage/adminLogin.html';
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

// Fetch pending account requests
async function fetchPendingAccountRequests() {
    try {
        console.log('Fetching account requests...');
        const response = await apiCall('admin/pendingrequests');
        console.log('Raw account requests response:', response);
        
        // Handle the response - it's directly an array based on your JSON
        pendingAccountRequests = Array.isArray(response) ? response : [];
        console.log('Account requests processed:', pendingAccountRequests);
    } catch (error) {
        console.error('Failed to fetch account requests:', error);
        showNotification('Failed to fetch account requests: ' + error.message, 'error');
        pendingAccountRequests = [];
    }
}

// Fetch pending credit card requests
async function fetchPendingCreditCardRequests() {
    try {
        console.log('Fetching credit card requests...');
        const response = await apiCall('admin/pending-creditcard-requests');
        console.log('Raw credit card requests response:', response);
        
        // Handle the response - it's directly an array based on your JSON
        pendingCreditCardRequests = Array.isArray(response) ? response : [];
        console.log('Credit card requests processed:', pendingCreditCardRequests);
    } catch (error) {
        console.error('Failed to fetch credit card requests:', error);
        showNotification('Failed to fetch credit card requests: ' + error.message, 'error');
        pendingCreditCardRequests = [];
    }
}

// Fetch all pending requests
async function fetchAllPendingRequests() {
    showLoading(true);
    try {
        await Promise.all([
            fetchPendingAccountRequests(),
            fetchPendingCreditCardRequests()
        ]);
        console.log('All requests fetched, rendering table...');
        renderTable();
    } catch (error) {
        console.error('Error fetching requests:', error);
        renderEmptyState();
    } finally {
        showLoading(false);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) return;
    setupEventListeners();
    setupTabs();
    fetchAllPendingRequests();
    setAdminName();
});

// Setup tab functionality
function setupTabs() {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;

    if (!document.querySelector('.tab-buttons')) {
        const tabContainer = document.createElement('div');
        tabContainer.className = 'tab-buttons';
        tabContainer.innerHTML = `
            <button class="tab-btn active" data-type="account">Account Requests (${pendingAccountRequests.length})</button>
            <button class="tab-btn" data-type="creditcard">Credit Card Requests (${pendingCreditCardRequests.length})</button>
        `;
        contentArea.insertBefore(tabContainer, contentArea.firstChild);
        
        if (!document.getElementById('tab-styles')) {
            const style = document.createElement('style');
            style.id = 'tab-styles';
            style.textContent = `
                .tab-buttons { display: flex; gap: 10px; margin-bottom: 20px; }
                .tab-btn { padding: 10px 20px; border: 2px solid #007bff; background: white; color: #007bff; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.3s ease; }
                .tab-btn:hover { background: #f8f9fa; }
                .tab-btn.active { background: #007bff; color: white; }
            `;
            document.head.appendChild(style);
        }

        tabContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-btn')) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentRequestType = e.target.dataset.type;
                console.log('Switched to tab:', currentRequestType);
                renderTable();
            }
        });
    }
}

// Update tab counts
function updateTabCounts() {
    const accountTab = document.querySelector('[data-type="account"]');
    const creditCardTab = document.querySelector('[data-type="creditcard"]');
    
    if (accountTab) {
        accountTab.textContent = `Account Requests (${pendingAccountRequests.length})`;
    }
    if (creditCardTab) {
        creditCardTab.textContent = `Credit Card Requests (${pendingCreditCardRequests.length})`;
    }
}

// Set admin name in header
function setAdminName() {
    const adminNameElement = document.getElementById('adminName');
    if (!adminNameElement) return;

    try {
        const adminData = localStorage.getItem('adminData');
        const loginInfo = localStorage.getItem('loginInfo');
        let adminName = 'Admin';
        
        if (adminData) {
            const admin = JSON.parse(adminData);
            adminName = admin.name || admin.adminName || 'Admin';
        } else if (loginInfo) {
            const info = JSON.parse(loginInfo);
            adminName = info.adminName || info.workId || 'Admin';
        } else {
            adminName = localStorage.getItem('adminName') || 'Admin';
        }

        adminNameElement.textContent = `Admin ${adminName}`;
    } catch (error) {
        console.error('Error setting admin name:', error);
        adminNameElement.textContent = 'Admin';
    }
}

// Setup modal event listeners
function setupEventListeners() {
    if (closeModal) closeModal.addEventListener('click', closeUserModal);
    if (modalOverlay) modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeUserModal();
    });
    if (modalApprove) modalApprove.addEventListener('click', approveUserFromModal);
    if (modalDecline) modalDecline.addEventListener('click', declineUserFromModal);
}

// Render table dynamically
function renderTable() {
    console.log('Rendering table for type:', currentRequestType);
    
    if (!requestsTableBody) {
        console.error('Table body not found');
        return;
    }

    const currentRequests = currentRequestType === 'account' ? pendingAccountRequests : pendingCreditCardRequests;
    console.log('Current requests to render:', currentRequests);

    if (!currentRequests || currentRequests.length === 0) {
        renderEmptyState();
        return;
    }

    let tableHTML = '';

    if (currentRequestType === 'account') {
        tableHTML = currentRequests.map(req => {
            const id = req.requestId;
            const name = `${req.firstName} ${req.lastName}`;
            const typeLabel = capitalizeFirst(req.accountType || 'Account');
            const dateLabel = formatDate(req.requestDate);

            return `
                <tr data-id="${id}" data-type="account">
                    <td><strong>${name}</strong></td>
                    <td><span class="account-type ${req.accountType?.toLowerCase()}">${typeLabel}</span></td>
                    <td>${dateLabel}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn approve-btn" onclick="approveRequest('account', ${id})">Approve</button>
                            <button class="btn decline-btn" onclick="declineRequest('account', ${id})">Decline</button>
                            <button class="btn view-btn" onclick="viewRequestDetails('account', ${id})">View Details</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        tableHTML = currentRequests.map(req => {
            const id = req.id;
            const name = req.fullName || `${req.firstName || ''} ${req.lastName || ''}`.trim() || 'N/A';
            const typeLabel = capitalizeFirst(req.cardType || 'Credit Card');
            const dateLabel = formatDate(req.submittedAt);

            return `
                <tr data-id="${id}" data-type="creditcard">
                    <td><strong>${name}</strong></td>
                    <td><span class="card-type ${req.cardType?.toLowerCase()}">${typeLabel}</span></td>
                    <td>${dateLabel}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn approve-btn" onclick="approveRequest('creditcard', ${id})">Approve</button>
                            <button class="btn decline-btn" onclick="declineRequest('creditcard', ${id})">Decline</button>
                            <button class="btn view-btn" onclick="viewRequestDetails('creditcard', ${id})">View Details</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    requestsTableBody.innerHTML = tableHTML;
    updateTabCounts();
    console.log('Table rendered successfully');
}

// Empty state rendering
function renderEmptyState() {
    if (!requestsTableBody) return;
    const requestTypeText = currentRequestType === 'account' ? 'account requests' : 'credit card requests';
    requestsTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">
                <h3>No pending ${requestTypeText}</h3>
                <p>All ${requestTypeText} have been processed by the Admin.</p>
            </td>
        </tr>
    `;
    updateTabCounts();
}

// Approve request function
async function approveRequest(type, requestId) {
    const requestTypeText = type === 'account' ? 'account request' : 'credit card request';
    
    if (!confirm(`Are you sure you want to approve this ${requestTypeText}?`)) {
        return;
    }
    
    try {
        showLoading(true);
        console.log(`Approving ${type} request with ID:`, requestId);
        
        const endpoint = type === 'account' 
            ? `admin/requests/${requestId}/approve` 
            : `admin/creditcard-requests/${requestId}/handle`;
        
        await apiCall(endpoint, {
            method: 'PUT',
        });
        
        // Remove from local array and update UI
        if (type === 'account') {
            const userIndex = pendingAccountRequests.findIndex(user => user.requestId === requestId);
            if (userIndex !== -1) {
                const user = pendingAccountRequests[userIndex];
                pendingAccountRequests.splice(userIndex, 1);
                showNotification(`Account request for "${user.firstName} ${user.lastName}" has been approved successfully!`, 'success');
            } else {
                showNotification('Account request approved successfully!', 'success');
            }
        } else {
            const userIndex = pendingCreditCardRequests.findIndex(user => user.id === requestId);
            if (userIndex !== -1) {
                const user = pendingCreditCardRequests[userIndex];
                pendingCreditCardRequests.splice(userIndex, 1);
                const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
                showNotification(`Credit card request for "${name}" has been approved successfully!`, 'success');
            } else {
                showNotification('Credit card request approved successfully!', 'success');
            }
        }
        
        renderTable();
        closeUserModal();
        
    } catch (error) {
        console.error('Approve error:', error);
        showNotification(`Failed to approve ${requestTypeText}: ` + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Decline request function
async function declineRequest(type, requestId) {
    const requestTypeText = type === 'account' ? 'account request' : 'credit card request';
    
    if (!confirm(`Are you sure you want to decline this ${requestTypeText}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        showLoading(true);
        console.log(`Declining ${type} request with ID:`, requestId);
        
        const endpoint = type === 'account' 
            ? `admin/requests/${requestId}/decline` 
            : `admin/creditcard-requests/${requestId}/decline`;
        
        await apiCall(endpoint, {
            method: 'PUT',
        });
        
        // Remove from local array and update UI
        if (type === 'account') {
            const userIndex = pendingAccountRequests.findIndex(user => user.requestId === requestId);
            if (userIndex !== -1) {
                const user = pendingAccountRequests[userIndex];
                pendingAccountRequests.splice(userIndex, 1);
                showNotification(`Account request for "${user.firstName} ${user.lastName}" has been declined.`, 'warning');
            } else {
                showNotification('Account request declined.', 'warning');
            }
        } else {
            const userIndex = pendingCreditCardRequests.findIndex(user => user.id === requestId);
            if (userIndex !== -1) {
                const user = pendingCreditCardRequests[userIndex];
                pendingCreditCardRequests.splice(userIndex, 1);
                const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
                showNotification(`Credit card request for "${name}" has been declined.`, 'warning');
            } else {
                showNotification('Credit card request declined.', 'warning');
            }
        }
        
        renderTable();
        closeUserModal();
        
    } catch (error) {
        console.error('Decline error:', error);
        showNotification(`Failed to decline ${requestTypeText}: ` + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// View request details
function viewRequestDetails(type, requestId) {
    console.log(`Viewing ${type} request details for ID:`, requestId);
    
    let request;
    
    if (type === 'account') {
        request = pendingAccountRequests.find(req => req.requestId === requestId);
    } else {
        request = pendingCreditCardRequests.find(req => req.id === requestId);
    }
    
    if (!request) {
        showNotification('Request not found', 'error');
        return;
    }

    currentUser = { ...request, type: type };
    console.log('Selected request for modal:', currentUser);
    
    // Populate modal based on request type
    if (type === 'account') {
        // Account request fields
        document.getElementById('modalUsername').textContent = `${request.firstName} ${request.lastName}`;
        document.getElementById('modalEmail').textContent = request.email || 'N/A';
        document.getElementById('modalMobile').textContent = request.phone || 'N/A';
        document.getElementById('modalOccupation').textContent = request.occupation || 'N/A';
        document.getElementById('modalAadhar').textContent = request.aadhaarNumber || 'N/A';
        document.getElementById('modalPan').textContent = request.panNumber || 'N/A';
        document.getElementById('modalAccountType').textContent = capitalizeFirst(request.accountType || 'N/A');
        
        if (document.getElementById('modalAnnualIncome')) {
            document.getElementById('modalAnnualIncome').textContent = 
                request.annualIncome ? `₹${request.annualIncome.toLocaleString()}` : 'N/A';
        }
        
        // Hide credit card specific fields if they exist
        hideElementIfExists('modalCardType');
        hideElementIfExists('modalCreditLimit');
        hideElementIfExists('modalEmployer');
        
    } else {
        // Credit card request fields
        const name = request.fullName || `${request.firstName || ''} ${request.lastName || ''}`.trim() || 'N/A';
        document.getElementById('modalUsername').textContent = name;
        document.getElementById('modalEmail').textContent = request.emailAddress || request.email || 'N/A';
        document.getElementById('modalMobile').textContent = request.mobileNumber || request.phone || 'N/A';
        document.getElementById('modalOccupation').textContent = request.occupation || 'N/A';
        document.getElementById('modalAadhar').textContent = request.aadhaarNumber || 'N/A';
        document.getElementById('modalPan').textContent = request.panNumber || 'N/A';
        document.getElementById('modalAccountType').textContent = 'Credit Card Application';
        
        if (document.getElementById('modalAnnualIncome')) {
            document.getElementById('modalAnnualIncome').textContent = 
                request.annualIncome ? `₹${request.annualIncome.toLocaleString()}` : 'N/A';
        }
        
        // Show credit card specific fields
        showElementIfExists('modalCardType', capitalizeFirst(request.cardType || 'Standard'));
        showElementIfExists('modalEmployer', request.employer || 'N/A');
        
        // Show address if available
        if (request.address) {
            showElementIfExists('modalAddress', `${request.address}, ${request.city || ''}, ${request.state || ''} - ${request.pincode || ''}`);
        }
    }

    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Helper functions for modal field visibility
function hideElementIfExists(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.parentElement) {
        element.parentElement.style.display = 'none';
    }
}

function showElementIfExists(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        if (element.parentElement) {
            element.parentElement.style.display = 'flex';
        }
    }
}

// Modal approval/decline functions
async function approveUserFromModal() {
    if (currentUser) {
        const id = currentUser.type === 'account' ? currentUser.requestId : currentUser.id;
        console.log('Modal approve - currentUser:', currentUser);
        console.log('Modal approve - using id:', id);
        await approveRequest(currentUser.type, id);
    }
}

async function declineUserFromModal() {
    if (currentUser) {
        const id = currentUser.type === 'account' ? currentUser.requestId : currentUser.id;
        console.log('Modal decline - currentUser:', currentUser);
        console.log('Modal decline - using id:', id);
        await declineRequest(currentUser.type, id);
    }
}

function closeUserModal() {
    modalOverlay.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentUser = null;
    if (commentsTextarea) {
        commentsTextarea.value = '';
    }
}

// Utility functions
function capitalizeFirst(str) {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
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
                    <p>Processing...</p>
                </div>
            </div>
        `;
        
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
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
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

    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
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
        notification.remove();
    });

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        showNotification('Logging out... Goodbye!', 'success');
        
        // Clear all tokens and admin data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminData');
        localStorage.removeItem('loginInfo');
        localStorage.removeItem('userData');
        
        setTimeout(() => {
            window.location.href = '../adminLoginPage/adminLogin.html';
        }, 2000);
    }
}

// Refresh data function
function refreshData() {
    console.log('Refreshing data...');
    fetchAllPendingRequests();
}

// Auto-refresh every 5 minutes
setInterval(refreshData, 5 * 60 * 1000);
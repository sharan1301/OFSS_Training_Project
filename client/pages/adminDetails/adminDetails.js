/**
 * ADMIN DETAILS PAGE JAVASCRIPT
 * =============================
 * Only fetches and displays admin profile from backend
 */

// ===========================
// GLOBAL VARIABLES
// ===========================
let notificationTimeout;
let adminData = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    joinDate: '',
    lastLogin: '',
    status: ''
};

// ===========================
// API CONFIGURATION
// ===========================
const API_BASE_URL = 'http://localhost:8080/';

// Utility function to get JWT token
function getAuthToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('authToken');
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

        if (response.status === 401) {
            showNotification('Session expired. Please login again.', 'error');
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

// ===========================
// DATA FETCHING FUNCTIONS
// ===========================

/**
 * Fetch admin profile data from backend
 */
async function fetchAdminProfile() {
    try {
        showLoading(true);

        const response = await apiCall('admin/profile');

        // Update admin data with backend response
       adminData = {
            id: response.adminId || response.id,
            WorkId:response.WorkId,
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            email: response.email || '',
            role: response.role || 'ADMIN',
            department: response.department || 'Banking Operations',
            status: 'ACTIVE',
            permissions: response.permissions || []
        };

        updateAdminProfileUI();
        showLoading(false);
        return adminData;

    } catch (error) {
        showLoading(false);
        console.error('Failed to fetch admin profile:', error);
        showNotification('Failed to load admin profile', 'error');
        return null;
    }
}

// ===========================
// UI UPDATE FUNCTIONS
// ===========================

/**
 * Update the admin profile UI with fetched data
 */
function updateAdminProfileUI() {
    updateElement('adminId', `${adminData.WorkId} `);
    updateElement('adminName', `${adminData.firstName} ${adminData.lastName}`);
    updateElement('adminEmail', adminData.email);
    // updateElement('adminPhone', adminData.phone);
    updateElement('adminRole', adminData.role.replace('_', ' '));
    updateElement('adminDepartment', adminData.department);
    // updateElement('adminJoinDate', formatDate(adminData.joinDate));
    // updateElement('adminLastLogin', formatDateTime(adminData.lastLogin));
    updateElement('adminStatus', adminData.status);

    // Store admin name in localStorage for other pages
    localStorage.setItem('adminName', `${adminData.firstName} ${adminData.lastName}`);
}

/**
 * Update element text content safely
 */
function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value || 'N/A';
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
        return 'Invalid Date';
    }
}

function formatDateTime(dateString) {
    if (!dateString) return 'Never';
    try {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
        return 'Invalid Date';
    }
}

function showLoading(show) {
    let loadingElement = document.getElementById('adminDetailsLoading');

    if (show && !loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.id = 'adminDetailsLoading';
        loadingElement.innerHTML = `<div style="
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
                <p>Loading admin profile...</p>
            </div>
        </div>`;

        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `@keyframes spin {0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`;
            document.head.appendChild(style);
        }

        document.body.appendChild(loadingElement);
    } else if (!show && loadingElement) {
        loadingElement.remove();
    }
}

function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById("notification");
    if (!notification) return;

    if (notificationTimeout) clearTimeout(notificationTimeout);

    notification.textContent = message;
    notification.className = 'notification';

    switch(type) {
        case 'success': notification.style.background = 'linear-gradient(135deg, #10ac84, #1dd1a1)'; break;
        case 'warning': notification.style.background = 'linear-gradient(135deg, #ffa726, #ff7043)'; break;
        case 'error': notification.style.background = 'linear-gradient(135deg, #ee5a52, #f48fb1)'; break;
        default: notification.style.background = 'linear-gradient(135deg, #10ac84, #1dd1a1)';
    }
    notification.style.color = '#fff';
    notification.style.display = 'block';

    notificationTimeout = setTimeout(() => { notification.style.display = "none"; }, duration);
}
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        showNotification('Logging out... Goodbye!', 'success');
        
        // ✅ UPDATED: Clear all tokens and admin data
        clearAdminSession();
        
        setTimeout(() => {
            window.location.href = '../landingPage/landingPage.html';
        }, 2000);
    }
}

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const token = getAuthToken();
    if (!token) {
        showNotification('Please login to access this page', 'error');
        setTimeout(() => window.location.href = '../auth/login.html', 2000);
        return;
    }

    fetchAdminProfile().then(() => {
        showNotification('Admin profile loaded successfully!', 'success', 3000);
    });
});

let charts = {};
let notificationTimeout;
let dashboardData = {
  totalCustomers: 0,
  activeAccounts: 0,
  pendingRequests: 0,
  monthlyRevenue: 0,
  accountStatus: { active: 0, inactive: 0, frozen: 0 },
  accountTypes: { savings: 0, current: 0, salary: 0, business: 0 }
};

const API_BASE_URL = 'http://localhost:8080/';

// ✅ FIXED: Updated to match your login page token storage
function getAuthToken() {
    // Check all possible token storage keys to maintain compatibility
    return localStorage.getItem('jwtToken') || 
           localStorage.getItem('adminToken') || 
           localStorage.getItem('authToken');
}

// ✅ NEW: Get stored admin data from login
function getStoredAdminData() {
    try {
        const adminData = localStorage.getItem("adminData");
        const loginInfo = localStorage.getItem("loginInfo");
        return {
            admin: adminData ? JSON.parse(adminData) : null,
            loginInfo: loginInfo ? JSON.parse(loginInfo) : null,
            token: getAuthToken()
        };
    } catch (error) {
        console.error("Error getting stored admin data:", error);
        return { admin: null, loginInfo: null, token: null };
    }
}

// ✅ NEW: Verify authentication and display admin info
function initializeAdminSession() {
    const { admin, loginInfo, token } = getStoredAdminData();
    
    if (!token) {
        showNotification('Please login to access this page', 'error');
        setTimeout(() => {
            window.location.href = '../adminLoginPage/adminLogin.html';
        }, 2000);
        return false;
    }
    
    // Check session expiry
    if (loginInfo && loginInfo.loginTime) {
        const loginTime = new Date(loginInfo.loginTime);
        const currentTime = new Date();
        const timeDiff = (currentTime - loginTime) / (1000 * 60 * 60); // hours
        
        if (timeDiff > 8) { // 8 hours expiry
            showNotification('Session expired. Please login again.', 'error');
            clearAdminSession();
            setTimeout(() => {
                window.location.href = '../adminLoginPage/adminLogin.html';
            }, 2000);
            return false;
        }
    }
    
    // Display admin info in welcome message
    if (admin && admin.name) {
        localStorage.setItem('adminName', admin.name); // For compatibility with existing code
        setTimeout(() => {
            showNotification(`Welcome to SecureBank Admin Panel, ${admin.name}!`, 'success', 4000);
        }, 500);
    }
    
    console.log('✅ Admin session initialized:', {
        name: admin?.name || 'Unknown',
        workId: loginInfo?.workId || 'Unknown',
        token: token ? 'Present' : 'Missing'
    });
    
    return true;
}

// ✅ NEW: Clear admin session
function clearAdminSession() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('loginInfo');
    localStorage.removeItem('adminName');
    localStorage.removeItem('userData');
}

async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        showNotification('No authentication token found. Please login.', 'error');
        setTimeout(() => {
            window.location.href = '../adminLoginPage/adminLogin.html';
        }, 2000);
        throw new Error('No authentication token');
    }
    
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
            clearAdminSession();
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

async function fetchDashboardData() {
    try {
        showLoading(true);
        
        // Fetch all required data concurrently
        const [usersData, pendingRequestsData, accountsData, transactionsData] = await Promise.all([
            apiCall('admin/dashboard/users-stats'),
            apiCall('admin/dashboard/pending-requests'),
            apiCall('admin/dashboard/accounts-stats'),
            apiCall('admin/dashboard/revenue-stats').catch(() => ({ monthlyRevenue: 0 }))
        ]);
        
        // Update dashboard data
        dashboardData.totalCustomers = usersData.totalUsers || 0;
        dashboardData.activeAccounts = accountsData.activeAccounts || 0;
        dashboardData.pendingRequests = pendingRequestsData.pendingCount || 0;
        dashboardData.monthlyRevenue = transactionsData.monthlyRevenue || 0;
        
        // Account status distribution
        dashboardData.accountStatus = {
            active: accountsData.activeCount || 0,
            inactive: accountsData.inactiveCount || 0,
            frozen: accountsData.frozenCount || 0
        };
        
        // Account types breakdown
        dashboardData.accountTypes = {
            savings: accountsData.savingsCount || 0,
            current: accountsData.currentCount || 0,
            salary: accountsData.salaryCount || 0,
            business: accountsData.businessCount || 0
        };
        
        showLoading(false);
        return dashboardData;
        
    } catch (error) {
        showLoading(false);
        console.error('Failed to fetch dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        // Return default data structure
        return dashboardData;
    }
}

// ===========================
// PAGE LOADING FUNCTIONS
// ===========================

/**
 * Load the dashboard page with charts and metrics
 * @param {Element} content - Main content container
 */
async function loadDashboard(content) {
    // Fetch data first
    await fetchDashboardData();
    
    // ✅ NEW: Get admin info for display
    const { admin } = getStoredAdminData();
    const adminName = admin?.name || 'Admin';
    
    content.innerHTML = `
        <div class="page active">
            <div class="content-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome ${adminName}, to your banking administration panel</p>
                <button onclick="refreshDashboard()" class="refresh-btn" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 15px;">Refresh</button>
            </div>

            <div class="cards">
                <div class="card">
                    <h3>Total Customers</h3>
                    <p id="totalCustomers">${dashboardData.totalCustomers.toLocaleString()}</p>
                </div>
                <div class="card">
                    <h3>Active Accounts</h3>
                    <p id="activeAccounts">${dashboardData.activeAccounts.toLocaleString()}</p>
                </div>
                <div class="card warning">
                    <h3>Pending Requests</h3>
                    <p id="pendingRequests">${dashboardData.pendingRequests}</p>
                </div>
                <div class="card revenue">
                    <h3>Monthly Revenue</h3>
                    <p id="monthlyRevenue">₹${formatCurrency(dashboardData.monthlyRevenue)}</p>
                </div>
            </div>

            <div class="charts">
                <div class="chart-container">
                    <h3>Account Status Distribution</h3>
                    <canvas id="pieChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Account Types Breakdown</h3>
                    <canvas id="barChart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Initialize charts after DOM is updated
    setTimeout(() => {
        initializeCharts();
    }, 100);

    showNotification('Dashboard loaded successfully!');
}

/**
 * Refresh dashboard data and update UI
 */
async function refreshDashboard() {
    await fetchDashboardData();
    updateDashboardUI();
    initializeCharts();
    showNotification('Dashboard refreshed!', 'success');
}

/**
 * Update dashboard UI with new data
 */
function updateDashboardUI() {
    const totalCustomersEl = document.getElementById('totalCustomers');
    const activeAccountsEl = document.getElementById('activeAccounts');
    const pendingRequestsEl = document.getElementById('pendingRequests');
    const monthlyRevenueEl = document.getElementById('monthlyRevenue');
    
    if (totalCustomersEl) totalCustomersEl.textContent = dashboardData.totalCustomers.toLocaleString();
    if (activeAccountsEl) activeAccountsEl.textContent = dashboardData.activeAccounts.toLocaleString();
    if (pendingRequestsEl) pendingRequestsEl.textContent = dashboardData.pendingRequests;
    if (monthlyRevenueEl) monthlyRevenueEl.textContent = `₹${formatCurrency(dashboardData.monthlyRevenue)}`;
}

// ===========================
// CHART FUNCTIONS
// ===========================

/**
 * Initialize all charts with dynamic data
 */
function initializeCharts() {
    destroyExistingCharts();
    initializePieChart();
    initializeBarChart();
}

/**
 * Destroy existing charts to prevent memory leaks
 */
function destroyExistingCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
}

/**
 * Initialize the pie chart for account status with dynamic data
 */
function initializePieChart() {
    const pieCtx = document.getElementById("pieChart");
    if (pieCtx) {
        const statusData = dashboardData.accountStatus;
        const hasData = statusData.active > 0 || statusData.inactive > 0 || statusData.frozen > 0;
        
        if (!hasData) {
            // Show placeholder if no data
            pieCtx.getContext('2d').fillText('No data available', 50, 50);
            return;
        }
        
        charts.pie = new Chart(pieCtx, {
            type: "pie",
            data: {
                labels: ["Active", "Inactive", "Frozen"],
                datasets: [{
                    data: [statusData.active, statusData.inactive, statusData.frozen],
                    backgroundColor: [
                        "#10ac84",
                        "#ee5a52", 
                        "#ffa726"
                    ],
                    borderWidth: 3,
                    borderColor: "#fff",
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 14,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
}

/**
 * Initialize the bar chart for account types with dynamic data
 */
function initializeBarChart() {
    const barCtx = document.getElementById("barChart");
    if (barCtx) {
        const typesData = dashboardData.accountTypes;
        const labels = Object.keys(typesData).map(key => capitalizeFirst(key));
        const data = Object.values(typesData);
        const hasData = data.some(value => value > 0);
        
        if (!hasData) {
            // Show placeholder if no data
            barCtx.getContext('2d').fillText('No data available', 50, 50);
            return;
        }
        
        charts.bar = new Chart(barCtx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Number of Accounts",
                    data: data,
                    backgroundColor: [
                        "#667eea",
                        "#764ba2", 
                        "#f093fb",
                        "#f5576c"
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                    borderWidth: 2,
                    borderColor: "#fff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(0,0,0,0.05)",
                            lineWidth: 1
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            stepSize: 1
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Format currency for display
 */
function formatCurrency(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString();
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Show loading indicator
 */
function showLoading(show) {
    let loadingElement = document.getElementById('dashboardLoading');
    
    if (show && !loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.id = 'dashboardLoading';
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
                    <p>Loading dashboard data...</p>
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

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, warning, error)
 * @param {number} duration - Display duration in milliseconds
 */
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById("notification");
    
    if (!notification) {
        console.warn('Notification element not found');
        return;
    }
    
    // Clear existing timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Set notification content and styling
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Apply type-specific styling
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10ac84, #1dd1a1)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ffa726, #ff7043)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ee5a52, #f48fb1)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #10ac84, #1dd1a1)';
    }
    
    // Show notification
    notification.style.display = "block";
    
    // Auto-hide after specified duration
    notificationTimeout = setTimeout(() => {
        notification.style.display = "none";
    }, duration);
}

// ===========================
// ACTION FUNCTIONS
// ===========================

/**
 * Logout functionality
 */
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
// EVENT LISTENERS & INITIALIZATION
// ===========================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // ✅ UPDATED: Use new authentication initialization
    if (!initializeAdminSession()) {
        return; // Stop if authentication failed
    }
    
    // Load dashboard by default
    const content = document.getElementById("main-content");
    if (content) {
        loadDashboard(content);
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Auto-refresh dashboard every 5 minutes
    setInterval(refreshDashboard, 5 * 60 * 1000);
});

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardNavigation(event) {
    // ESC key to close notifications
    if (event.key === 'Escape') {
        const notification = document.getElementById("notification");
        if (notification && notification.style.display === 'block') {
            notification.style.display = 'none';
        }
    }
    
    // Alt + R to refresh dashboard
    if (event.altKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        refreshDashboard();
    }
    
    // Alt + U for users page
    if (event.altKey && event.key.toLowerCase() === 'u') {
        event.preventDefault();
        window.location.href = '../UserDetails/UserDetails.html';
    }
    
    // Alt + P for pending requests
    if (event.altKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        window.location.href = '../PendingRequests/pending-requests.html';
    }
    
    // Alt + A for admin details
    if (event.altKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        window.location.href = '../adminDetails/adminDetails.html';
    }
}

/**
 * Handle window resize events
 */
window.addEventListener('resize', function() {
    // Resize charts when window is resized
    setTimeout(() => {
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }, 100);
});

/**
 * Initialize app when page loads - REMOVED duplicate welcome message
 */
window.addEventListener('load', function() {
    // Welcome message is now handled in initializeAdminSession()
    console.log('✅ Dashboard application loaded successfully');
});

// ===========================
// ERROR HANDLING
// ===========================

/**
 * Global error handler
 */
window.addEventListener('error', function(event) {
    console.error('Application Error:', event.error);
    showNotification('An error occurred. Please try again.', 'error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

// ✅ NEW: Export functions for external use
window.dashboardAuth = {
    getStoredAdminData,
    clearAdminSession,
    getAuthToken
};
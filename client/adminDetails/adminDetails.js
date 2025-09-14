/**
 * ADMIN DETAILS PAGE JAVASCRIPT
 * ==============================
 * Functionality for the admin profile page
 */

// ===========================
// GLOBAL VARIABLES
// ===========================
let notificationTimeout;

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize the page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Show welcome message
    setTimeout(() => {
        showNotification('Admin profile loaded successfully!', 'success', 3000);
    }, 500);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
});

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, warning, error)
 * @param {number} duration - Display duration in milliseconds
 */
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById("notification");
    
    // Clear existing timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Set notification content
    notification.textContent = message;
    notification.className = 'notification';
    
    // Apply type-specific styling
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10ac84, #1dd1a1)';
            notification.style.color = '#fff';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ffa726, #ff7043)';
            notification.style.color = '#fff';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ee5a52, #f48fb1)';
            notification.style.color = '#fff';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #10ac84, #1dd1a1)';
            notification.style.color = '#fff';
    }
    
    // Show notification
    notification.style.display = "block";
    
    // Auto-hide after specified duration
    notificationTimeout = setTimeout(() => {
        notification.style.display = "none";
    }, duration);
}

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
    
    // Alt + H for home (dashboard)
    if (event.altKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        window.location.href = '../Dashboard/admindashboard.html';
    }
    
    // Alt + U for users
    if (event.altKey && event.key.toLowerCase() === 'u') {
        event.preventDefault();
        window.location.href = '../UserDetails/UserDetails.html';
    }
    
    // Alt + P for pending requests
    if (event.altKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        window.location.href = '../PendingRequests/pending-requests.html';
    }
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
        
        // Simulate logout process
        setTimeout(() => {
            // In a real application, you would redirect to login page
            alert('Redirecting to login page...');
            // For now, just reload the page or redirect to dashboard
            window.location.href = '../admin/admindashboard.html';
        }, 2000);
    }
}

// ===========================
// EVENT LISTENERS
// ===========================

/**
 * Handle window load events
 */
window.addEventListener('load', function() {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});

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
/**
 * FEINBANK ADMIN DASHBOARD JAVASCRIPT
 * ===================================
 * Main functionality for the banking admin panel
 */

// ===========================
// GLOBAL VARIABLES
// ===========================
let charts = {};
let notificationTimeout;

// ===========================
// PAGE LOADING FUNCTIONS
// ===========================

/**
 * Load the dashboard page with charts and metrics
 * @param {Element} content - Main content container
 */
function loadDashboard(content) {
  content.innerHTML = `
    <div class="page active">
      <div class="content-header">
        <h2>📊 Dashboard Overview</h2>
        <p>Welcome to your banking administration panel</p>
      </div>

      <div class="cards">
        <div class="card">
          <h3>Total Customers</h3>
          <p>1,247</p>
        </div>
        <div class="card">
          <h3>Active Accounts</h3>
          <p>986</p>
        </div>
        <div class="card warning">
          <h3>Pending Requests</h3>
          <p>23</p>
        </div>
        <div class="card revenue">
          <h3>Monthly Revenue</h3>
          <p>₹2.4M</p>
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

  showNotification('📊 Dashboard loaded successfully!');
}

// ===========================
// CHART FUNCTIONS
// ===========================

/**
 * Initialize all charts
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
 * Initialize the pie chart for account status
 */
function initializePieChart() {
  const pieCtx = document.getElementById("pieChart");
  if (pieCtx) {
    charts.pie = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Active", "Inactive", "Suspended"],
        datasets: [{
          data: [75, 20, 5],
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
            displayColors: true
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
 * Initialize the bar chart for account types
 */
function initializeBarChart() {
  const barCtx = document.getElementById("barChart");
  if (barCtx) {
    charts.bar = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Savings", "Current", "Fixed Deposit", "Loans"],
        datasets: [{
          label: "Number of Accounts",
          data: [542, 398, 167, 89],
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
            cornerRadius: 8
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
              }
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
    showNotification('👋 Logging out... Goodbye!', 'success');
    
    // Simulate logout process
    setTimeout(() => {
      // In a real application, you would redirect to login page
      alert('Redirecting to login page...');
      window.location.reload();
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
  // Load dashboard by default
  const content = document.getElementById("main-content");
  loadDashboard(content);
  
  // Add keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
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
    window.location.href = '../AdminDetails/admindetails.html';
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
 * Initialize app when page loads
 */
window.addEventListener('load', function() {
  // Show welcome message
  setTimeout(() => {
    showNotification('🏦 Welcome to FeinBank Admin Panel!', 'success', 4000);
  }, 500);
});

// ===========================
// ERROR HANDLING
// ===========================

/**
 * Global error handler
 */
window.addEventListener('error', function(event) {
  console.error('Application Error:', event.error);
  showNotification('❌ An error occurred. Please try again.', 'error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled Promise Rejection:', event.reason);
  showNotification('❌ Something went wrong. Please refresh the page.', 'error');
});
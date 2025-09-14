
let pendingRequests = [
    {
        id: 1,
        username: "Ramesh",
        email: "Ramesh@email.com",
        accountType: "savings",
        dateApplied: "2024-01-15",
        dob: "1990-05-15",
        occupation: "Software Engineer",
        aadhar: "1234-5678-9012",
        mobile: "+91-9876543210",
        address: "123 Main Street, Coimbatore, Tamil Nadu - 641001",
        status: "pending"
    },
    {
        id: 2,
        username: "Simon",
        email: "simon@email.com",
        accountType: "current",
        dateApplied: "2024-01-14",
        dob: "1985-08-22",
        occupation: "Business",
        aadhar: "2345-6789-0123",
        mobile: "+91-8765432109",
        address: "456 Business District, Coimbatore, Tamil Nadu - 641002",
        status: "pending"
    }
];

let currentUser = null;


const requestsTableBody = document.getElementById('requestsTableBody');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalApprove = document.getElementById('modalApprove');
const modalDecline = document.getElementById('modalDecline');
const commentsTextarea = document.getElementById('commentsTextarea');


document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    setupEventListeners();
});


function setupEventListeners() {
    closeModal.addEventListener('click', closeUserModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            console.log(e.target);
            closeUserModal();
        }
    });
}

    
    modalApprove.addEventListener('click', function() {
        approveUserFromModal();
    });

    modalDecline.addEventListener('click', function() {
        declineUserFromModal();
    });

  
function renderTable() {
    console.log('renderTable fun called');
    console.log('Pending requests:', pendingRequests);
    
    const requestsTableBody = document.getElementById('requestsTableBody');
    console.log('Table body in renderTable:', requestsTableBody);


    if (pendingRequests.length === 0) {
        requestsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <h3>No pending requests</h3>
                    <p>All requests have been processed by the Admin.</p>
                </td>
            </tr>
        `;
        return;
    }

    const tableHTML = pendingRequests.map(request => `
        <tr data-id="${request.id}">
            <td>
                <strong>${request.username}</strong>
            </td>
            <td>
                <span class="account-type ${request.accountType}">
                    ${capitalizeFirst(request.accountType)}
                </span>
            </td>
            <td>${formatDate(request.dateApplied)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn approve-btn" onclick="approveUser(${request.id})">
                        Approve
                    </button>
                    <button class="btn decline-btn" onclick="declineUser(${request.id})">
                        Decline
                    </button>
                    <button class="btn view-btn" onclick="viewUserDetails(${request.id})">
                        View Details
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    
    requestsTableBody.innerHTML = tableHTML;
    console.log('Table updated successfully');
}

function approveUser(userId) {
    if (confirm('Are you sure you want to approve this user?')) {
        const userIndex = pendingRequests.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            const user = pendingRequests[userIndex]; 
            pendingRequests.splice(userIndex, 1);
            showNotification(`User "${user.username}" has been approved successfully!`, 'success');
        
            renderTable();
            console.log('User approved:', user);
        }
    }
}


function declineUser(userId) {
    if (confirm('Are you sure you want to decline this user? This action cannot be undone.')) {
        const userIndex = pendingRequests.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            const user = pendingRequests[userIndex];
        
            pendingRequests.splice(userIndex, 1);
      
            showNotification(`User "${user.username}" has been declined and removed.`, 'warning');
       
            renderTable();
            console.log('User declined:', user);
        }
    }
}

function viewUserDetails(userId) {
    const user = pendingRequests.find(user => user.id === userId);
    if (!user) return;

    currentUser = user;
    document.getElementById('modalUsername').textContent = user.username;
    document.getElementById('modalEmail').textContent = user.email;
    document.getElementById('modalDob').textContent = formatDate(user.dob);
    document.getElementById('modalOccupation').textContent = user.occupation;
    document.getElementById('modalAadhar').textContent = user.aadhar;
    document.getElementById('modalMobile').textContent = user.mobile;
    document.getElementById('modalAccountType').textContent = capitalizeFirst(user.accountType);
    document.getElementById('modalAddress').textContent = user.address;
    commentsTextarea.value = '';

    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden'; 
}

function closeUserModal() {
    modalOverlay.classList.remove('show');
    document.body.style.overflow = 'auto'; 
    currentUser = null;
    commentsTextarea.value = '';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
function showNotification(message, type = 'info') {

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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
        background-color: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
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
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });

   
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}


function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        
        window.location.href = 'login.html';
    }
}


document.addEventListener('click', function(e) {
    if (e.target.classList.contains('logout')) {
        e.preventDefault();
        handleLogout();
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

// // function searchRequests(query) {
// //     const filteredRequests = pendingRequests.filter(request => 
// //         request.username.toLowerCase().includes(query.toLowerCase()) ||
// //         request.email.toLowerCase().includes(query.toLowerCase()) ||
// //         request.accountType.toLowerCase().includes(query.toLowerCase())
// //     );
    
// //     // You can implement this to filter the table
// //     console.log('Filtered requests:', filteredRequests);
// }//
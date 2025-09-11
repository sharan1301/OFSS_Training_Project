// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const dateFilter = document.getElementById('dateFilter');
    const announcementCards = document.querySelectorAll('.announcement-card');
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.close');

    // Search and Filter functionality
    function filterAnnouncements() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedDateRange = dateFilter.value;
        
        announcementCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardCategory = card.getAttribute('data-category');
            const cardDate = new Date(card.getAttribute('data-date'));
            const currentDate = new Date();
            const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            // Check search term
            const matchesSearch = searchTerm === '' || cardText.includes(searchTerm);
            
            // Check category
            const matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
            
            // Check date range
            let matchesDate = true;
            if (selectedDateRange === 'recent') {
                matchesDate = cardDate >= thirtyDaysAgo;
            } else if (selectedDateRange === 'older') {
                matchesDate = cardDate < thirtyDaysAgo;
            }
            
            // Show/hide card based on all criteria
            if (matchesSearch && matchesCategory && matchesDate) {
                card.classList.remove('hidden');
                // Add smooth animation
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Event listeners for search and filter
    searchInput.addEventListener('input', filterAnnouncements);
    categoryFilter.addEventListener('change', filterAnnouncements);
    dateFilter.addEventListener('change', filterAnnouncements);

    // Modal functionality
    function showDetails(announcementId) {
        const announcementDetails = {
            'maintenance-sep15': {
                title: 'Scheduled System Maintenance - September 15, 2025',
                content: `
                    <h3>System Maintenance Details</h3>
                    <p><strong>Date:</strong> September 15, 2025</p>
                    <p><strong>Time:</strong> 10:00 PM - 2:00 AM IST</p>
                    <p><strong>Affected Services:</strong></p>
                    <ul>
                        <li>Online Banking Website</li>
                        <li>Mobile Banking App</li>
                        <li>ATM Services (Limited)</li>
                        <li>UPI Transactions</li>
                    </ul>
                    <p><strong>What to Expect:</strong></p>
                    <p>During this maintenance window, you may experience intermittent connectivity issues or complete service unavailability. We recommend completing any urgent transactions before 10:00 PM on September 15.</p>
                    <p><strong>Emergency Support:</strong></p>
                    <p>For urgent assistance during maintenance, please call our 24/7 helpline at 1800-XXX-XXXX.</p>
                `
            },
            'festival-offers': {
                title: 'Festival Season Special Offers',
                content: `
                    <h3>Special Festival Offers</h3>
                    <p><strong>Valid Until:</strong> October 31, 2025</p>
                    <p><strong>Personal Loan Offers:</strong></p>
                    <ul>
                        <li>Interest rates starting from 8.99% per annum</li>
                        <li>Processing fee waived for loans above ₹5 lakhs</li>
                        <li>Quick approval within 24 hours</li>
                    </ul>
                    <p><strong>Fixed Deposit Special Rates:</strong></p>
                    <ul>
                        <li>Additional 0.25% interest for senior citizens</li>
                        <li>Special rates for deposits above ₹10 lakhs</li>
                        <li>Flexible tenure options</li>
                    </ul>
                    <p><strong>How to Apply:</strong></p>
                    <p>Visit your nearest branch or apply online through our website. Terms and conditions apply.</p>
                `
            },
            'loan-policy': {
                title: 'Updated Loan Policy Guidelines',
                content: `
                    <h3>New Loan Policy Updates</h3>
                    <p><strong>Effective Date:</strong> September 2, 2025</p>
                    <p><strong>Key Changes:</strong></p>
                    <ul>
                        <li>Updated income eligibility criteria for all loan types</li>
                        <li>Enhanced documentation requirements for KYC compliance</li>
                        <li>New digital verification processes</li>
                        <li>Revised interest rate structure</li>
                    </ul>
                    <p><strong>Required Documents:</strong></p>
                    <ul>
                        <li>Aadhaar Card (mandatory)</li>
                        <li>PAN Card</li>
                        <li>Latest 3 months salary slips</li>
                        <li>Bank statements for last 6 months</li>
                        <li>Property documents (for secured loans)</li>
                    </ul>
                    <p><strong>Note:</strong> Existing loan holders are not affected by these changes.</p>
                `
            },
            'app-security': {
                title: 'Mobile App Security Enhancement',
                content: `
                    <h3>Enhanced Security Features</h3>
                    <p><strong>Update Version:</strong> 4.2.1</p>
                    <p><strong>New Security Features:</strong></p>
                    <ul>
                        <li>Biometric authentication (Fingerprint & Face ID)</li>
                        <li>Advanced fraud detection algorithms</li>
                        <li>Enhanced encryption protocols</li>
                        <li>Real-time transaction monitoring</li>
                        <li>Automatic logout for security</li>
                    </ul>
                    <p><strong>How to Update:</strong></p>
                    <p>The update is available on Google Play Store and Apple App Store. Please update your app to enjoy these enhanced security features.</p>
                    <p><strong>Security Tips:</strong></p>
                    <ul>
                        <li>Always use official app stores for downloads</li>
                        <li>Enable app lock and biometric authentication</li>
                        <li>Never share your login credentials</li>
                        <li>Report suspicious activities immediately</li>
                    </ul>
                `
            },
            'upgrade-complete': {
                title: 'System Upgrade Completed Successfully',
                content: `
                    <h3>Infrastructure Upgrade Complete</h3>
                    <p><strong>Completion Date:</strong> August 20, 2025</p>
                    <p><strong>Improvements:</strong></p>
                    <ul>
                        <li>50% faster transaction processing</li>
                        <li>Enhanced server capacity</li>
                        <li>Improved mobile app performance</li>
                        <li>Better security infrastructure</li>
                        <li>Reduced downtime and maintenance windows</li>
                    </ul>
                    <p><strong>What This Means for You:</strong></p>
                    <p>You'll experience faster loading times, smoother transactions, and improved overall banking experience across all our digital platforms.</p>
                    <p><strong>Feedback:</strong></p>
                    <p>We value your feedback on the improved services. Please share your experience through our customer feedback portal.</p>
                `
            }
        };

        const details = announcementDetails[announcementId];
        if (details) {
            modalBody.innerHTML = details.content;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    // Close modal functionality
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    // Event listeners for modal
    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Make showDetails function available globally
    window.showDetails = showDetails;

    // Contact support button functionality
    const contactBtn = document.querySelector('.contact-btn');
    contactBtn.addEventListener('click', function() {
        // You can customize this to open a contact form, redirect to support page, etc.
        alert('Redirecting to support page...\n\nPhone: 1800-XXX-XXXX\nEmail: support@yourbank.com\nChat: Available 24/7 on our website');
    });

    // Download PDF functionality (placeholder)
    const downloadLinks = document.querySelectorAll('.download-link');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Placeholder for PDF download functionality
            alert('PDF download will start shortly...\n\nNote: This is a demo. In a real application, this would download the actual PDF file.');
        });
    });

    // Add fade-in animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // Add smooth scrolling for better UX
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Keyboard shortcuts for better accessibility
document.addEventListener('keydown', function(e) {
    // ESC key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('detailModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});
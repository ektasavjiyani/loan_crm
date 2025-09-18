// Dashboard functionality
$(document).ready(function() {
    // Require authentication
    if (!requireAuth()) return;

    let customers = [];
    let currentPage = 0;
    let rowsPerPage = 10;
    let filters = {
        search: '',
        loan_status: ''
    };

    // Initialize dashboard
    init();

    async function init() {
        await loadUserInfo();
        await loadDashboardData();
        setupEventListeners();
    }

    // Load user information
    async function loadUserInfo() {
        try {
            const user = await getCurrentUser();
            if (user) {
                $('#user-name').text(user.full_name || user.username);
                $('#user-initial').text((user.full_name || user.username).charAt(0).toUpperCase());
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    }

    // Load dashboard data
    async function loadDashboardData() {
        try {
            await loadCustomers();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }


    // Load customers
    async function loadCustomers() {
        try {
            $('#loading').show();
            
            const params = {
                skip: currentPage * rowsPerPage,
                limit: rowsPerPage,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            };

            customers = await getCustomers(params);
            renderCustomerTable();
            updatePagination();
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            $('#loading').hide();
        }
    }

    // Render customer table
    function renderCustomerTable() {
        const tbody = $('#customer-table-body');
        tbody.empty();

        if (customers.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="9" class="px-6 py-4 text-center text-gray-500">
                        No customers found
                    </td>
                </tr>
            `);
            return;
        }

        customers.forEach(customer => {
            const statusColor = getStatusColor(customer.loan_status);
            
            tbody.append(`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${customer.first_name} ${customer.last_name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${customer.email || ''}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${formatCurrency(customer.loan_amount)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                            ${customer.loan_status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${formatCurrency(customer.outstanding_balance)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button class="view-customer text-primary hover:text-primary-dark" data-customer-id="${customer.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="generate-campaign text-green-600 hover:text-green-800" data-customer-id="${customer.id}" title="Generate Campaign">
                            <i class="fas fa-bullhorn"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    // Update pagination
    function updatePagination() {
        const from = currentPage * rowsPerPage + 1;
        const to = Math.min((currentPage + 1) * rowsPerPage, customers.length);
        
        $('#showing-from').text(from);
        $('#showing-to').text(to);
        $('#page-info').text(`Page ${currentPage + 1}`);
        
        $('#prev-btn, #prev-mobile').prop('disabled', currentPage === 0);
        $('#next-btn, #next-mobile').prop('disabled', customers.length < rowsPerPage);
    }


    // Setup event listeners
    function setupEventListeners() {
        // Logout
        $('#logout-btn').on('click', () => logout());

        // Search and filters
        $('#search-btn').on('click', function() {
            filters.search = $('#search-input').val();
            currentPage = 0;
            loadCustomers();
        });

        // Allow Enter key to trigger search
        $('#search-input').on('keypress', function(e) {
            if (e.which === 13) { // Enter key
                filters.search = $(this).val();
                currentPage = 0;
                loadCustomers();
            }
        });

        $('#status-filter').on('change', function() {
            filters.loan_status = $(this).val();
            currentPage = 0;
            loadCustomers();
        });


        $('#clear-filters').on('click', function() {
            filters = { search: '', loan_status: '' };
            $('#search-input').val('');
            $('#status-filter').val('');
            currentPage = 0;
            loadCustomers();
        });


        // View customer details
        $(document).on('click', '.view-customer', function() {
            const customerId = parseInt($(this).data('customer-id'));
            showCustomerDetail(customerId);
        });

        // Generate campaign for individual customer
        $(document).on('click', '.generate-campaign', function() {
            const customerId = parseInt($(this).data('customer-id'));
            showCampaignGenerator(customerId);
        });

        // Pagination
        $('#prev-btn, #prev-mobile').on('click', function() {
            if (currentPage > 0) {
                currentPage--;
                loadCustomers();
            }
        });

        $('#next-btn, #next-mobile').on('click', function() {
            currentPage++;
            loadCustomers();
        });

        // Modal close buttons
        $('#close-modal').on('click', () => $('#customer-modal').addClass('hidden'));
        $('#close-campaign-modal').on('click', () => $('#campaign-modal').addClass('hidden'));

        // Close modals on background click
        $('#customer-modal, #campaign-modal').on('click', function(e) {
            if (e.target === this) {
                $(this).addClass('hidden');
            }
        });
    }

    // Show customer detail modal
    async function showCustomerDetail(customerId) {
        try {
            const customer = await getCustomer(customerId);
            const activities = await getCustomerActivities(customerId);
            
            $('#modal-customer-name').text(`${customer.first_name} ${customer.last_name}`);
            
            const detailsHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium text-gray-900 mb-3">Customer Information</h4>
                        <div class="space-y-2 text-sm">
                            <div><strong>Email:</strong> ${customer.email || 'N/A'}</div>
                            <div><strong>Phone:</strong> ${customer.phone || 'N/A'}</div>
                            <div><strong>Status:</strong> <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.loan_status)}">${customer.loan_status}</span></div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium text-gray-900 mb-3">Loan Information</h4>
                        <div class="space-y-2 text-sm">
                            <div><strong>Loan Amount:</strong> ${formatCurrency(customer.loan_amount)}</div>
                            <div><strong>Outstanding:</strong> ${formatCurrency(customer.outstanding_balance)}</div>
                            <div><strong>Monthly Payment:</strong> ${formatCurrency(customer.monthly_payment)}</div>
                            <div><strong>Interest Rate:</strong> ${customer.interest_rate}%</div>
                            <div><strong>Term:</strong> ${customer.loan_term_months} months</div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-medium text-gray-900">Recent Activities</h4>
                        <button id="add-activity-btn" class="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark">
                            <i class="fas fa-plus mr-1"></i>Add Activity
                        </button>
                    </div>
                    
                    <div id="add-activity-form" class="hidden mb-4 p-4 border rounded-lg">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <select id="activity-type" class="px-3 py-2 border rounded focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="call">Call</option>
                                <option value="email">Email</option>
                                <option value="note">Note</option>
                                <option value="meeting">Meeting</option>
                            </select>
                            <input type="text" id="activity-subject" placeholder="Subject" class="px-3 py-2 border rounded focus:outline-none focus:ring-primary focus:border-primary">
                        </div>
                        <textarea id="activity-description" placeholder="Description" rows="2" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-primary focus:border-primary mb-4"></textarea>
                        <div class="flex space-x-2">
                            <button id="save-activity" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Save</button>
                            <button id="cancel-activity" class="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                    
                    <div class="space-y-3 max-h-64 overflow-y-auto">
                        ${activities.length === 0 ? '<p class="text-gray-500 text-sm">No activities found</p>' : 
                          activities.map(activity => `
                            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                                <div class="flex-shrink-0 mt-1">
                                    ${getActivityIcon(activity.activity_type)}
                                </div>
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-gray-900">${activity.subject}</div>
                                    <div class="text-sm text-gray-600">${activity.description || ''}</div>
                                    <div class="text-xs text-gray-500 mt-1">${formatDate(activity.created_at)} • ${activity.activity_type}</div>
                                </div>
                            </div>
                          `).join('')
                        }
                    </div>
                </div>
            `;
            
            $('#customer-details-content').html(detailsHtml);
            $('#customer-modal').removeClass('hidden');
            
            // Setup activity form handlers
            $('#add-activity-btn').on('click', () => $('#add-activity-form').removeClass('hidden'));
            $('#cancel-activity').on('click', () => $('#add-activity-form').addClass('hidden'));
            $('#save-activity').on('click', () => saveActivity(customerId));
            
        } catch (error) {
            console.error('Failed to load customer details:', error);
        }
    }

    // Save new activity
    async function saveActivity(customerId) {
        try {
            const activity = {
                customer_id: customerId,
                activity_type: $('#activity-type').val(),
                subject: $('#activity-subject').val(),
                description: $('#activity-description').val()
            };
            
            if (!activity.subject) {
                alert('Please enter a subject');
                return;
            }
            const result = await createActivity(activity);
            $('#add-activity-form').addClass('hidden');
            showCustomerDetail(customerId); // Refresh the modal
        } catch (error) {
            console.error('Failed to save activity:', error);
            alert('Failed to save activity');
        }
    }

    // Show campaign generator modal
    function showCampaignGenerator(customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const customerName = `${customer.first_name} ${customer.last_name}`;

        const campaignHtml = `
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h5 class="font-medium text-gray-900 mb-2">Customer</h5>
                    <p class="text-sm text-gray-600">${customerName}</p>
                    <p class="text-xs text-gray-500">${customer.email || ''}</p>
                </div>
                
                
                <div id="campaign-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                
                <div id="generated-message" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Generated Campaign Message</label>
                    <div class="bg-blue-50 border border-blue-200 p-4 rounded">
                        <pre id="message-content" class="whitespace-pre-wrap text-sm"></pre>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3">
                    <button id="cancel-campaign" class="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                    <button id="generate-message" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark" data-customer-id="${customerId}">
                        <i class="fas fa-bullhorn mr-2"></i>Generate Campaign
                    </button>
                </div>
            </div>
        `;
        
        $('#campaign-content').html(campaignHtml);
        $('#campaign-modal').removeClass('hidden');
        
        // Setup campaign handlers
        $('#cancel-campaign').on('click', () => $('#campaign-modal').addClass('hidden'));
        $('#generate-message').on('click', generateCampaignMessage);
    }

    // Generate campaign message
    async function generateCampaignMessage() {
        try {
            const customerId = parseInt($('#generate-message').data('customer-id'));
            $('#generate-message').prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-2"></i>Generating...');
            $('#campaign-error').addClass('hidden');
            
            const result = await generateCampaign({
                customer_id: customerId
            });
            
            $('#message-content').text(result.message);
            $('#generated-message').removeClass('hidden');
            
        } catch (error) {
            console.error('Failed to generate campaign:', error);
            $('#campaign-error').text(error.responseJSON?.detail || 'Failed to generate campaign message').removeClass('hidden');
        } finally {
            $('#generate-message').prop('disabled', false).html('<i class="fas fa-bullhorn mr-2"></i>Generate Campaign');
        }
    }


    // Utility functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getStatusColor(status) {
        if (!status || typeof status !== 'string') return 'bg-gray-100 text-gray-800';
        
        const colors = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            closed: 'bg-gray-100 text-gray-800',
        };
        return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }


    function getActivityIcon(type) {
        const icons = {
            call: '<i class="fas fa-phone text-blue-500"></i>',
            email: '<i class="fas fa-envelope text-green-500"></i>',
            note: '<i class="fas fa-sticky-note text-yellow-500"></i>',
            meeting: '<i class="fas fa-calendar text-purple-500"></i>',
        };
        return icons[type] || '<i class="fas fa-sticky-note text-gray-500"></i>';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});

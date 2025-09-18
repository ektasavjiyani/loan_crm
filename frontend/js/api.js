// API utilities
const API_BASE_URL = 'http://localhost:8003';

// Make authenticated request
async function apiRequest(endpoint, options = {}) {
    const config = {
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await $.ajax(config);
        return response;
    } catch (error) {
        if (error.status === 401) {
            logout();
        }
        throw error;
    }
}

// Customer API
async function getCustomers(params = {}) {
    const queryString = $.param(params);
    return apiRequest(`/customers?${queryString}`, { method: 'GET' });
}

async function getCustomer(id) {
    return apiRequest(`/customers/${id}`, { method: 'GET' });
}

async function createCustomer(customer) {
    return apiRequest('/customers', {
        method: 'POST',
        data: JSON.stringify(customer)
    });
}

async function updateCustomer(id, customer) {
    return apiRequest(`/customers/${id}`, {
        method: 'PUT',
        data: JSON.stringify(customer)
    });
}

// Activity API
async function getActivities(params = {}) {
    const queryString = $.param(params);
    return apiRequest(`/activities?${queryString}`, { method: 'GET' });
}

async function getCustomerActivities(customerId) {
    return apiRequest(`/customers/${customerId}/activities`, { method: 'GET' });
}

async function createActivity(activity) {
    return apiRequest('/activities', {
        method: 'POST',
        data: JSON.stringify(activity)
    });
}

// Campaign API
async function getCampaigns(params = {}) {
    const queryString = $.param(params);
    return apiRequest(`/campaigns?${queryString}`, { method: 'GET' });
}

async function generateCampaign(request) {
    return apiRequest('/campaigns/create', {
        method: 'POST',
        data: JSON.stringify(request)
    });
}

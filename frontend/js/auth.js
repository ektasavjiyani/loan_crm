// Authentication utilities
const BASE_URL = 'http://localhost:8003';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Get current user info
async function getCurrentUser() {
    const token = getToken();
    if (!token) return null;
    
    try {
        const response = await $.ajax({
            url: `${BASE_URL}/current_user`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Failed to get current user:', error);
        logout();
        return null;
    }
}

// Login
async function login(username, password) {
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await $.ajax({
            url: `${BASE_URL}/login`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false
        });

        localStorage.setItem('token', response.access_token);
        return { success: true };
    } catch (error) {
        console.error('Login failed:', error);
        return { 
            success: false, 
            error: error.responseJSON?.detail || 'Login failed' 
        };
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Get authorization headers
function getAuthHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Check authentication and redirect if needed
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Redirect authenticated users away from login
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

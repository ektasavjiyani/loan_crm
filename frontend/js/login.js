// Login page functionality
$(document).ready(function() {
    // Redirect if already authenticated
    redirectIfAuthenticated();

    // Handle login form submission
    $('#login-form').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();
        
        // Show loading state
        $('#login-btn').prop('disabled', true);
        $('#login-spinner').removeClass('hidden');
        $('#error-alert').addClass('hidden');
        
        try {
            const hashedPassword = await hashPassword(password);
            const result = await login(username, hashedPassword);
            
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                showError(result.error);
            }
        } catch (error) {
            showError('An unexpected error occurred. Please try again.');
        } finally {
            // Reset loading state
            $('#login-btn').prop('disabled', false);
            $('#login-text').text('Sign In');
            $('#login-spinner').addClass('hidden');
        }
    });
    
    function showError(message) {
        $('#error-message').text(message);
        $('#error-alert').removeClass('hidden');
    }

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        console.log(hashArray.map(b => b.toString(16).padStart(2, "0")).join(""));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
});

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
            const result = await login(username, password);
            
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
});

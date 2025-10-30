document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // --- LOGIN LOGIC (Updated) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the form from submitting normally

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // NEW: Get the selected role
            const role = document.querySelector('input[name="role"]:checked').value;

            let loginUrl = '';
            let dashboardUrl = '';

            if (role === 'user') {
                loginUrl = `${API_BASE_URL}/api/auth/login-user`;
                dashboardUrl = 'dashboard-user.html';
            } else { // role === 'agency'
                loginUrl = `${API_BASE_URL}/api/auth/login-agency`;
                dashboardUrl = 'dashboard-agency.html';
            }

            // NEW: Single login attempt based on selected role
            try {
                const res = await fetch(loginUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();
                
                if (res.ok) {
                    // Login successful! Save token and redirect.
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', role); // Store the role
                    window.location.href = dashboardUrl; // Redirect to the correct dashboard
                } else {
                    // Login failed
                    alert(data.msg || 'Invalid credentials');
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('An error occurred. Please try again.');
            }
        });
    }

    // --- REGISTRATION LOGIC (No changes needed) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get selected role
            const role = document.querySelector('input[name="role"]:checked').value;
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            let url = '';
            let body = {};

            if (role === 'user') {
                url = `${API_BASE_URL}/api/auth/register-user`;
                body = {
                    email,
                    password,
                    username: document.getElementById('username').value,
                    phone: document.getElementById('phone').value
                };
            } else { // role === 'agency'
                url = `${API_BASE_URL}/api/auth/register-agency`;
                body = {
                    email,
                    password,
                    agencyName: document.getElementById('agencyName').value,
                    address: document.getElementById('address').value
                };
            }

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const data = await res.json();
                
                if (res.ok) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    alert(data.msg || 'Registration failed. Please check your inputs.');
                }
            } catch (err) {
                console.error('Registration error:', err);
                alert('An error occurred. Please try again.');
            }
        });
    }
});
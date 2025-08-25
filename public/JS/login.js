// Password toggle functionality
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const icon = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '🙈';
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
            }
        }

        // Form submission
        // document.getElementById('loginForm').addEventListener('submit', async (e) => {
        //     e.preventDefault();
            
        //     const formData = {
        //         email: document.getElementById('email').value,
        //         password: document.getElementById('password').value,
        //         remember: document.getElementById('remember').checked
        //     };
            
        //     console.log('Login Data:', formData);
            
        //     // Here you would send data to your backend
        //     try {
        //         // Example API call
        //         const response = await fetch('/api/login', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify(formData)
        //         });

        //         if (response.ok) {
        //             const result = await response.json();
        //             alert('🎉 Login successful! Welcome back to BlogCraft!');
        //             // Redirect to dashboard
        //             window.location.href = '/dashboard.html';
        //         } else {
        //             throw new Error('Login failed');
        //         }
        //     } catch (error) {
        //         console.error('Login error:', error);
        //         alert('❌ Login failed. Please check your credentials.');
        //     }
        // });

        // Social login
        function socialLogin(provider) {
            console.log(`Social login with ${provider}`);
            alert(`🔗 Redirecting to ${provider} login...`);
            
            // Here you would implement actual social login
            // window.location.href = `/auth/${provider}`;
        }

        // Forgot password
        function showForgotPassword() {
            const email = prompt('Enter your email address to reset your password:');
            if (email) {
                console.log('Password reset requested for:', email);
                alert('📧 Password reset link sent to your email!');
                
                // Here you would call your forgot password API
                // fetch('/api/forgot-password', { method: 'POST', body: JSON.stringify({email}) })
            }
        }

        // Add interactive animations
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.style.transform = 'scale(1)';
            });
        });

        // Auto-focus email field on page load
        window.addEventListener('load', () => {
            document.getElementById('email').focus();
        });
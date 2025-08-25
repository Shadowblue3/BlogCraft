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

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength += 1;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push("lowercase letter");

    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push("uppercase letter");

    if (/[0-9]/.test(password)) strength += 1;
    else feedback.push("number");

    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    else feedback.push("special character");

    return { strength, feedback };
}

// Password strength indicator
document.getElementById('password').addEventListener('input', function () {
    const password = this.value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (password.length === 0) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Password strength';
        return;
    }

    const { strength, feedback } = checkPasswordStrength(password);

    // Remove existing strength classes
    strengthFill.className = 'strength-fill';

    if (strength <= 2) {
        strengthFill.classList.add('strength-weak');
        strengthText.textContent = 'Weak password';
    } else if (strength === 3) {
        strengthFill.classList.add('strength-fair');
        strengthText.textContent = 'Fair password';
    } else if (strength === 4) {
        strengthFill.classList.add('strength-good');
        strengthText.textContent = 'Good password';
    } else {
        strengthFill.classList.add('strength-strong');
        strengthText.textContent = 'Strong password';
    }
});

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Form validation
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (fullName.length < 2) {
        showError('Please enter your full name (at least 2 characters)');
        return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showError('Please enter a valid email address');
        return false;
    }

    const { strength } = checkPasswordStrength(password);
    if (strength < 3) {
        showError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters.');
        return false;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return false;
    }

    return true;
}

// Form submission
// document.getElementById('signupForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     const submitBtn = document.getElementById('submitBtn');
//     const originalText = submitBtn.textContent;

//     // Show loading state
//     submitBtn.textContent = 'Creating Account...';
//     submitBtn.disabled = true;

//     const formData = {
//         fullName: document.getElementById('fullName').value.trim(),
//         email: document.getElementById('email').value.trim(),
//         password: document.getElementById('password').value
//     };

//     console.log('Signup Data:', formData);

// });

// Social login
function socialLogin(provider) {
    console.log(`Social signup with ${provider}`);
    alert(`🔗 Redirecting to ${provider} signup...`);

    // Here you would implement actual social login
    // window.location.href = `/auth/${provider}`;
}

// Terms and Privacy
function showTerms() {
    alert('Terms of Service would be displayed here');
    // window.open('/terms.html', '_blank');
}

function showPrivacy() {
    alert('Privacy Policy would be displayed here');
    // window.open('/privacy.html', '_blank');
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

// Real-time password confirmation validation
document.getElementById('confirmPassword').addEventListener('input', function () {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#ff4757';
        this.style.boxShadow = '0 0 0 3px rgba(255, 71, 87, 0.1)';
    } else if (confirmPassword) {
        this.style.borderColor = '#2ed573';
        this.style.boxShadow = '0 0 0 3px rgba(46, 213, 115, 0.1)';
    } else {
        this.style.borderColor = '#e1e5e9';
        this.style.boxShadow = 'none';
    }
});

// Auto-focus full name field on page load
window.addEventListener('load', () => {
    document.getElementById('fullName').focus();
});
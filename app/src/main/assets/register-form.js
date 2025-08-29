import { supabase } from './supabase/supabase-client.js';

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    });

    if (error) {
        alert(error.message);
    } else {
        alert('Registration successful! Please check your email to verify your account.');
        window.location.href = 'login-form.html';
    }
});

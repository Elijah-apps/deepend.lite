import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const handleLogin = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('Error logging in:', error.message);
            alert(`Error logging in: ${error.message}`);
            return null;
        }
        console.log('Login successful:', data);
        alert('Login successful!');
        window.location.href = 'index.html';
        return data;
    } catch (error) {
        console.error('An unexpected error occurred during login:', error);
        alert('An unexpected error occurred. Please try again.');
        return null;
    }
};

export const handleSignup = async (email, password, fullName) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });
        if (error) {
            console.error('Error signing up:', error.message);
            alert(`Error signing up: ${error.message}`);
            return null;
        }
        console.log('Signup successful:', data);
        alert('Signup successful! Please check your email for verification.');
        // Redirect to a page that tells the user to check their email
        window.location.href = 'auth.html';
        return data;
    } catch (error) {
        console.error('An unexpected error occurred during signup:', error);
        alert('An unexpected error occurred. Please try again.');
        return null;
    }
};

export const handleLogout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
            alert(`Error logging out: ${error.message}`);
            return;
        }
        console.log('Logout successful');
        alert('Logout successful!');
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('An unexpected error occurred during logout:', error);
        alert('An unexpected error occurred. Please try again.');
    }
};

export const getSession = async () => {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error getting session:', error.message);
            return null;
        }
        return data.session;
    } catch (error) {
        console.error('An unexpected error occurred while getting session:', error);
        return null;
    }
};

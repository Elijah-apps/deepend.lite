import { supabase } from './supabase/supabase-client.js';

// Check user session
const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // If user is logged in, redirect to profile page
        window.location.href = 'profile.html';
    }
};

checkUser();

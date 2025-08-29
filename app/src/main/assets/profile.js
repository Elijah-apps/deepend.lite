import { supabase } from './supabase/supabase-client.js';

const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhoto = document.getElementById('profilePhoto');
const logoutButton = document.querySelector('.logout-btn');

const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
        } else {
            profileName.textContent = profile.full_name;
            profileEmail.textContent = user.email;
            if (profile.avatar_url) {
                profilePhoto.innerHTML = `<img src="${profile.avatar_url}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        }
    } else {
        window.location.href = 'auth.html';
    }
};

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
    } else {
        window.location.href = 'auth.html';
    }
};

logoutButton.addEventListener('click', handleLogout);

loadUserProfile();

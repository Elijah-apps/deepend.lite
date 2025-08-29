import { supabase } from './supabase/supabase-client.js';

const userName = document.getElementById('userName');
const profileAvatar = document.getElementById('profileAvatar');
const avatarOverlay = document.getElementById('avatarOverlay');

const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

        userName.textContent = profile.full_name;
        if (profile.avatar_url) {
            profileAvatar.querySelector('img').src = profile.avatar_url;
        }
        avatarOverlay.style.display = 'none';

        profileAvatar.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });

    } else {
        userName.textContent = 'Guest';
        avatarOverlay.style.display = 'flex';
        profileAvatar.addEventListener('click', () => {
            window.location.href = 'auth.html';
        });
    }
};

const fetchProducts = async () => {
    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    // For now, just log the products to the console
    console.log(products);
};


loadUser();
fetchProducts();

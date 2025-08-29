import { supabase } from './supabase/supabase-client.js';

let cartItems = [];

const renderCart = () => {
    const cartContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');

    if (cartItems.length === 0) {
        cartContainer.style.display = 'none';
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }

    cartContainer.style.display = 'block';
    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';

    cartContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="d-flex align-items-center">
                <img src="${item.products.image_url}" alt="${item.products.name}" class="cart-item-image">
                <div class="cart-item-content">
                    <div class="cart-item-title">${item.products.name}</div>
                    <div class="cart-item-price">$${item.products.price.toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fa-regular fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                        <i class="fa-regular fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeItem('${item.id}')">
                    <i class="fa-regular fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    updateSummary();
};

const updateSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
    const discount = 0; // Implement discount logic if needed
    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
};

const fetchCartItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Handle not logged in user
        return;
    }

    // First, get the user's cart
    const { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (cartError || !cart) {
        console.error('Error fetching cart:', cartError);
        return;
    }

    const { data, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            quantity,
            products (
                name,
                price,
                image_url
            )
        `)
        .eq('cart_id', cart.id);

    if (error) {
        console.error('Error fetching cart items:', error);
        return;
    }

    cartItems = data;
    renderCart();
};

window.updateQuantity = async (itemId, quantity) => {
    if (quantity === 0) {
        await removeItem(itemId);
        return;
    }

    const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

    if (error) {
        console.error('Error updating quantity:', error);
    } else {
        fetchCartItems();
    }
};

window.removeItem = async (itemId) => {
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error removing item:', error);
    } else {
        fetchCartItems();
    }
};

fetchCartItems();

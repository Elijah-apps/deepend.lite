import { supabase } from './supabase/supabase-client.js';

let cartItems = [];
let userAddresses = [];
let selectedAddressId = null;
let selectedPaymentMethod = null;

const fetchCartItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

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
            products (*)
        `)
        .eq('cart_id', cart.id);

    if (error) {
        console.error('Error fetching cart items:', error);
        return;
    }

    cartItems = data;
    renderOrderItems();
    updateOrderSummary();
};

const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching addresses:', error);
        return;
    }

    userAddresses = data;
    renderAddresses();
};

const renderOrderItems = () => {
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = cartItems.map(item => `
        <div class="order-item">
            <img src="${item.products.image_url}" alt="${item.products.name}" class="order-item-image">
            <div class="order-item-details">
                <div class="order-item-name">${item.products.name}</div>
            </div>
            <div class="order-item-price">$${(item.products.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
};

const renderAddresses = () => {
    const addressOptionsContainer = document.getElementById('addressOptions');
    addressOptionsContainer.innerHTML = userAddresses.map(address => `
        <div class="address-option ${address.is_default ? 'selected' : ''}" data-address-id="${address.id}">
            <div class="address-type">${address.address_line1}</div>
            <div class="address-details">
                ${address.city}, ${address.state} ${address.postal_code}
            </div>
        </div>
    `).join('') + `
        <div class="add-address-btn" id="addAddressBtn">
            <i class="fa-regular fa-plus me-2"></i>
            Add New Address
        </div>
    `;

    if (userAddresses.length > 0) {
        const defaultAddress = userAddresses.find(a => a.is_default) || userAddresses[0];
        selectedAddressId = defaultAddress.id;
    }

    document.querySelectorAll('.address-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.address-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedAddressId = option.dataset.addressId;
            updateConfirmButtonState();
        });
    });
};

const updateOrderSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
    const deliveryFee = 5.00; // Example fee
    const total = subtotal + deliveryFee;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('deliveryFee').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
};

const updateConfirmButtonState = () => {
    const confirmBtn = document.getElementById('confirmOrderBtn');
    confirmBtn.disabled = !selectedAddressId || !selectedPaymentMethod;
};

document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedPaymentMethod = option.dataset.paymentId;
        updateConfirmButtonState();
    });
});

document.getElementById('confirmOrderBtn').addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
    const deliveryFee = 5.00;
    const total = subtotal + deliveryFee;

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            total_amount: total,
            status: 'pending'
        })
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        return;
    }

    const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price_per_unit: item.products.price
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // TODO: Handle this error, maybe delete the created order
        return;
    }

    // Clear the cart
    const { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if(cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    window.location.href = `order-success.html?order_id=${order.id}`;
});


fetchCartItems();
fetchAddresses();

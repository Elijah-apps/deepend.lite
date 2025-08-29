import { supabase } from './supabase/supabase-client.js';

const fetchOrderHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('order_date', { ascending: false });

    if (error) {
        console.error('Error fetching order history:', error);
        return;
    }

    renderOrders(orders);
};

const renderOrders = (orders) => {
    const orderList = document.getElementById('orderList');
    if (orders.length === 0) {
        orderList.innerHTML = '<div class="no-orders">No orders yet.</div>';
        return;
    }

    orderList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <div class="order-number">Order #${order.id}</div>
                <div class="order-note">Total: $${order.total_amount.toFixed(2)}</div>
            </div>
            <div class="order-time">${new Date(order.order_date).toLocaleString()}</div>
        </div>
    `).join('');
};

fetchOrderHistory();

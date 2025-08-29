import { supabase } from './supabase/supabase-client.js';

const getOrderIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('order_id');
};

const fetchOrderDetails = async () => {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
        // Handle no order id
        return;
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order details:', error);
        return;
    }

    document.getElementById('orderId').textContent = order.id;
    document.getElementById('orderDate').textContent = new Date(order.order_date).toLocaleDateString();
    document.getElementById('totalAmount').textContent = `$${order.total_amount.toFixed(2)}`;
};

fetchOrderDetails();

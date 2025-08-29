import { supabase } from './supabase/supabase-client.js';

const getOrderIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderId');
};

const fetchOrderDetails = async () => {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
        // Handle no order id
        return;
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order details:', error);
        return;
    }

    renderOrderDetails(order);
    startStatusSubscription(order.id);
};

const renderOrderDetails = (order) => {
    document.getElementById('orderId').textContent = order.id;
    document.getElementById('orderTime').textContent = new Date(order.order_date).toLocaleTimeString();
    
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = order.order_items.map(item => `
        <div class="order-item">
            <img src="${item.products.image_url}" alt="${item.products.name}" class="order-item-image">
            <div class="order-item-details">
                <div class="order-item-name">${item.products.name}</div>
            </div>
            <div class="order-item-price">$${(item.price_per_unit * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
};

const updateProgress = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = steps.indexOf(status);

    for (let i = 0; i < steps.length; i++) {
        const stepIcon = document.getElementById(`step${i + 1}`);
        const stepLabel = stepIcon.nextElementSibling;

        if (i < currentStepIndex) {
            stepIcon.className = 'step-icon completed';
            stepLabel.className = 'step-label completed';
        } else if (i === currentStepIndex) {
            stepIcon.className = 'step-icon current';
            stepLabel.className = 'step-label current';
        } else {
            stepIcon.className = 'step-icon pending';
            stepLabel.className = 'step-label';
        }
    }

    const progressFill = document.getElementById('progressFill');
    const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;
    progressFill.style.width = `${progressPercentage}%`;
};

const startStatusSubscription = (orderId) => {
    supabase.channel(`public:orders:id=eq.${orderId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, payload => {
            const newStatus = payload.new.status;
            updateProgress(newStatus);
            document.getElementById('statusMessage').textContent = `Your order is now ${newStatus}`;
            document.getElementById('statusTime').textContent = new Date().toLocaleTimeString();
        })
        .subscribe();
};

fetchOrderDetails();

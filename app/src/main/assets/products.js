import { supabase } from './supabase/supabase-client.js';

const getCategoryFromPath = () => {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    const category = filename.split('.')[0];
    if (category === 'equipment-rental') return 'equipment';
    if (category === 'movie-ticketing') return 'movie';
    if (category === 'vr-games') return 'vr_game';
    if (category === 'hotel-booking') return 'hotel';
    if (category === 'studio-booking') return 'studio';
    return category;
};

const fetchProductsByCategory = async () => {
    const category = getCategoryFromPath();
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            product_images (
                image_url
            )
        `)
        .eq('category', category);

    if (error) {
        console.error(`Error fetching ${category} products:`, error);
        return;
    }

    if (category === 'hotel') {
        renderHotelCards(products);
    } else {
        // For other categories, just log the products to the console for now
        console.log(products);
    }
};

const renderHotelCards = (products) => {
    const popularHotelsContainer = document.getElementById('popular-hotels');
    const luxuryHotelsContainer = document.getElementById('luxury-hotels');

    popularHotelsContainer.innerHTML = '';
    luxuryHotelsContainer.innerHTML = '';

    products.forEach(product => {
        const cardHtml = `
            <div class="meal-card" data-product-id="${product.id}">
                <div class="meal-image">
                    <img src="${product.image_url}" alt="${product.name}">
                    <span class="meal-time">5★</span>
                    <span class="meal-rating">
                        <i class="fa-regular fa-star"></i>
                        4.9
                    </span>
                </div>
                <div class="meal-content">
                    <h3 class="meal-title">${product.name}</h3>
                    <p class="meal-description">${product.description}</p>
                    <div class="meal-footer">
                        <span class="meal-price">$${product.price}/night</span>
                        <button class="book-now-btn btn btn-danger btn-sm rounded-pill px-3"><i class="fa-regular fa-calendar-check me-1"></i>Book Now</button>
                    </div>
                </div>
            </div>
        `;

        // For simplicity, I'm adding all hotels to both popular and luxury sections.
        // In a real application, you would have a way to distinguish them.
        popularHotelsContainer.innerHTML += cardHtml;
        luxuryHotelsContainer.innerHTML += cardHtml;
    });

    document.querySelectorAll('.meal-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = card.dataset.productId;
            const product = products.find(p => p.id === productId);
            openGalleryModal(product);
        });
    });
};

const openGalleryModal = (product) => {
    const galleryCarousel = document.getElementById('galleryCarousel');
    const carouselInner = galleryCarousel.querySelector('.carousel-inner');

    carouselInner.innerHTML = '';

    const images = [product.image_url, ...product.product_images.map(img => img.image_url)];

    images.forEach((imageUrl, index) => {
        const item = document.createElement('div');
        item.classList.add('carousel-item');
        if (index === 0) {
            item.classList.add('active');
        }
        item.innerHTML = `<img src="${imageUrl}" class="d-block w-100" alt="...">`;
        carouselInner.appendChild(item);
    });

    const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));
    galleryModal.show();
};

fetchProductsByCategory();
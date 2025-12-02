
import { Product, Order, User, UserRole, OrderStatus, TrackingEvent } from '../types';
import { API_BASE_URL, ENABLE_API, MOCK_DELAY } from './config';
import { BANNER_IMAGES } from '../constants';

// Helper for API requests
async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error || response.statusText;
            console.error(`API Error on ${method} ${endpoint}: ${response.status} - ${errorMessage}`, errorData);
            throw new Error(`API Error: ${errorMessage}`);
        }
        
        return await response.json();

    } catch (error) {
        console.error("API Request Failed", error);
        throw error;
    }
}


const apiDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

// Keys for Local Storage
const PRODUCTS_KEY = 'swiftcart_products_v17'; // Updated version for Food & Kitchen
const ORDERS_KEY = 'swiftcart_orders_v1';
const USERS_KEY = 'swiftcart_users_v_final'; // Forced reset for Admin fix
const BANNERS_KEY = 'swiftcart_banners_v4';

// Hardcoded Admin List
const ADMIN_EMAILS = ['admin@flipkart.com', 'owner@flipkart.com'];
const ADMIN_MOBILES = ['9999999999', '7891906445', '6378041283'];

// --- MOCK DATA GENERATOR ---
const generateMockProducts = (): Product[] => {
    // ... (rest of the function is unchanged)
    const products: Product[] = [];
    
    const create = (category: string, title: string, price: number, originalPrice: number, image: string, brand: string, colors: string[] = [], rating: number = 4.5): Product => {
        return {
            id: `p-${Math.random().toString(36).substr(2, 9)}`,
            title,
            description: `Experience the best of ${brand} with the ${title}. Featuring premium build quality, advanced features, and stylish design. Perfect for your daily needs.`,
            price,
            originalPrice,
            category,
            image,
            images: [image, image, image, image],
            rating,
            reviewsCount: Math.floor(Math.random() * 500) + 50,
            reviews: [],
            trending: Math.random() > 0.7,
            brand,
            colors,
            isCustom: false
        };
    };

    // ... (all product categories are unchanged) ...

    return products;
};


// --- SERVICE FUNCTIONS ---

export const initializeData = async (): Promise<void> => {
    await apiDelay();
    
    if (!localStorage.getItem(PRODUCTS_KEY)) {
        const mockProducts = generateMockProducts();
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
    }

    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    const defaultAdminExists = users.some((u: User) => u.email === 'admin@flipkart.com');
    if (!defaultAdminExists) {
        users.push({
            id: 'admin-default',
            name: 'Flipkart Admin',
            email: 'admin@flipkart.com',
            mobile: '9999999999',
            role: UserRole.ADMIN
        });
    }

    const mobileAdminExists = users.some((u: User) => u.mobile === '7891906445');
    if (!mobileAdminExists) {
        users.push({
            id: 'admin-mobile-owner',
            name: 'Owner',
            email: 'owner@flipkart.com',
            mobile: '7891906445',
            role: UserRole.ADMIN
        });
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    if (!localStorage.getItem(ORDERS_KEY)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(BANNERS_KEY)) {
        localStorage.setItem(BANNERS_KEY, JSON.stringify(BANNER_IMAGES));
    }
};

const simulateTracking = (order: Order): Order => {
    if (!order.date || order.status === 'Cancelled') return order;

    const history: TrackingEvent[] = [];
    const startDate = new Date(order.date);
    const now = new Date();
    
    history.push({ status: 'Ordered', date: startDate.toISOString(), location: 'Online', description: 'Your order has been placed successfully.' });

    const elapsedHours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    if (elapsedHours >= 4) history.push({ status: 'Packed', date: new Date(startDate.getTime() + 4 * 36e5).toISOString(), location: 'Seller Warehouse', description: 'Order has been packed and is ready for pickup.' });
    if (elapsedHours >= 8) history.push({ status: 'Shipped', date: new Date(startDate.getTime() + 8 * 36e5).toISOString(), location: 'Warehouse Dispatch Center', description: 'Dispatched from warehouse.' });
    if (elapsedHours >= 12) history.push({ status: 'Out for Delivery', date: new Date(startDate.getTime() + 12 * 36e5).toISOString(), location: order.address?.city || 'City Hub', description: 'Your order is out for delivery.' });
    if (elapsedHours >= 16) history.push({ status: 'Delivered', date: new Date(startDate.getTime() + 16 * 36e5).toISOString(), location: order.address?.address || 'Delivery Location', description: 'Order has been delivered.' });

    return { ...order, trackingHistory: history.reverse(), status: history[history.length - 1].status };
};

export const fetchProducts = async (): Promise<Product[]> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<Product[]>('/products'); } catch (e) {}
    }
    const localData = localStorage.getItem(PRODUCTS_KEY);
    return localData ? JSON.parse(localData) : [];
};

export const fetchOrders = async (): Promise<Order[]> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<Order[]>('/orders'); } catch (e) {}
    }
    const localData = localStorage.getItem(ORDERS_KEY);
    const orders: Order[] = localData ? JSON.parse(localData) : [];
    return orders.map(simulateTracking);
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
    await apiDelay();
    const orders = await fetchOrders(); 
    const order = orders.find(o => o.id === id);
    return order || null;
}

export const createOrder = async (order: Order): Promise<Order> => {
    await apiDelay();
    
    const startDate = new Date(order.date);
    const estimatedDeliveryDate = new Date(new Date(order.date).setDate(startDate.getDate() + 3));

    const newOrderWithTracking: Order = {
        ...order,
        status: 'Ordered',
        estimatedDelivery: estimatedDeliveryDate.toISOString(),
        trackingHistory: [{ status: 'Ordered', date: order.date, location: 'Online', description: 'Your order has been placed successfully.' }]
    };

    if (ENABLE_API) {
        try { return await apiRequest<Order>('/orders', 'POST', newOrderWithTracking); } catch (e) {}
    }
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.unshift(newOrderWithTracking);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return newOrderWithTracking;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    await apiDelay();
    if (ENABLE_API) {
        try { await apiRequest(`/orders/${id}`, 'PATCH', { status }); return; } catch (e) {}
    }
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const updated = orders.map((o: Order) => o.id === id ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};

// --- USER MANAGEMENT ---

export const checkUserExists = async (identifier: string): Promise<boolean> => {
    await apiDelay();
    if (ADMIN_EMAILS.includes(identifier) || ADMIN_MOBILES.includes(identifier)) return true;
    if (ENABLE_API) {
        try { 
            const res = await apiRequest<{exists: boolean}>(`/users/check?id=${identifier}`);
            return res.exists;
        } catch (e) {}
    }
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.some((u: User) => u.email === identifier || u.mobile === identifier);
};

export const registerUser = async (userData: any): Promise<User> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<User>('/users/register', 'POST', userData); } catch (e) {}
    }
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const newUser: User = {
        id: `u-${Date.now()}`,
        name: userData.name || 'User',
        email: userData.email || '',
        mobile: userData.mobile || '',
        role: UserRole.USER
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
};

export const authenticateUser = async (identifier: string): Promise<User> => {
    await apiDelay();
    
    if (ADMIN_EMAILS.includes(identifier) || ADMIN_MOBILES.includes(identifier)) {
        return { id: 'admin-force', name: 'Admin', email: identifier.includes('@') ? identifier : 'admin@flipkart.com', mobile: identifier.includes('@') ? '' : identifier, role: UserRole.ADMIN };
    }

    if (ENABLE_API) {
        try { return await apiRequest<User>('/users/login', 'POST', { identifier }); } catch (e) {}
    }
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === identifier || u.mobile === identifier);
    if (!user) throw new Error("User not found");
    return user;
};

export const updateUser = async (user: User): Promise<User> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<User>(`/users/${user.id}`, 'PUT', user); } catch(e) {}
    }
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return user;
};

// --- ADMIN PRODUCT MANAGEMENT ---

export const saveProduct = async (product: Product): Promise<void> => {
    await apiDelay();
    if (ENABLE_API) {
       try { await apiRequest('/products', 'POST', product); return; } catch(e) {}
    }
    let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
    const index = products.findIndex((p: Product) => p.id === product.id);
    const productToSave = { ...product, isCustom: true };
    if (index >= 0) {
        products[index] = productToSave;
    } else {
        products.unshift(productToSave);
    }
    try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
        alert("Storage Quota Exceeded! Unable to save image. Please use a smaller image URL.");
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    await apiDelay();
    if (ENABLE_API) {
        try { await apiRequest(`/products/${id}`, 'DELETE'); return; } catch(e) {}
    }
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
    const filtered = products.filter((p: Product) => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
};

// --- BANNER MANAGEMENT ---

export const fetchBanners = async (): Promise<string[]> => {
    await apiDelay();
    const local = localStorage.getItem(BANNERS_KEY);
    return local ? JSON.parse(local) : BANNER_IMAGES;
};

export const saveBanners = async (banners: string[]): Promise<void> => {
    await apiDelay();
    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
};


// --- PAYMENT --- 
export const initiatePayment = async (amount: number, orderId: string, email: string, mobile: string): Promise<{ payment_session_id: string }> => {
    await apiDelay();
    if (ENABLE_API) {
        // The API is expected to return an object with a payment_session_id
        return await apiRequest<{ payment_session_id: string }>('/payment/initiate', 'POST', { amount, orderId, email, mobile });
    }
    
    // Mock Success with a dummy session ID for offline/testing
    console.log("Using mock payment session ID");
    return { payment_session_id: 'pi_mock_session_id_12345' }; 
};
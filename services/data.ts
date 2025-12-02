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
            throw new Error(`API Error: ${response.statusText}`);
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

    // 1. MOBILES (20 items)
    const mobiles = [
        { t: "Apple iPhone 15 (Black, 128 GB)", p: 72999, op: 79900, b: "Apple", i: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80", c: ["Black", "Blue", "Green", "Pink"] },
        { t: "Apple iPhone 15 Pro Max (Natural Titanium, 256 GB)", p: 156900, op: 159900, b: "Apple", i: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=400&q=80", c: ["Natural Titanium", "Blue Titanium"] },
        { t: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)", p: 129999, op: 134999, b: "Samsung", i: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&w=400&q=80", c: ["Titanium Gray", "Black"] },
        { t: "Realme 12 Pro+ 5G (Submarine Blue, 256 GB)", p: 29999, op: 34999, b: "Realme", i: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=400&q=80", c: ["Submarine Blue", "Navigator Beige"] },
        { t: "Google Pixel 8 Pro (Obsidian, 128 GB)", p: 98999, op: 106999, b: "Google", i: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80", c: ["Obsidian", "Porcelain"] },
        { t: "OnePlus 12 (Flowy Emerald, 512 GB)", p: 69999, op: 69999, b: "OnePlus", i: "https://images.unsplash.com/photo-1661237427977-33d3ed752a94?auto=format&fit=crop&w=400&q=80", c: ["Flowy Emerald", "Silky Black"] },
        { t: "Nothing Phone (2a) 5G (Black, 128 GB)", p: 23999, op: 27999, b: "Nothing", i: "https://images.unsplash.com/photo-1692620359197-43763772244f?auto=format&fit=crop&w=400&q=80", c: ["Black", "White"] },
        { t: "Xiaomi 14 (Jade Green, 512 GB)", p: 69999, op: 79999, b: "Xiaomi", i: "https://images.unsplash.com/photo-1592436129527-294c7076334d?auto=format&fit=crop&w=400&q=80", c: ["Jade Green", "Matte Black"] },
        { t: "Samsung Galaxy Z Flip 5 (Mint, 256 GB)", p: 89999, op: 99999, b: "Samsung", i: "https://images.unsplash.com/photo-1657182642707-2b2433493406?auto=format&fit=crop&w=400&q=80", c: ["Mint", "Cream"] },
        { t: "Motorola Edge 50 Pro 5G (Luxe Lavender, 256 GB)", p: 31999, op: 36999, b: "Motorola", i: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80", c: ["Luxe Lavender", "Black Beauty"] },
        { t: "POCO X6 Pro 5G (Yellow, 256 GB)", p: 25999, op: 30999, b: "POCO", i: "https://images.unsplash.com/photo-1574628379319-12be6a42489e?auto=format&fit=crop&w=400&q=80", c: ["Yellow", "Black"] },
        { t: "Vivo V30 Pro (Andaman Blue, 256 GB)", p: 41999, op: 46999, b: "Vivo", i: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=400&q=80", c: ["Andaman Blue", "Classic Black"] },
        { t: "Realme Narzo 70 Pro 5G (Glass Green, 128 GB)", p: 16999, op: 21999, b: "Realme", i: "https://images.unsplash.com/photo-1595941069915-4ebc5197c39c?auto=format&fit=crop&w=400&q=80", c: ["Glass Green", "Glass Gold"] },
        { t: "Infinix Note 40 Pro 5G (Vintage Green, 256 GB)", p: 21999, op: 25999, b: "Infinix", i: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=400&q=80", c: ["Vintage Green", "Titan Gold"] },
        { t: "Apple iPhone 13 (Starlight, 128 GB)", p: 49999, op: 59900, b: "Apple", i: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=400&q=80", c: ["Starlight", "Midnight", "Blue"] }
    ];
    mobiles.forEach(m => products.push(create("Mobiles", m.t, m.p, m.op, m.i, m.b, m.c)));

    // 2. ELECTRONICS (Laptops, Audio, Cameras - 15 items)
    const electronics = [
        { t: "Apple MacBook Air M2 (Starlight, 256 GB)", p: 92990, op: 114900, b: "Apple", i: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80", c: ["Starlight", "Midnight"] },
        { t: "Sony WH-1000XM5 Noise Cancelling Headphones", p: 26990, op: 34990, b: "Sony", i: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80", c: ["Black", "Silver"] },
        { t: "Dell XPS 13 Plus Laptop (Platinum)", p: 164990, op: 190000, b: "Dell", i: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=400&q=80", c: ["Platinum", "Graphite"] },
        { t: "HP Pavilion 15 (Intel i5, 16GB RAM)", p: 62990, op: 75000, b: "HP", i: "https://images.unsplash.com/photo-1588872657578-a3d827a4507d?auto=format&fit=crop&w=400&q=80", c: ["Silver", "Gold"] },
        { t: "Apple iPad Air 5th Gen (Blue, 64 GB)", p: 54900, op: 59900, b: "Apple", i: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80", c: ["Blue", "Purple", "Space Grey"] },
        { t: "Canon EOS 1500D DSLR Camera", p: 41990, op: 47995, b: "Canon", i: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80", c: ["Black"] },
        { t: "JBL Flip 6 Wireless Bluetooth Speaker", p: 9999, op: 13999, b: "JBL", i: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80", c: ["Blue", "Red", "Black"] },
        { t: "Logitech MX Master 3S Wireless Mouse", p: 9495, op: 10995, b: "Logitech", i: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80", c: ["Graphite", "Pale Grey"] },
        { t: "GoPro HERO12 Black Action Camera", p: 37990, op: 45000, b: "GoPro", i: "https://images.unsplash.com/photo-1564466964053-44b1a8ad2e1d?auto=format&fit=crop&w=400&q=80", c: ["Black"] },
        { t: "Asus ROG Strix G16 Gaming Laptop", p: 114990, op: 145000, b: "Asus", i: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80", c: ["Eclipse Gray"] },
        { t: "Samsung Galaxy Tab S9 FE", p: 34999, op: 44999, b: "Samsung", i: "https://images.unsplash.com/photo-1589312863444-012233964228?auto=format&fit=crop&w=400&q=80", c: ["Mint", "Gray"] },
        { t: "boAt Rockerz 450 Bluetooth Headset", p: 1299, op: 3990, b: "boAt", i: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80", c: ["Luscious Black", "Aqua Blue"] }
    ];
    electronics.forEach(e => products.push(create("Electronics", e.t, e.p, e.op, e.i, e.b, e.c)));

    // 3. FASHION
    const fashion = [
        { t: "Nike Air Max 270 Running Shoes", p: 11495, op: 14995, b: "Nike", i: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80", c: ["Red", "Black", "White"] },
        { t: "Puma Men White Sneakers", p: 3499, op: 6999, b: "Puma", i: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80", c: ["White"] },
        { t: "Adidas Ultraboost Light Running Shoes", p: 14999, op: 18999, b: "Adidas", i: "https://images.unsplash.com/photo-1587563871167-1ee7c7358bcc?auto=format&fit=crop&w=400&q=80", c: ["Black", "White"] },
        { t: "HRX by Hrithik Roshan Men Running Shoes", p: 1499, op: 3999, b: "HRX", i: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=400&q=80", c: ["Blue", "Grey"] },
        { t: "Levi's Men Slim Fit Blue Jeans", p: 2199, op: 3599, b: "Levis", i: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=400&q=80", c: ["Blue"] },
        { t: "Allen Solly Men Regular Fit Shirt", p: 999, op: 1999, b: "Allen Solly", i: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80", c: ["White", "Blue"] },
        { t: "Biba Women Printed Kurta", p: 1299, op: 2499, b: "Biba", i: "https://images.unsplash.com/photo-1583391733958-e036e2463009?auto=format&fit=crop&w=400&q=80", c: ["Red", "Yellow"] },
        { t: "Woodland Men Leather Wallet", p: 1495, op: 2295, b: "Woodland", i: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80", c: ["Brown"] },
        { t: "Ray-Ban Aviator Sunglasses", p: 6590, op: 8990, b: "Ray-Ban", i: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80", c: ["Gold", "Black"] },
        { t: "Zara Woman Floral Dress", p: 2990, op: 3990, b: "Zara", i: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80", c: ["Floral", "Black"] },
        { t: "Tommy Hilfiger Men Polo T-Shirt", p: 2499, op: 3999, b: "Tommy Hilfiger", i: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80", c: ["Navy", "Red", "White"] },
        { t: "H&M Women Hoodie", p: 1499, op: 2299, b: "H&M", i: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=400&q=80", c: ["Beige", "Grey"] },
        { t: "Casio Vintage Digital Watch", p: 1695, op: 1695, b: "Casio", i: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&q=80", c: ["Silver", "Gold"] }
    ];
    fashion.forEach(f => products.push(create("Fashion", f.t, f.p, f.op, f.i, f.b, f.c)));

    // 4. WATCHES
    const watches = [
        { t: "Apple Watch Ultra 2 (GPS + Cellular)", p: 89900, op: 89900, b: "Apple", i: "https://images.unsplash.com/photo-1664733762736-22c9c4984a75?auto=format&fit=crop&w=400&q=80", c: ["Titanium"] },
        { t: "Samsung Galaxy Watch 6 Classic", p: 36999, op: 42999, b: "Samsung", i: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=400&q=80", c: ["Black", "Silver"] },
        { t: "Fossil Gen 6 Smartwatch", p: 18995, op: 24995, b: "Fossil", i: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80", c: ["Brown Leather", "Black Silicone"] },
        { t: "Titan Neo Analog Watch for Men", p: 5495, op: 6995, b: "Titan", i: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80", c: ["Black", "Blue"] },
        { t: "Casio G-Shock Analog-Digital", p: 8995, op: 9995, b: "Casio", i: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=400&q=80", c: ["Black", "Red"] },
        { t: "Daniel Wellington Classic Bristol", p: 13499, op: 15999, b: "Daniel Wellington", i: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=400&q=80", c: ["Rose Gold", "Silver"] },
        { t: "Fastrack Reflex Vox Smartwatch", p: 1995, op: 4995, b: "Fastrack", i: "https://images.unsplash.com/photo-1508057198894-247b986633e5?auto=format&fit=crop&w=400&q=80", c: ["Black", "Pink"] },
        { t: "Noise ColorFit Pro 4", p: 2499, op: 5999, b: "Noise", i: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&w=400&q=80", c: ["Charcoal Black", "Deep Wine"] },
        { t: "Boat Xtend Smartwatch", p: 1799, op: 7990, b: "boAt", i: "https://images.unsplash.com/photo-1533139502658-0198f920d36c?auto=format&fit=crop&w=400&q=80", c: ["Pitch Black", "Deep Blue"] }
    ];
    watches.forEach(w => products.push(create("Watches", w.t, w.p, w.op, w.i, w.b, w.c)));

    // 5. HOME & LIVING
    const home = [
        { t: "Wakefit Orthopedic Memory Foam Mattress", p: 10999, op: 15999, b: "Wakefit", i: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80" },
        { t: "Solimo 3-Seater Sofa Set", p: 15999, op: 25999, b: "Solimo", i: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80" },
        { t: "Philips Smart Wi-Fi LED Bulb", p: 699, op: 1999, b: "Philips", i: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=400&q=80" },
        { t: "Milton Thermosteel Water Bottle (1L)", p: 899, op: 1299, b: "Milton", i: "https://images.unsplash.com/photo-1602143407151-11115a329496?auto=format&fit=crop&w=400&q=80" },
        { t: "Prestige Iris Mixer Grinder", p: 3299, op: 6195, b: "Prestige", i: "https://images.unsplash.com/photo-1585236053703-27df34622a12?auto=format&fit=crop&w=400&q=80" }
    ];
    home.forEach(h => products.push(create("Home & Living", h.t, h.p, h.op, h.i, h.b)));

    // 6. BEAUTY
    const beauty = [
        { t: "Lakmé Absolute Matte Lipstick", p: 650, op: 800, b: "Lakme", i: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80" },
        { t: "Maybelline New York Mascara", p: 399, op: 549, b: "Maybelline", i: "https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?auto=format&fit=crop&w=400&q=80" },
        { t: "Nivea Men Face Wash", p: 199, op: 299, b: "Nivea", i: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80" },
        { t: "Davidoff Cool Water Perfume", p: 3500, op: 5500, b: "Davidoff", i: "https://images.unsplash.com/photo-1523293188086-b15e41dc8c47?auto=format&fit=crop&w=400&q=80" }
    ];
    beauty.forEach(b => products.push(create("Beauty", b.t, b.p, b.op, b.i, b.b)));

    // 7. SPORTS
    const sports = [
        { t: "Yonex Muscle Power Badminton Racquet", p: 2499, op: 3999, b: "Yonex", i: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80" },
        { t: "Nivia Storm Football", p: 499, op: 999, b: "Nivia", i: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=400&q=80" },
        { t: "SG Cricket Bat Grade 1", p: 5999, op: 8999, b: "SG", i: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80" }
    ];
    sports.forEach(s => products.push(create("Sports", s.t, s.p, s.op, s.i, s.b)));

    // 8. FOOD
    const food = [
        { t: "Ferrero Rocher Premium Chocolates (24 Pieces)", p: 899, op: 999, b: "Ferrero Rocher", i: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80" },
        { t: "Happilo Premium California Almonds (500g)", p: 449, op: 799, b: "Happilo", i: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=400&q=80" },
        { t: "Nescafe Classic Instant Coffee (200g)", p: 590, op: 650, b: "Nescafe", i: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80" },
        { t: "Tata Tea Gold Premium Tea (1kg)", p: 480, op: 630, b: "Tata", i: "https://images.unsplash.com/photo-1564890369478-c5235089f6c1?auto=format&fit=crop&w=400&q=80" },
        { t: "Maggi 2-Minute Masala Noodles (Pack of 12)", p: 168, op: 180, b: "Maggi", i: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80" },
        { t: "Quaker Oats (1kg)", p: 185, op: 220, b: "Quaker", i: "https://images.unsplash.com/photo-1615485925763-867862f80004?auto=format&fit=crop&w=400&q=80" },
        { t: "Nutella Hazelnut Spread (350g)", p: 375, op: 420, b: "Nutella", i: "https://images.unsplash.com/photo-1631363242095-26372070c792?auto=format&fit=crop&w=400&q=80" }
    ];
    food.forEach(f => products.push(create("Food", f.t, f.p, f.op, f.i, f.b)));

    // 9. KITCHEN
    const kitchen = [
        { t: "Pigeon by Stovekraft Non-Stick Cookware Set", p: 1499, op: 2995, b: "Pigeon", i: "https://images.unsplash.com/photo-1584269613118-117eef27a6b6?auto=format&fit=crop&w=400&q=80" },
        { t: "Prestige Svachh Pressure Cooker (3L)", p: 1890, op: 2300, b: "Prestige", i: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=400&q=80" },
        { t: "Milton Executive Lunch Box", p: 799, op: 1199, b: "Milton", i: "https://images.unsplash.com/photo-1564843944643-4c5757476839?auto=format&fit=crop&w=400&q=80" },
        { t: "Cello Checkers Plastic Container Set (18 Pcs)", p: 999, op: 1999, b: "Cello", i: "https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&w=400&q=80" }, 
        { t: "Wonderchef Nutri-Blend Mixer Grinder", p: 2699, op: 5000, b: "Wonderchef", i: "https://images.unsplash.com/photo-1570222094114-28a9d88a27e6?auto=format&fit=crop&w=400&q=80" },
        { t: "Hawkins Contura Black Pressure Cooker", p: 2100, op: 2450, b: "Hawkins", i: "https://images.unsplash.com/photo-1556910638-6cdac31d44dc?auto=format&fit=crop&w=400&q=80" }
    ];
    kitchen.forEach(k => products.push(create("Kitchen", k.t, k.p, k.op, k.i, k.b)));

    return products;
};

// --- SERVICE FUNCTIONS ---

export const initializeData = async (): Promise<void> => {
    await apiDelay();
    
    // Initialize Products
    if (!localStorage.getItem(PRODUCTS_KEY)) {
        const mockProducts = generateMockProducts();
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
    }

    // Initialize Users (FORCE CREATE ADMIN)
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if default admin exists, if not, add it
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

    // Check if User's specific mobile admin exists
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

    // Initialize Orders
    if (!localStorage.getItem(ORDERS_KEY)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
    
    // Initialize Banners
    if (!localStorage.getItem(BANNERS_KEY)) {
        localStorage.setItem(BANNERS_KEY, JSON.stringify(BANNER_IMAGES));
    }
};

// NEW HELPER: Simulate tracking updates based on time elapsed - 4 Hour Interval Logic
const simulateTracking = (order: Order): Order => {
    if (!order.date) return order;
    if (order.status === 'Cancelled') return order; // Don't simulate if cancelled

    const history: TrackingEvent[] = [];
    const startDate = new Date(order.date);
    const now = new Date();
    
    // 1. Ordered (Immediate) - 0 Hours
    history.push({
        status: 'Ordered',
        date: startDate.toISOString(),
        location: 'Online',
        description: 'Your order has been placed successfully.'
    });

    const elapsedHours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    // 2. Packed (After 4 hours)
    if (elapsedHours >= 4) {
        const packedDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
        history.push({
            status: 'Packed',
            date: packedDate.toISOString(),
            location: 'Seller Warehouse',
            description: 'Order has been packed and is ready for pickup.'
        });
    }

    // 3. Shipped (After 8 hours) - "Dispatch warehouse nikla gya hai"
    if (elapsedHours >= 8) {
        const shippedDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000);
        history.push({
            status: 'Shipped',
            date: shippedDate.toISOString(),
            location: 'Warehouse Dispatch Center',
            description: 'Dispatched from warehouse (Order nikla gya hai).'
        });
    }

    // 4. Out for Delivery (After 12 hours)
    if (elapsedHours >= 12) {
        const outDate = new Date(startDate.getTime() + 12 * 60 * 60 * 1000);
        history.push({
            status: 'Out for Delivery',
            date: outDate.toISOString(),
            location: order.address?.city || 'City Hub',
            description: 'Your order is out for delivery.'
        });
    }

    // 5. Delivered (After 16 hours)
    if (elapsedHours >= 16) {
        const deliveredDate = new Date(startDate.getTime() + 16 * 60 * 60 * 1000);
        history.push({
            status: 'Delivered',
            date: deliveredDate.toISOString(),
            location: order.address?.address || 'Delivery Location',
            description: 'Order has been delivered.'
        });
    }

    const currentStatus = history[history.length - 1].status;
    
    return { ...order, trackingHistory: history.reverse(), status: currentStatus };
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
    // Simulate tracking for all fetched orders
    return orders.map(simulateTracking);
};

// NEW FUNCTION
export const fetchOrderById = async (id: string): Promise<Order | null> => {
    await apiDelay();
    // This uses the updated fetchOrders which already includes simulation
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
        trackingHistory: [{
            status: 'Ordered',
            date: order.date,
            location: 'Online',
            description: 'Your order has been placed successfully.'
        }]
    };

    if (ENABLE_API) {
        try { return await apiRequest<Order>('/orders', 'POST', newOrderWithTracking); } catch (e) {}
    }
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.unshift(newOrderWithTracking); // Add new order to top
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
    
    // HARDCODED BACKDOOR: Always say Admin exists
    if (ADMIN_EMAILS.includes(identifier) || ADMIN_MOBILES.includes(identifier)) {
        return true;
    }

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
    
    // SPECIAL ADMIN AUTHENTICATION (Force Login)
    if (ADMIN_EMAILS.includes(identifier) || ADMIN_MOBILES.includes(identifier)) {
        return {
            id: 'admin-force',
            name: 'Admin',
            email: identifier.includes('@') ? identifier : 'admin@flipkart.com',
            mobile: identifier.includes('@') ? '' : identifier,
            role: UserRole.ADMIN
        };
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
    
    // Mark as custom so it persists
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

export const initiatePayment = async (amount: number, orderId: string, email: string, mobile: string): Promise<{success: boolean, redirectUrl?: string}> => {
    await apiDelay();
    if (ENABLE_API) {
        try {
            return await apiRequest('/payment/initiate', 'POST', { amount, orderId, email, mobile });
        } catch (e) {
            console.error("Payment API Error", e);
        }
    }
    // Mock Success
    return { success: true }; 
}
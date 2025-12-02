
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, User, CartItem, FilterState, Review, Address, Order, Notification } from '../types';
import { 
    fetchProducts, initializeData, createOrder, fetchOrders, updateOrderStatus, 
    saveProduct, deleteProduct, fetchBanners, saveBanners as apiSaveBanners, updateUser 
} from '../services/data';

// Define the shape of the context
interface ShopContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, color?: string) => void;
  removeFromCart: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredProducts: Product[];
  refreshProducts: () => void;
  banners: string[];
  updateBanners: (banners: string[]) => void;
  adminOrders: Order[];
  updateOrder: (id: string, status: any) => void;
  addProduct: (p: Product) => void;
  removeProduct: (id: string) => void;
  userOrders: Order[];
  refreshOrders: () => void;
  updateUserProfile: (user: User) => Promise<void>;
  addReview: (productId: string, review: Review) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  shippingAddress: Address | null;
  saveAddress: (addr: Address) => void;
  checkoutItems: CartItem[];
  prepareCheckout: (items: CartItem[]) => void;
  completeOrder: () => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  notifications: Notification[];
  addNotification: (title: string, desc: string, link: string) => void;
  markAllNotificationsRead: () => void;
}

// Create the context
const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Local Storage Keys
const CART_KEY = 'swiftcart_cart_v1';
const WISHLIST_KEY = 'swiftcart_wishlist_v1';
const CHECKOUT_KEY = 'swiftcart_checkout_v1';
const USER_KEY = 'swiftcart_user_v1'; // Key for persisting user session

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>({ category: null, minPrice: 0, maxPrice: 200000, sortBy: 'relevance', searchQuery: '' });
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial data loading and state hydration from Local Storage
  useEffect(() => {
    // Hydrate synchronous state first
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) setUser(parsedUser);
      } catch (e) { console.error("Failed to parse user from storage", e); }
    }

    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}

    const savedWishlist = localStorage.getItem(WISHLIST_KEY);
    if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}

    const savedCheckout = localStorage.getItem(CHECKOUT_KEY);
    if (savedCheckout) try { setCheckoutItems(JSON.parse(savedCheckout)); } catch (e) {}

    // Load asynchronous data from API
    const load = async () => {
      await initializeData();
      const prods = await fetchProducts();
      setProducts(prods);
      const ban = await fetchBanners();
      setBanners(ban);
      const ords = await fetchOrders();
      setAdminOrders(ords);
    };
    load();
  }, []);

  const refreshProducts = async () => {
    const prods = await fetchProducts();
    setProducts(prods);
  };

  const refreshOrders = async () => {
    const ords = await fetchOrders();
    setAdminOrders(ords);
  };

  // Persist cart and wishlist to Local Storage on change
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }, [wishlist]);

  // Filter logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = filters.category ? p.category === filters.category : true;
    const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
    const query = filters.searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory && matchesPrice;
    const matchesSearch = p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || (p.brand && p.brand.toLowerCase().includes(query)) || p.description.toLowerCase().includes(query);
    return matchesCategory && matchesPrice && matchesSearch;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-low') return a.price - b.price;
    if (filters.sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setWishlist([]);
    setCheckoutItems([]);
    setNotifications([]);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(WISHLIST_KEY);
    localStorage.removeItem(CHECKOUT_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const addToCart = (product: Product, color?: string) => {
    const colorToSave = color || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedColor === colorToSave);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.selectedColor === colorToSave) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedColor: colorToSave }];
    });
  };

  const removeFromCart = (id: string, color?: string) => {
    setCart(prev => prev.filter(item => {
      if (color) return !(item.id === id && item.selectedColor === color);
      return item.id !== id;
    }));
  };

  const updateQuantity = (id: string, qty: number, color?: string) => {
    if (qty < 1) return;
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (color && item.selectedColor !== color) return item;
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const prepareCheckout = (items: CartItem[]) => {
    setCheckoutItems(items);
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(items));
  };

  const completeOrder = () => {
    setCart(prev => prev.filter(cartItem => !checkoutItems.some(bought => bought.id === cartItem.id && bought.selectedColor === cartItem.selectedColor)));
    setCheckoutItems([]);
    localStorage.removeItem(CHECKOUT_KEY);
    refreshOrders();
  };

  const updateBanners = (newBanners: string[]) => {
    apiSaveBanners(newBanners);
    setBanners(newBanners);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
    });
  };

  const addNotification = (title: string, desc: string, link: string) => {
    const newNotif: Notification = { id: Date.now(), title, desc, time: 'Just now', unread: true, link };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const updateOrder = async (id: string, status: any) => {
    await updateOrderStatus(id, status);
    refreshOrders();
  };

  const addProduct = async (p: Product) => {
    await saveProduct(p);
    refreshProducts();
  };

  const removeProduct = async (id: string) => {
    await deleteProduct(id);
    refreshProducts();
  };

  const addReview = async (productId: string, review: Review) => {
    const target = products.find(p => p.id === productId);
    if (target) {
      const currentReviews = target.reviews || [];
      const newReviewsCount = currentReviews.length + 1;
      const totalRating = currentReviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
      const newAverageRating = totalRating / newReviewsCount;
      const updatedProduct = { ...target, reviews: [review, ...currentReviews], reviewsCount: newReviewsCount, rating: parseFloat(newAverageRating.toFixed(1)) };
      await saveProduct(updatedProduct);
      refreshProducts();
    }
  };

  const updateUserProfile = async (updatedUser: User) => {
    const saved = await updateUser(updatedUser);
    setUser(saved);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const saveAddress = (addr: Address) => setShippingAddress(addr);

  const userOrders = user ? adminOrders.filter(o => o.userId === user.id) : [];

  return (
    <ShopContext.Provider value={{
      user, login, logout,
      products, cart, addToCart, removeFromCart, updateQuantity, clearCart,
      filters, setFilters, filteredProducts, refreshProducts,
      banners, updateBanners,
      adminOrders, userOrders, refreshOrders, updateOrder, addProduct, removeProduct, addReview,
      updateUserProfile,
      isLoginModalOpen, openLoginModal, closeLoginModal,
      shippingAddress, saveAddress,
      checkoutItems, prepareCheckout, completeOrder,
      wishlist, toggleWishlist,
      notifications, addNotification, markAllNotificationsRead
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within a ShopProvider");
  return context;
};

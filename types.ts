

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  gender?: 'Male' | 'Female';
}

export interface Address {
  name: string;
  mobile: string;
  pincode: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  addressType?: string;
  alternateMobile?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  isCertified: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  trending: boolean;
  brand?: string;
  colors?: string[];
  isCustom?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 'Ordered' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface TrackingEvent {
  status: OrderStatus;
  date: string;
  location: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  address?: Address;
  paymentMethod?: string;
  trackingHistory?: TrackingEvent[];
  estimatedDelivery?: string;
}

export interface FilterState {
  category: string | null;
  minPrice: number;
  maxPrice: number;
  sortBy: 'relevance' | 'price-low' | 'price-high';
  searchQuery: string;
}

export interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  link: string;
}
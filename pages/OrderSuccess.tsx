

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, MapPin, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';
import { fetchOrderById } from '../services/data';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { userOrders } = useShop(); // Keep this for quick access
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const getOrderDetails = async () => {
        if (!orderId) {
            navigate('/my-orders');
            return;
        }

        // Try getting from context first for speed
        const orderFromContext = userOrders.find(o => o.id === orderId);
        if (orderFromContext) {
            setOrder(orderFromContext);
            setLoading(false);
        } else {
            // Fallback to fetch directly, handles delays
            const fetchedOrder = await fetchOrderById(orderId);
            if (fetchedOrder) {
                setOrder(fetchedOrder);
            }
            setLoading(false);
        }
    };

    getOrderDetails();
  }, [orderId, userOrders, navigate]);

  if (loading) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874f0]"></div>
          </div>
      );
  }

  if (!order) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
              <h1 className="text-xl font-bold">Order Confirmed!</h1>
              <p className="text-slate-500 mt-2">Your order details are being updated. Check "My Orders" shortly.</p>
              <Link to="/my-orders" className="mt-4 bg-[#2874f0] text-white font-bold py-3 px-8 rounded-[2px] text-sm uppercase">Go to My Orders</Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8 px-4">
        <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <div className="bg-white rounded-[4px] shadow-sm border border-slate-200 overflow-hidden mb-6 text-center p-8 relative">
                {/* Decorative confetti circles */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full opacity-50 animate-bounce"></div>
                <div className="absolute bottom-8 right-8 w-4 h-4 bg-blue-400 rounded-full opacity-50 animate-bounce delay-100"></div>
                <div className="absolute top-1/2 right-4 w-2 h-2 bg-green-400 rounded-full opacity-50 animate-pulse"></div>

                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={2.5} />
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Placed Successfully!</h1>
                <p className="text-slate-500 text-sm mb-6">
                    Thank you for your purchase. A confirmation email has been sent to your registered email.
                </p>

                <div className="bg-slate-50 rounded p-4 inline-block border border-slate-100 mb-6">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Order ID</p>
                    <p className="text-lg font-bold text-[#2874f0] tracking-wide">{order.id}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 justify-center">
                    <Link 
                        to={`/track-order/${order.id}`}
                        className="bg-[#2874f0] text-white font-bold py-3 px-8 rounded-[2px] text-sm uppercase shadow-sm hover:bg-blue-600 flex items-center justify-center gap-2 transform transition-transform active:scale-95"
                    >
                        <Package className="w-4 h-4" /> Track Order
                    </Link>
                    <Link 
                        to="/shop" 
                        className="bg-white text-[#2874f0] border border-[#2874f0] font-bold py-3 px-8 rounded-[2px] text-sm uppercase shadow-sm hover:bg-blue-50 flex items-center justify-center gap-2"
                    >
                        Continue Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Delivery Info Card */}
            <div className="bg-white rounded-[4px] shadow-sm border border-slate-200 overflow-hidden p-6">
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#2874f0]" /> Delivery Details
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6 text-sm">
                    <div className="flex-1">
                        <p className="text-slate-500 mb-1 font-medium">Delivery Address</p>
                        <div className="font-bold text-slate-800 mb-1">{order.address?.name}</div>
                        <p className="text-slate-600 leading-relaxed">
                            {order.address?.address}, {order.address?.locality},<br/>
                            {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                        </p>
                        <div className="mt-2 font-medium text-slate-800">
                            Mobile: <span className="font-normal">{order.address?.mobile}</span>
                        </div>
                    </div>
                    
                    <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                        <p className="text-slate-500 mb-1 font-medium">Estimated Delivery</p>
                        <div className="text-lg font-bold text-green-700 mb-2">
                           By {new Date(order.estimatedDelivery || Date.now()).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <p className="text-xs text-slate-400">
                            We will update you via SMS/Email once the package is shipped.
                        </p>
                    </div>
                </div>
                
                {/* Supercoin-like reward */}
                <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-300">
                        <span className="text-yellow-600 font-bold text-xs">SC</span>
                    </div>
                    <div className="text-sm">
                        You earned <span className="font-bold text-slate-800">20 SuperCoins</span> on this order!
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

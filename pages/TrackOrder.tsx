
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Home as HomeIcon, MapPin, Phone } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { fetchOrderById } from '../services/data';

const statusMap: Record<OrderStatus, { icon: React.ElementType, text: string }> = {
    'Ordered': { icon: Package, text: 'Order Confirmed' },
    'Packed': { icon: Package, text: 'Order Packed' },
    'Shipped': { icon: Truck, text: 'Dispatched' },
    'Out for Delivery': { icon: Truck, text: 'Out for Delivery' },
    'Delivered': { icon: HomeIcon, text: 'Delivered' },
    'Cancelled': { icon: Package, text: 'Cancelled' },
};

const getStatusIndex = (status: OrderStatus): number => {
    const order: OrderStatus[] = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    return order.indexOf(status);
};

export const TrackOrder: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getOrder = async () => {
            if (orderId) {
                setLoading(true);
                const fetchedOrder = await fetchOrderById(orderId);
                setOrder(fetchedOrder);
                setLoading(false);
            }
        };
        getOrder();
    }, [orderId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874f0]"></div></div>;
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
                <p className="text-slate-500 mt-2">We couldn't find an order with the ID: {orderId}</p>
                <Link to="/my-orders" className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded shadow-sm">Back to My Orders</Link>
            </div>
        );
    }

    const currentStatusIndex = getStatusIndex(order.status);
    const trackingSteps: OrderStatus[] = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

    return (
        <div className="bg-[#f1f3f6] min-h-screen py-4 md:py-8 px-2 md:px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/my-orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2874f0] mb-4 font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to My Orders
                </Link>

                <div className="bg-white rounded-[4px] shadow-sm border border-slate-200">
                    {/* Header */}
                    <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">Order Details</h1>
                            <div className="text-xs text-slate-500 mt-1">
                                <span className="font-medium text-[#2874f0]">{order.id}</span> • Placed on {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">₹{order.total.toLocaleString('en-IN')}</div>
                            <div className="text-xs text-slate-500">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</div>
                        </div>
                    </div>

                    {/* Tracking Progress Bar */}
                    <div className="p-6 overflow-x-auto">
                        <div className="flex justify-between items-center mb-6 min-w-[300px]">
                            {trackingSteps.map((step, index) => {
                                const isCompleted = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const { icon: Icon } = statusMap[step];

                                return (
                                    <div key={step} className="flex flex-col items-center z-10 relative group">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-green-100 border-green-500' : 'bg-slate-100 border-slate-300'}`}>
                                            <Icon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                                        </div>
                                        <div className={`text-xs mt-2 text-center font-medium ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{statusMap[step].text}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="relative w-[90%] mx-auto h-1 bg-slate-200 -mt-14 mb-14 min-w-[280px]">
                            <div 
                                className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-700 ease-in-out" 
                                style={{ width: `${(currentStatusIndex / (trackingSteps.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Tracking History */}
                    <div className="p-4 md:p-6 border-t border-slate-100 bg-white">
                        <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                             <Package className="w-5 h-5 text-[#2874f0]" /> Tracking History
                        </h2>
                        <div className="space-y-0 relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute top-2 left-[19px] bottom-6 w-0.5 bg-slate-200"></div>

                            {order.trackingHistory?.map((event, index) => {
                                const isLatest = index === 0;
                                return (
                                <div key={index} className="flex gap-4 relative pb-8 last:pb-0">
                                    <div className={`w-10 h-10 flex-shrink-0 z-10`}>
                                         <div className={`w-4 h-4 rounded-full mt-1 border-2 ${isLatest ? 'bg-green-500 border-green-200 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]' : 'bg-slate-400 border-white'}`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                            <p className={`font-bold text-sm ${isLatest ? 'text-slate-900' : 'text-slate-600'}`}>{event.description}</p>
                                            <p className="text-xs text-slate-400 whitespace-nowrap">{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {event.location}
                                        </p>
                                        <p className={`text-xs font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${isLatest ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{event.status}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-slate-800">Delivery Address</h2>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3"/> {order.address?.mobile}</span>
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed">
                            <p className="font-medium text-slate-800">{order.address?.name}</p>
                            <p>{order.address?.address}, {order.address?.locality}</p>
                            <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, ChevronRight, Package, Circle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { color: string, text: string }> = {
    'Ordered': { color: 'bg-blue-500', text: 'Order Placed' },
    'Packed': { color: 'bg-yellow-500', text: 'Packed' },
    'Shipped': { color: 'bg-purple-500', text: 'Shipped' },
    'Out for Delivery': { color: 'bg-orange-500', text: 'Out for Delivery' },
    'Delivered': { color: 'bg-green-500', text: 'Delivered' },
    'Cancelled': { color: 'bg-red-500', text: 'Cancelled' },
};


export const MyOrders: React.FC = () => {
  const { userOrders, user } = useShop();

  if (!user) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
              <div className="text-lg font-medium text-slate-600 mb-4">Please login to view your orders</div>
              <Link to="/" className="bg-[#2874f0] text-white px-6 py-2 rounded font-medium shadow-sm">Go Home</Link>
          </div>
      );
  }

  if (userOrders.length === 0) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white m-4 rounded shadow-sm border border-slate-100">
              <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/myorders-empty_2353c5.png" alt="No Orders" className="w-48 opacity-80 mb-6" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">You have no orders yet</h2>
              <Link to="/shop" className="mt-4 bg-[#2874f0] text-white px-8 py-2.5 rounded-[2px] font-bold uppercase text-sm shadow hover:bg-blue-600">Start Shopping</Link>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-0 md:px-4 py-4 pb-20">
       <div className="flex flex-col lg:flex-row gap-4">
           
           {/* Sidebar (Filters) - Desktop only */}
           <div className="hidden lg:block w-64 bg-white shadow-sm rounded-[2px] h-fit">
               <div className="p-4 border-b border-slate-100">
                   <h3 className="font-bold text-slate-700">Filters</h3>
               </div>
               <div className="p-4 space-y-4">
                   <div>
                       <h4 className="text-sm font-medium text-slate-600 mb-2">Order Status</h4>
                       <div className="space-y-2">
                           {['On the way', 'Delivered', 'Cancelled', 'Returned'].map(status => (
                               <label key={status} className="flex items-center gap-2 cursor-pointer">
                                   <input type="checkbox" className="w-3.5 h-3.5 accent-[#2874f0]" />
                                   <span className="text-sm text-slate-600">{status}</span>
                               </label>
                           ))}
                       </div>
                   </div>
                   <div>
                       <h4 className="text-sm font-medium text-slate-600 mb-2">Order Time</h4>
                       <div className="space-y-2">
                           {['Last 30 days', '2024', '2023'].map(time => (
                               <label key={time} className="flex items-center gap-2 cursor-pointer">
                                   <input type="checkbox" className="w-3.5 h-3.5 accent-[#2874f0]" />
                                   <span className="text-sm text-slate-600">{time}</span>
                               </label>
                           ))}
                       </div>
                   </div>
               </div>
           </div>

           {/* Main Order List */}
           <div className="flex-1">
               {/* Search Bar */}
               <div className="bg-white p-3 md:p-4 shadow-sm rounded-[2px] mb-4 flex gap-2 border border-slate-100">
                   <div className="flex-1 relative">
                       <input 
                         type="text" 
                         placeholder="Search your orders here" 
                         className="w-full border border-slate-300 rounded-[2px] pl-3 pr-10 py-2 text-sm focus:border-[#2874f0] outline-none"
                       />
                       <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   </div>
                   <button className="bg-[#2874f0] text-white px-6 py-2 rounded-[2px] text-sm font-bold uppercase hidden md:block">Search Orders</button>
               </div>

               {/* Orders List */}
               <div className="space-y-3 md:space-y-4">
                   {userOrders.map(order => {
                       const currentStatusInfo = statusConfig[order.status] || statusConfig['Ordered'];

                       return (
                       <Link to={`/track-order/${order.id}`} key={order.id} className="block bg-white shadow-sm rounded-[2px] border border-slate-100 hover:shadow-md transition-shadow group">
                           {order.items.map((item, index) => (
                               <div key={`${order.id}-${index}`} className={`p-3 md:p-4 flex flex-row items-start gap-4 md:gap-8 relative ${index > 0 ? 'border-t border-slate-50' : ''}`}>
                                   
                                   {/* Image */}
                                   <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative">
                                       <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                       {item.quantity > 1 && (
                                           <span className="absolute bottom-0 right-0 bg-slate-100 text-slate-600 text-[10px] px-1 rounded border border-slate-200 font-bold">x{item.quantity}</span>
                                       )}
                                   </div>

                                   {/* Details */}
                                   <div className="flex-1 min-w-0">
                                       <h3 className="font-medium text-sm md:text-base text-slate-900 truncate group-hover:text-[#2874f0] transition-colors mb-1">{item.title}</h3>
                                       <div className="text-xs text-slate-500 mb-2">{item.selectedColor ? `Color: ${item.selectedColor}` : item.category}</div>
                                       <div className="font-bold text-sm text-slate-800 hidden md:block">₹{item.price.toLocaleString('en-IN')}</div>
                                   </div>

                                   {/* Status / Price (Mobile) */}
                                   <div className="flex flex-col items-end md:w-64 gap-1 md:gap-2">
                                       <div className="md:hidden font-bold text-sm mb-2">₹{item.price.toLocaleString('en-IN')}</div>
                                       
                                       <div className="flex items-center gap-2">
                                           <div className={`w-2.5 h-2.5 rounded-full ${currentStatusInfo.color}`}></div>
                                           <span className="text-sm font-medium text-slate-800">
                                               {order.status === 'Delivered' ? `Delivered on ${new Date(order.trackingHistory?.[0].date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : `Est. by ${new Date(order.estimatedDelivery || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                           </span>
                                       </div>
                                       <div className="text-xs text-slate-500">
                                            {order.status === 'Delivered' ? 'Your item has been delivered' : `Status: ${currentStatusInfo.text}`}
                                       </div>
                                       
                                       {/* Rating (If delivered) */}
                                       {order.status === 'Delivered' && (
                                           <div className="flex items-center gap-2 mt-1 text-[#2874f0] text-xs font-medium hover:underline cursor-pointer">
                                               <span className="text-blue-500">★</span> Rate & Review Product
                                           </div>
                                       )}
                                   </div>
                               </div>
                           ))}
                           
                           {/* Order Footer (Total) */}
                           <div className="p-3 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-sm">
                               <div>
                                  <span className="text-slate-500 mr-2">Order Total:</span>
                                  <span className="font-bold text-slate-900">₹{order.total.toLocaleString('en-IN')}</span>
                               </div>
                               <div className="flex items-center gap-1 text-[#2874f0] font-medium text-xs group-hover:underline">
                                    Track Order <ChevronRight className="w-3 h-3" />
                               </div>
                           </div>
                       </Link>
                   );
                })}
               </div>
           </div>
       </div>
    </div>
  );
};
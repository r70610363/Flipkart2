
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ArrowLeft, ShieldCheck, MapPin } from 'lucide-react';

export const OrderSummary: React.FC = () => {
  const { checkoutItems, shippingAddress, user } = useShop();
  const navigate = useNavigate();

  // Validate flow
  useEffect(() => {
      if (!shippingAddress || checkoutItems.length === 0) {
          navigate('/cart');
      }
  }, [shippingAddress, checkoutItems, navigate]);

  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = checkoutItems.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);
  const totalMRP = subtotal + discount;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleContinue = () => {
      navigate('/payment');
  };

  const handleChangeAddress = () => {
      navigate('/checkout');
  };

  if (!shippingAddress) return null;

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-24 md:pb-8 page-animate">
        <div className="container mx-auto px-0 md:px-4 pt-0 md:pt-4 max-w-[1100px]">
            
            {/* Header Mobile */}
            <div className="bg-[#2874f0] p-4 text-white md:hidden flex items-center gap-3 sticky top-0 z-20 shadow-md">
                <button onClick={() => navigate('/checkout')}><ArrowLeft className="w-6 h-6" /></button>
                <span className="font-medium text-lg">Order Summary</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-0 md:mt-4">
                
                {/* Left: Summary Details */}
                <div className="flex-1">
                    {/* Steps (Desktop) */}
                    <div className="bg-white shadow-sm mb-4 hidden md:flex rounded-[2px] overflow-hidden text-sm">
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">1</span> Login <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">2</span> Address <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1 p-3 border-r border-slate-200 bg-[#2874f0] text-white font-medium flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <span className="bg-white text-[#2874f0] w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">3</span> Order Summary
                        </div>
                        <div className="flex-1 p-3 text-slate-400 font-medium flex items-center gap-2 bg-white">
                            <span className="bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">4</span> Payment
                        </div>
                    </div>

                    {/* Address Preview */}
                    <div className="bg-white shadow-sm rounded-[2px] mb-4 border border-slate-100">
                        <div className="p-4 flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-slate-800 text-sm uppercase">Deliver to:</h3>
                                    <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{shippingAddress.addressType || 'Home'}</span>
                                </div>
                                <p className="font-bold text-slate-900 text-sm mb-1">{shippingAddress.name}</p>
                                <p className="text-sm text-slate-600 leading-relaxed mb-1">
                                    {shippingAddress.address}, {shippingAddress.locality}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                                </p>
                                <p className="text-sm text-slate-600 font-medium">{shippingAddress.mobile}</p>
                            </div>
                            <button onClick={handleChangeAddress} className="text-[#2874f0] border border-slate-200 px-4 py-2 rounded-[2px] text-xs font-bold uppercase hover:bg-blue-50 shadow-sm">
                                Change
                            </button>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white shadow-sm rounded-[2px] border border-slate-100 overflow-hidden">
                        <div className="p-3 bg-[#2874f0] text-white font-medium text-sm uppercase tracking-wide md:hidden">
                            Order Summary
                        </div>
                        <div className="divide-y divide-slate-100">
                            {checkoutItems.map(item => (
                                <div key={`${item.id}-${item.selectedColor}`} className="p-4 flex gap-4">
                                    <div className="w-20 h-20 flex-shrink-0 relative border border-slate-100 rounded p-1">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                        <span className="absolute bottom-0 right-0 bg-slate-100 text-slate-500 text-[10px] px-1.5 rounded-tl border border-slate-200">x{item.quantity}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-900 text-sm md:text-base line-clamp-2 mb-1">{item.title}</h3>
                                        <div className="text-xs text-slate-500 mb-2">
                                            {item.category} {item.selectedColor && `• ${item.selectedColor}`}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-base text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                                            {item.originalPrice > item.price && (
                                                <>
                                                    <span className="text-xs text-slate-400 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                                                    <span className="text-xs text-green-600 font-bold">{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500">
                                            Seller: RetailNet <span className="text-[#2874f0] font-medium ml-1">Open Box Delivery eligible</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Email Note */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                            <span className="font-bold">Note:</span> Order confirmation email will be sent to <span className="font-bold text-slate-800">{user?.email || user?.mobile || 'your registered contact'}</span>
                        </div>

                        {/* Desktop Continue Button */}
                        <div className="p-4 border-t border-slate-100 bg-white hidden md:flex justify-end">
                            <button 
                                onClick={handleContinue}
                                className="bg-[#fb641b] text-white font-bold py-3.5 px-16 rounded-[2px] shadow-sm uppercase text-sm hover:bg-[#e85d19]"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Price Summary */}
                <div className="lg:w-1/3 w-full">
                   <div className="bg-white shadow-sm border border-slate-100 sticky top-24 rounded-[2px] overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                         <h2 className="text-slate-500 font-bold uppercase text-sm">Price Details</h2>
                      </div>
                      <div className="p-4 space-y-4 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-800">Price ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                            <span className="text-slate-800">₹{totalMRP.toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-800">Discount</span>
                            <span className="text-green-600">- ₹{discount.toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-800">Delivery Charges</span>
                            <span className="text-green-600">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                         </div>
                         <div className="flex justify-between border-t border-dashed border-slate-200 pt-4 text-lg font-bold">
                            <span className="text-slate-900">Total Amount</span>
                            <span className="text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                         </div>
                         <div className="text-green-600 font-medium pt-2 text-xs border-t border-slate-100 mt-2 pt-3">
                            You will save ₹{discount.toLocaleString('en-IN')} on this order
                         </div>
                      </div>
                      
                      <div className="p-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 bg-slate-50">
                         <ShieldCheck className="w-8 h-8 text-slate-400" />
                         Safe and Secure Payments. Easy returns.
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* Mobile Sticky Continue Button */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-lg font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
               <div className="text-xs text-[#2874f0] font-medium">View Price Details</div>
            </div>
            <button 
                onClick={handleContinue}
                className="bg-[#fb641b] text-white font-bold py-3 px-10 rounded-[2px] shadow-sm uppercase text-sm"
            >
                Continue
            </button>
        </div>
    </div>
  );
};

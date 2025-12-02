

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ArrowLeft, CheckCircle, ShieldCheck, MapPin, Home, Briefcase } from 'lucide-react';

// Helper for Input Field - DEFINED OUTSIDE COMPONENT TO PREVENT RE-RENDER FOCUS LOSS
const InputField = ({ label, value, onChange, type = "text", maxLength, required = false, className = "" }: any) => (
    <div className={`relative ${className}`}>
        <input 
            type={type} 
            required={required}
            maxLength={maxLength}
            className="peer w-full border border-gray-300 rounded-[2px] px-4 py-3.5 focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] outline-none placeholder-transparent text-base text-slate-900 bg-white transition-all"
            placeholder={label}
            value={value}
            onChange={onChange}
        />
        <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all 
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-medium pointer-events-none">
            {label}
        </label>
    </div>
);

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const CheckoutAddress: React.FC = () => {
  const { checkoutItems, user, saveAddress, shippingAddress, openLoginModal } = useShop();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    alternateMobile: '',
    addressType: 'Home' // Home or Work
  });

  const [error, setError] = useState('');

  // Populate from saved address if available or user data
  useEffect(() => {
    if (!user) {
        // Guest checkout logic (optional)
    }
    if (shippingAddress) {
        setFormData({
            ...shippingAddress,
            landmark: shippingAddress.landmark || '',
            alternateMobile: '',
            addressType: 'Home'
        });
    } else if (user && user.email && /^\d+$/.test(user.email)) {
        // If logged in with mobile, prefill
        setFormData(prev => ({ ...prev, mobile: user.email }));
    }
  }, [user, shippingAddress]);

  // Validation Effect for Empty Checkout
  useEffect(() => {
      // Check Context first
      if (checkoutItems.length === 0) {
          // Double Check Local Storage (Race condition Fix)
          const savedCheckout = localStorage.getItem('swiftcart_checkout_v1');
          if (!savedCheckout || JSON.parse(savedCheckout).length === 0) {
              navigate('/cart');
          }
      }
  }, [checkoutItems, navigate]);

  // USE CHECKOUT ITEMS INSTEAD OF CART
  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = checkoutItems.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);
  const totalMRP = subtotal + discount;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) return "Enter a valid 10-digit mobile number";
    if (!/^\d{6}$/.test(formData.pincode)) return "Enter a valid 6-digit Pincode";
    if (!formData.locality.trim()) return "Locality is required";
    if (!formData.address.trim()) return "Address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    return null;
  };

  const handleSaveAndDeliver = () => {
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        window.scrollTo(0, 0);
        return;
    }

    saveAddress(formData);
    // Navigate to Order Summary instead of Payment
    navigate('/order-summary');
  };

  const handleUseCurrentLocation = () => {
      // Mock Geolocation fill
      setFormData(prev => ({
          ...prev,
          pincode: '560103',
          city: 'Bengaluru',
          state: 'Karnataka',
          locality: 'Embassy Tech Village'
      }));
  };

  // If no items selected for checkout (and double checked via effect), return null while redirecting
  if (checkoutItems.length === 0) {
      // Allow render for a split second while Effect redirects, to avoid flicker loop
      const savedCheckout = localStorage.getItem('swiftcart_checkout_v1');
      if (!savedCheckout || JSON.parse(savedCheckout).length === 0) {
          return null;
      }
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-24 md:pb-8 page-animate">
        <div className="container mx-auto px-0 md:px-4 pt-0 md:pt-4 max-w-[1100px]">
            
            {/* Header Mobile */}
            <div className="bg-[#2874f0] p-4 text-white md:hidden flex items-center gap-3 sticky top-0 z-20 shadow-md">
                <button onClick={() => navigate('/cart')}><ArrowLeft className="w-6 h-6" /></button>
                <span className="font-medium text-lg">Add Delivery Address</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-0 md:mt-4">
                
                {/* Left: Address Form */}
                <div className="flex-1">
                    {/* Steps Indicator (Desktop) */}
                    <div className="bg-white shadow-sm mb-4 hidden md:flex rounded-[2px] overflow-hidden text-sm">
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">1</span> Login <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1 p-3 border-r border-slate-200 bg-[#2874f0] text-white font-medium flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <span className="bg-white text-[#2874f0] w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">2</span> Delivery Address
                        </div>
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-white">
                            <span className="bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">3</span> Order Summary
                        </div>
                        <div className="flex-1 p-3 text-slate-400 font-medium flex items-center gap-2 bg-white">
                            <span className="bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">4</span> Payment
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-[2px] overflow-hidden">
                        <div className="p-4 bg-[#2874f0] md:bg-white md:border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-white md:text-[#2874f0] font-bold uppercase text-sm">Add a new address</h2>
                            <button 
                                onClick={handleUseCurrentLocation}
                                className="bg-white md:bg-[#2874f0] text-[#2874f0] md:text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1 hover:opacity-90 transition-opacity"
                            >
                                <MapPin className="w-3 h-3" /> Use my current location
                            </button>
                        </div>
                        
                        <div className="p-4 md:p-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm mb-6 flex items-start gap-2">
                                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <InputField 
                                    label="Name" 
                                    required 
                                    value={formData.name}
                                    onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                                />

                                <InputField 
                                    label="10-digit mobile number" 
                                    type="tel"
                                    required
                                    maxLength={10}
                                    value={formData.mobile}
                                    onChange={(e: any) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                                />

                                <InputField 
                                    label="Pincode" 
                                    required 
                                    maxLength={6}
                                    value={formData.pincode}
                                    onChange={(e: any) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                                />

                                <InputField 
                                    label="Locality" 
                                    required 
                                    value={formData.locality}
                                    onChange={(e: any) => setFormData({...formData, locality: e.target.value})}
                                />

                                <div className="relative md:col-span-2">
                                    <textarea 
                                        required
                                        rows={3}
                                        className="peer w-full border border-gray-300 rounded-[2px] px-4 py-3.5 focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] outline-none placeholder-transparent text-base text-slate-900 bg-white resize-none transition-all"
                                        placeholder="Address (Area and Street)"
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                    />
                                    <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all 
                                        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 
                                        peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-medium pointer-events-none">
                                        Address (Area and Street)
                                    </label>
                                </div>

                                <InputField 
                                    label="City/District/Town" 
                                    required 
                                    value={formData.city}
                                    onChange={(e: any) => setFormData({...formData, city: e.target.value})}
                                />

                                <div className="relative">
                                    <select 
                                        required
                                        className="peer w-full border border-gray-300 rounded-[2px] px-4 py-3.5 focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] outline-none text-base text-slate-900 bg-white appearance-none"
                                        value={formData.state}
                                        onChange={e => setFormData({...formData, state: e.target.value})}
                                    >
                                        <option value="" disabled hidden></option>
                                        {INDIAN_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    <label className={`absolute left-3 bg-white px-1 text-gray-500 transition-all pointer-events-none ${formData.state ? '-top-2.5 text-xs text-[#2874f0]' : 'top-3.5 text-sm text-gray-400'}`}>State</label>
                                </div>

                                <InputField 
                                    label="Landmark (Optional)" 
                                    value={formData.landmark}
                                    onChange={(e: any) => setFormData({...formData, landmark: e.target.value})}
                                />

                                <InputField 
                                    label="Alternate Phone (Optional)" 
                                    type="tel"
                                    maxLength={10}
                                    value={formData.alternateMobile}
                                    onChange={(e: any) => setFormData({...formData, alternateMobile: e.target.value.replace(/\D/g, '')})}
                                />
                            </form>

                            <div className="mt-6">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-3">Address Type</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="addressType" 
                                            className="w-4 h-4 accent-[#2874f0]"
                                            checked={formData.addressType === 'Home'} 
                                            onChange={() => setFormData({...formData, addressType: 'Home'})} 
                                        />
                                        <span className="text-sm font-medium text-slate-700">Home (All day delivery)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="addressType" 
                                            className="w-4 h-4 accent-[#2874f0]"
                                            checked={formData.addressType === 'Work'} 
                                            onChange={() => setFormData({...formData, addressType: 'Work'})} 
                                        />
                                        <span className="text-sm font-medium text-slate-700">Work (Delivery between 10 AM - 5 PM)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 hidden md:flex gap-4">
                                <button 
                                    onClick={handleSaveAndDeliver}
                                    className="bg-[#fb641b] text-white font-bold py-3.5 px-12 rounded-[2px] shadow-sm uppercase text-sm hover:bg-[#e85d19] transition-colors"
                                >
                                    Save and Deliver Here
                                </button>
                                <button 
                                    onClick={() => navigate('/cart')}
                                    className="text-[#2874f0] font-bold uppercase text-sm hover:underline px-4"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary (Desktop) */}
                <div className="lg:w-1/3 w-full hidden md:block">
                   <div className="bg-white shadow-sm border border-slate-100 sticky top-24 rounded-[2px] overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                         <h2 className="text-slate-500 font-bold uppercase text-sm">Price Details</h2>
                      </div>
                      <div className="p-4 space-y-4 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-800">Price ({checkoutItems.length} items)</span>
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
                      </div>
                      
                      <div className="p-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 bg-slate-50">
                         <ShieldCheck className="w-8 h-8 text-slate-400" />
                         Safe and Secure Payments. Easy returns.
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* Mobile Sticky Button */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
            <button 
                onClick={handleSaveAndDeliver}
                className="w-full bg-[#fb641b] text-white font-bold py-3 rounded-[2px] shadow-sm uppercase text-sm"
            >
                Save and Deliver Here
            </button>
        </div>
    </div>
  );
};
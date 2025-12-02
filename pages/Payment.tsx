

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { createOrder, initiatePayment } from '../services/data';
import { ShieldCheck, ArrowLeft, AlertCircle, TestTube } from 'lucide-react';
import { Address, OrderStatus } from '../types';

export const Payment: React.FC = () => {
  const { checkoutItems, user, shippingAddress, completeOrder, addNotification } = useShop();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('upi'); // Default to UPI
  const [upiApp, setUpiApp] = useState('phonepe'); // Default UPI App
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref to track if payment successfully finished to prevent redirect race condition
  const isPaymentCompleted = useRef(false);

  // Validate flow
  useEffect(() => {
      // If we just paid, don't redirect to cart even if items are cleared
      if (isPaymentCompleted.current) return;

      if (!shippingAddress || checkoutItems.length === 0) {
          navigate('/cart');
      }
  }, [shippingAddress, checkoutItems, navigate]);

  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = checkoutItems.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handlePay = async () => {
    setIsProcessing(true);

    try {
        // 1. Create a pending order locally first
        const orderId = `ORD-${Date.now()}`;
        const newOrder = {
            id: orderId,
            userId: user?.id || 'guest',
            items: [...checkoutItems],
            total: total,
            status: 'Ordered' as OrderStatus,
            date: new Date().toISOString(),
            address: shippingAddress as Address,
            paymentMethod: paymentMethod === 'upi' ? `UPI - ${upiApp}` : 'Card/NetBanking'
        };

        // 2. Call Backend to initiate Paytm/Gateway Transaction
        const paymentResponse = await initiatePayment(total, orderId, user?.email || '', user?.name || '');

        if (paymentResponse.success) {
            // Mark as completed so useEffect doesn't redirect to cart when we clear items
            isPaymentCompleted.current = true;

            // Save pending order and Redirect user to Backend/Gateway
            await createOrder(newOrder);
            completeOrder(); // Clear cart items
            
            // Trigger Notification
            addNotification("Order Placed Successfully", `Your order ${orderId} has been confirmed.`, `/my-orders`);

            if (paymentResponse.redirectUrl && paymentResponse.redirectUrl.startsWith('http')) {
                 // Actual Redirect to Payment Gateway
                 window.location.href = paymentResponse.redirectUrl;
            } else {
                 // Fallback / Simulation Redirect
                 navigate(`/order-success/${orderId}`);
            }
        } else {
            // Fallback Simulation (If backend is offline or mock mode)
            // This block runs for TESTING
            isPaymentCompleted.current = true;
            
            setTimeout(() => {
                createOrder({ ...newOrder, status: 'Ordered' });
                completeOrder();
                addNotification("Order Placed Successfully", `Your order ${orderId} has been confirmed.`, `/my-orders`);
                navigate(`/order-success/${orderId}`);
            }, 2000);
        }

    } catch (error) {
        console.error("Payment Init Error", error);
        alert("Payment failed to initialize. Please try again.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-20 md:pb-8 font-sans page-animate">
        <div className="container mx-auto px-0 md:px-4 pt-2 md:pt-6 max-w-[1100px]">
            
            {/* Header Mobile */}
             <div className="bg-[#2874f0] p-4 text-white md:hidden flex items-center gap-3 sticky top-0 z-10 shadow-md">
                <button onClick={() => navigate('/order-summary')}><ArrowLeft className="w-6 h-6" /></button>
                <span className="font-medium text-lg">Payments</span>
            </div>

            {/* TEST MODE BANNER */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 mx-2 md:mx-0 rounded-r shadow-sm flex items-start gap-3">
                <TestTube className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="text-sm font-bold text-yellow-700">Test Mode Active</h3>
                    <p className="text-xs text-yellow-600">No real money will be deducted. Click Pay to simulate a successful order.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-2 md:mt-4">
                 
                 {/* Left: Payment Options */}
                 <div className="flex-1">
                    
                    {/* Steps (Desktop) */}
                    <div className="bg-white shadow-sm mb-4 hidden md:flex rounded-[2px] overflow-hidden text-sm">
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">1</span> Login <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">2</span> Address <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                         <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">3</span> Order Summary <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1 p-3 bg-[#2874f0] text-white font-medium flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <span className="bg-white text-[#2874f0] w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">4</span> Payment
                        </div>
                    </div>

                    {/* Payment Methods List */}
                    <div className="bg-white shadow-sm rounded-[2px] overflow-hidden border border-slate-100">
                        <div className="p-3 bg-[#2874f0] text-white font-medium text-sm uppercase tracking-wide flex justify-between items-center">
                            <span>Payment Options</span>
                        </div>

                        {/* 1. UPI Options */}
                        <div className={`border-b border-slate-100 transition-colors ${paymentMethod === 'upi' ? 'bg-blue-50/20' : 'bg-white'}`}>
                            <label className="flex items-start gap-4 p-4 cursor-pointer">
                                <input type="radio" name="pm" className="mt-1 w-4 h-4 accent-[#2874f0]" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                                <div className="flex-1">
                                    <span className="font-medium text-slate-800">UPI</span>
                                    {paymentMethod === 'upi' && (
                                        <div className="mt-4 space-y-3">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Choose an App</p>
                                            
                                            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded bg-white cursor-pointer hover:border-slate-300">
                                                <input type="radio" name="upi_app" className="accent-[#2874f0]" checked={upiApp === 'phonepe'} onChange={() => setUpiApp('phonepe')} />
                                                <img src="https://img.icons8.com/color/48/phone-pe.png" className="w-6 h-6" alt="PhonePe"/>
                                                <span className="text-sm font-medium text-slate-700">PhonePe</span>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded bg-white cursor-pointer hover:border-slate-300">
                                                <input type="radio" name="upi_app" className="accent-[#2874f0]" checked={upiApp === 'gpay'} onChange={() => setUpiApp('gpay')} />
                                                <img src="https://img.icons8.com/color/48/google-logo.png" className="w-6 h-6" alt="GPay"/>
                                                <span className="text-sm font-medium text-slate-700">Google Pay</span>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded bg-white cursor-pointer hover:border-slate-300">
                                                <input type="radio" name="upi_app" className="accent-[#2874f0]" checked={upiApp === 'paytm'} onChange={() => setUpiApp('paytm')} />
                                                <img src="https://img.icons8.com/color/48/paytm.png" className="w-6 h-6" alt="Paytm"/>
                                                <span className="text-sm font-medium text-slate-700">Paytm UPI</span>
                                            </label>

                                            <div className="pt-2">
                                                <button 
                                                    onClick={handlePay}
                                                    disabled={isProcessing}
                                                    className="bg-[#fb641b] text-white font-bold py-3 px-10 rounded-[2px] text-sm uppercase shadow-sm hover:bg-[#e85d19] transition-colors w-full md:w-auto"
                                                >
                                                    {isProcessing ? 'Processing...' : `PAY ₹${total.toLocaleString('en-IN')}`}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* 2. Wallets / Postpaid */}
                        <div className={`border-b border-slate-100 transition-colors ${paymentMethod === 'wallet' ? 'bg-blue-50/20' : 'bg-white'}`}>
                            <label className="flex items-start gap-4 p-4 cursor-pointer">
                                <input type="radio" name="pm" className="mt-1 w-4 h-4 accent-[#2874f0]" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                                <div className="flex-1">
                                    <span className="font-medium text-slate-800">Wallets / Postpaid</span>
                                    <div className="flex gap-2 mt-1 opacity-60">
                                        <img src="https://img.icons8.com/color/48/paytm.png" className="h-4 object-contain" alt=""/>
                                        <img src="https://img.icons8.com/color/48/amazon-pay.png" className="h-4 object-contain" alt=""/>
                                    </div>
                                    {paymentMethod === 'wallet' && (
                                        <div className="mt-3">
                                            <button onClick={handlePay} className="bg-[#fb641b] text-white font-bold py-3 px-8 rounded-[2px] text-sm uppercase">
                                                Continue
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* 3. Credit / Debit / ATM Card */}
                        <div className={`border-b border-slate-100 transition-colors ${paymentMethod === 'card' ? 'bg-blue-50/20' : 'bg-white'}`}>
                            <label className="flex items-start gap-4 p-4 cursor-pointer">
                                <input type="radio" name="pm" className="mt-1 w-4 h-4 accent-[#2874f0]" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                <div className="flex-1">
                                    <span className="font-medium text-slate-800">Credit / Debit / ATM Card</span>
                                    <p className="text-xs text-slate-500 mt-0.5">Add and secure your card as per RBI guidelines</p>
                                    {paymentMethod === 'card' && (
                                        <div className="mt-4 bg-white p-4 border border-slate-200 rounded max-w-md">
                                            <input type="text" placeholder="Enter Card Number" className="w-full p-3 border border-slate-300 rounded-[2px] text-sm mb-3 focus:border-[#2874f0] outline-none" />
                                            <div className="flex gap-3">
                                                <input type="text" placeholder="Valid Thru (MM/YY)" className="flex-1 p-3 border border-slate-300 rounded-[2px] text-sm focus:border-[#2874f0] outline-none" />
                                                <input type="text" placeholder="CVV" className="w-24 p-3 border border-slate-300 rounded-[2px] text-sm focus:border-[#2874f0] outline-none" />
                                            </div>
                                            <button onClick={handlePay} className="bg-[#fb641b] text-white font-bold py-3 px-10 rounded-[2px] text-sm uppercase mt-4">
                                                PAY ₹{total.toLocaleString('en-IN')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* 4. Net Banking */}
                        <div className={`border-b border-slate-100 transition-colors ${paymentMethod === 'netbanking' ? 'bg-blue-50/20' : 'bg-white'}`}>
                            <label className="flex items-start gap-4 p-4 cursor-pointer">
                                <input type="radio" name="pm" className="mt-1 w-4 h-4 accent-[#2874f0]" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} />
                                <div className="flex-1">
                                    <span className="font-medium text-slate-800">Net Banking</span>
                                    <p className="text-xs text-slate-500 mt-0.5">All Indian banks supported</p>
                                    {paymentMethod === 'netbanking' && (
                                        <div className="mt-3">
                                            <select className="p-2 border border-slate-300 rounded text-sm w-full max-w-xs mb-3">
                                                <option>HDFC Bank</option>
                                                <option>ICICI Bank</option>
                                                <option>State Bank of India</option>
                                                <option>Axis Bank</option>
                                            </select>
                                            <button onClick={handlePay} className="bg-[#fb641b] text-white font-bold py-3 px-8 rounded-[2px] text-sm uppercase block">
                                                Pay Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* 5. Cash on Delivery (Disabled) */}
                        <div className="bg-slate-50 opacity-70 cursor-not-allowed">
                            <div className="flex items-start gap-4 p-4">
                                <input type="radio" disabled className="mt-1 w-4 h-4 accent-slate-400" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-500">Cash on Delivery</span>
                                        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Unavailable</span>
                                    </div>
                                    <div className="flex items-start gap-2 mt-2 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 inline-block">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Due to high demand, Cash on Delivery is not available for this order. Please use Online Payment.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 bg-slate-50">
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
                        </div>
                    </div>
                 </div>

                 {/* Right: Summary */}
                <div className="lg:w-1/3 w-full hidden md:block">
                   <div className="bg-white shadow-sm border border-slate-100 sticky top-20 rounded-[2px] overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                         <h2 className="text-slate-500 font-bold uppercase text-sm">Price Details</h2>
                      </div>
                      <div className="p-4 space-y-4 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-800">Price ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                            <span className="text-slate-800">₹{(subtotal + discount).toLocaleString('en-IN')}</span>
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
                         <div className="text-green-600 font-medium pt-2 text-xs">
                            You will save ₹{discount.toLocaleString('en-IN')} on this order
                         </div>
                      </div>
                      
                      <div className="p-4 border-t border-slate-100">
                         <div className="flex items-center gap-3 mb-2">
                            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_5f9216.png" className="h-8" alt="Secure" />
                            <p className="text-xs text-slate-500 leading-tight">Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
                         </div>
                      </div>
                   </div>
                </div>
            </div>
        </div>
    </div>
  );
};
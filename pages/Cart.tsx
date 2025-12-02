
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash, Plus, Minus, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, user, openLoginModal, prepareCheckout } = useShop();
  const navigate = useNavigate();
  
  // Selection State: Stores unique keys "id-color"
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Select all by default when cart loads
  useEffect(() => {
      const allKeys = new Set(cart.map(item => `${item.id}-${item.selectedColor || 'default'}`));
      setSelectedKeys(allKeys);
  }, [cart.length]); // Re-run only when item count changes (added/removed)

  const toggleSelect = (id: string, color?: string) => {
      const key = `${id}-${color || 'default'}`;
      const newSet = new Set(selectedKeys);
      if (newSet.has(key)) {
          newSet.delete(key);
      } else {
          newSet.add(key);
      }
      setSelectedKeys(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedKeys.size === cart.length) {
          setSelectedKeys(new Set()); // Deselect all
      } else {
          const allKeys = new Set(cart.map(item => `${item.id}-${item.selectedColor || 'default'}`));
          setSelectedKeys(allKeys);
      }
  };

  // Filter items based on selection
  const selectedItems = cart.filter(item => 
      selectedKeys.has(`${item.id}-${item.selectedColor || 'default'}`)
  );

  const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = selectedItems.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);
  const totalMRP = subtotal + discount;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
        alert("Please select at least one item to checkout.");
        return;
    }

    // Save selected items to checkout context
    prepareCheckout(selectedItems);

    if (!user) {
      openLoginModal();
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-white shadow-sm my-4 mx-auto container max-w-5xl">
        <img src="https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png" alt="Empty Cart" className="w-48 md:w-64 mb-6 opacity-80" />
        <h2 className="text-lg font-medium text-slate-900 mb-2">Your cart is empty!</h2>
        <p className="text-slate-500 mb-6 text-sm">Add items to it now.</p>
        <Link to="/shop" className="bg-[#2874f0] text-white px-16 py-2.5 rounded-[2px] font-medium hover:bg-blue-700 shadow-sm">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 md:px-4 py-0 md:py-4 pb-24 md:pb-4">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#2874f0] text-white p-3 flex items-center gap-3 sticky top-0 z-20">
          <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-medium">My Cart ({cart.length})</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start mt-2 md:mt-0">
        
        {/* Left Column */}
        <div className="lg:w-2/3 w-full flex flex-col gap-2 md:gap-4">
           
           {/* Select All Header */}
           <div className="bg-white p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                <input 
                    type="checkbox" 
                    checked={selectedKeys.size === cart.length && cart.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 accent-[#2874f0] cursor-pointer"
                />
                <span className="text-slate-700 font-medium text-sm">
                    Select All ({cart.length} items)
                </span>
           </div>

           {/* Cart Items */}
           <div className="bg-white shadow-sm border border-slate-100">
                {cart.map(item => {
                  const uniqueKey = `${item.id}-${item.selectedColor || 'default'}`;
                  const isSelected = selectedKeys.has(uniqueKey);

                  return (
                  <div key={uniqueKey} className={`flex flex-col md:flex-row gap-4 p-4 md:p-6 border-b border-slate-100 last:border-0 relative transition-colors ${!isSelected ? 'bg-slate-50/50 opacity-80' : ''}`}>
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-2 md:static md:flex md:items-start pt-1">
                        <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id, item.selectedColor)}
                            className="w-5 h-5 accent-[#2874f0] cursor-pointer z-10"
                        />
                    </div>

                    <div className="flex gap-4 pl-6 md:pl-0">
                        <Link to={`/product/${item.id}`} className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 relative cursor-pointer">
                           <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                        </Link>
                        
                        <div className="flex-1">
                          <Link to={`/product/${item.id}`} className="font-medium text-sm md:text-base text-slate-900 hover:text-[#2874f0] block mb-1 line-clamp-2">
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                             <span>{item.category}</span>
                             {item.selectedColor && (
                                <>
                                    <span>•</span>
                                    <span className="font-medium text-slate-700">Color: {item.selectedColor}</span>
                                </>
                             )}
                          </div>
                          
                          <div className="flex items-baseline gap-2 mb-2">
                             <span className="text-base md:text-lg font-bold text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                             <span className="text-xs md:text-sm text-slate-400 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                             <span className="text-xs text-green-600 font-bold">{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% Off</span>
                          </div>
                          
                          <div className="text-xs text-slate-500 md:hidden mb-2">
                            Delivery by tomorrow, Sun
                          </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-start gap-6 mt-2 md:mt-0 md:ml-32 pl-6 md:pl-0">
                        <div className="flex items-center gap-2">
                          <button 
                             onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor)} 
                             disabled={item.quantity <= 1}
                             className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="w-10 text-center border border-slate-200 py-0.5 bg-white text-sm">{item.quantity}</div>
                          <button 
                             onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor)}
                             className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item.id, item.selectedColor)} 
                            className="font-medium text-slate-800 hover:text-[#2874f0] text-sm uppercase"
                        >
                          Remove
                        </button>
                    </div>
                    
                    <div className="hidden md:block text-xs text-slate-500 absolute right-6 top-6">
                        Delivery by tomorrow, Sun
                    </div>
                  </div>
                )})}
                
                {/* Desktop "Place Order" (Hidden on Mobile) */}
                <div className="hidden md:flex p-4 bg-white sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] justify-end border-t border-slate-100">
                   <div className="mr-auto text-sm text-slate-500 flex items-center">
                      {selectedItems.length === 0 ? 'No items selected' : `${selectedItems.length} items selected`}
                   </div>
                   <button 
                      onClick={handlePlaceOrder}
                      disabled={selectedItems.length === 0}
                      className="bg-[#fb641b] text-white font-medium py-3 px-10 shadow-sm rounded-[2px] uppercase text-sm hover:bg-[#e85d19] disabled:opacity-60 disabled:cursor-not-allowed"
                   >
                      Place Order
                   </button>
                </div>
            </div>
        </div>

        {/* Right Column: Price Details */}
        <div className="lg:w-1/3 w-full px-2 md:px-0">
           <div className="bg-white shadow-sm border border-slate-100 sticky top-20">
              <div className="p-4 border-b border-slate-100">
                 <h2 className="text-slate-500 font-bold uppercase text-sm">Price Details</h2>
              </div>
              <div className="p-4 space-y-4 text-sm">
                 <div className="flex justify-between">
                    <span className="text-slate-800">Price ({selectedItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
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
                 <div className="text-green-600 font-medium pt-2">
                    You will save ₹{discount.toLocaleString('en-IN')} on this order
                 </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                 <ShieldCheck className="w-8 h-8 text-slate-400" />
                 Safe and Secure Payments. Easy returns. 100% Authentic products.
              </div>
           </div>
        </div>
      </div>
      
      {/* Mobile Sticky Footer "Place Order" Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-3 flex items-center justify-between md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex flex-col">
               <span className="text-lg font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
               <div className="text-xs text-[#2874f0] font-medium">View Price Details</div>
           </div>
           <button 
              onClick={handlePlaceOrder}
              disabled={selectedItems.length === 0}
              className="bg-[#fb641b] text-white font-bold py-2.5 px-8 rounded-[2px] text-sm uppercase shadow-sm disabled:opacity-60"
           >
              Place Order
           </button>
      </div>
    </div>
  );
};

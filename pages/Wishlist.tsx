
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash, Star, ShoppingCart, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-white shadow-sm my-4 mx-auto container max-w-5xl rounded-[4px]">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-slate-300 fill-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Wishlist is empty!</h2>
        <p className="text-slate-500 mb-8 text-sm max-w-xs">Explore more and shortlist some items.</p>
        <Link to="/shop" className="bg-[#2874f0] text-white px-16 py-3 rounded-[2px] font-bold shadow-md hover:shadow-lg transition-all uppercase text-sm tracking-wide">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 md:px-4 py-0 md:py-6 pb-20">
       <div className="bg-white shadow-sm rounded-[4px] overflow-hidden">
           <div className="p-5 border-b border-slate-200">
               <h1 className="text-lg font-bold text-slate-800">My Wishlist ({wishlist.length})</h1>
           </div>
           
           <div className="divide-y divide-slate-100">
               {wishlist.map(item => (
                   <div key={item.id} className="flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 group hover:bg-slate-50 transition-colors relative">
                       <Link to={`/product/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 mx-auto md:mx-0">
                           <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                       </Link>
                       
                       <div className="flex-1">
                           <div className="flex justify-between items-start">
                               <Link to={`/product/${item.id}`} className="text-sm md:text-base font-medium text-slate-900 hover:text-[#2874f0] line-clamp-2 md:max-w-[80%] mb-2">
                                   {item.title}
                               </Link>
                               <button 
                                  onClick={() => toggleWishlist(item)} 
                                  className="text-slate-300 hover:text-slate-500 p-1 hidden md:block"
                                  title="Remove from Wishlist"
                               >
                                   <Trash className="w-5 h-5" />
                               </button>
                           </div>
                           
                           <div className="flex items-center gap-2 mb-3">
                                <span className="bg-green-700 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[2px] flex items-center gap-0.5">
                                    {item.rating} <Star className="w-2 h-2 fill-white" />
                                </span>
                                <span className="text-slate-400 text-xs font-medium">({item.reviewsCount})</span>
                           </div>
                           
                           <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-lg md:text-xl font-bold text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                                {item.originalPrice > item.price && (
                                    <div className="flex items-center gap-2 text-xs md:text-sm">
                                        <span className="text-slate-500 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                                        <span className="font-bold text-green-700">
                                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                                        </span>
                                    </div>
                                )}
                           </div>
                       </div>
                       
                       <div className="md:w-48 flex flex-row md:flex-col gap-3 items-center justify-center md:justify-start border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                            <button 
                              onClick={() => toggleWishlist(item)} 
                              className="md:hidden flex-1 flex items-center justify-center gap-2 text-slate-500 text-sm font-medium py-2 border border-slate-200 rounded-[2px]"
                            >
                                <Trash className="w-4 h-4" /> Remove
                            </button>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="flex-1 md:w-full flex items-center justify-center gap-2 bg-[#2874f0] text-white text-sm font-bold py-2.5 px-4 rounded-[2px] shadow-sm hover:bg-blue-600 transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4" /> Add to Cart
                            </button>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

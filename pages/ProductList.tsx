
import React from 'react';
import { Link } from 'react-router-dom';
import { Filter, Star, Heart, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../constants';

export const ProductList: React.FC = () => {
  const { filteredProducts, filters, setFilters, wishlist, toggleWishlist } = useShop();
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      category: null,
      minPrice: 0,
      maxPrice: 200000,
      searchQuery: ''
    }));
  };

  return (
    <div className="container mx-auto px-2 md:px-3 py-2 md:py-3">
      <div className="flex flex-col md:flex-row gap-3">
        
        {/* Sidebar Filters (Desktop) */}
        <div className={`
          fixed inset-0 z-[60] bg-white transform transition-transform duration-300 md:relative md:transform-none md:w-[270px] md:block md:inset-auto shadow-sm md:min-h-screen
          ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center p-4 border-b border-slate-200 md:hidden bg-[#2874f0] text-white">
            <h2 className="text-lg font-medium">Filters</h2>
            <button onClick={() => setShowMobileFilters(false)} className="font-medium uppercase text-sm">Apply</button>
          </div>

          {/* Desktop Header for Filters */}
          <div className="hidden md:flex justify-between items-end p-4 border-b border-slate-200">
             <span className="font-bold text-lg text-slate-800">Filters</span>
             <button onClick={clearFilters} className="text-[#2874f0] text-xs font-bold uppercase tracking-wide hover:underline">Clear All</button>
          </div>

          <div className="p-4 border-b border-slate-200">
             {/* Price Range */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">Price</h3>
              </div>
              <div className="px-1">
                 <input 
                   type="range" 
                   min="0" 
                   max="200000" 
                   step="1000"
                   value={filters.maxPrice} 
                   onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                   className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2874f0]"
                 />
                 <div className="flex justify-between text-sm text-slate-600 mt-3">
                   <div className="border border-slate-300 px-2 py-1 rounded-[2px] min-w-[70px] bg-white text-xs">Min</div>
                   <div className="text-slate-400 text-xs pt-2">to</div>
                   <div className="border border-slate-300 px-2 py-1 rounded-[2px] min-w-[70px] bg-white text-xs">₹{filters.maxPrice}</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Categories Accordion Style */}
          <div className="p-4 border-b border-slate-200">
             <div className="flex justify-between items-center mb-3 cursor-pointer">
                <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">Categories</h3>
                <ChevronDown className="w-4 h-4 text-slate-400" />
             </div>
             <div className="space-y-2 pl-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filters.category === null}
                    onChange={() => setFilters(prev => ({ ...prev, category: null }))}
                    className="w-3.5 h-3.5 border-slate-400 rounded text-[#2874f0] focus:ring-[#2874f0]"
                  />
                  <span className="text-[14px] text-slate-700 group-hover:text-slate-900 truncate">All Categories</span>
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.category === cat}
                      onChange={() => setFilters(prev => ({ ...prev, category: cat }))}
                      className="w-3.5 h-3.5 border-slate-400 rounded text-[#2874f0] focus:ring-[#2874f0]"
                    />
                    <span className="text-[14px] text-slate-700 group-hover:text-slate-900 truncate">{cat}</span>
                  </label>
                ))}
             </div>
          </div>

          {/* Rating Filter */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center mb-3 cursor-pointer">
                <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">Customer Ratings</h3>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-2">
               {[4, 3].map(rating => (
                 <label key={rating} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 border-slate-400 text-[#2874f0] focus:ring-[#2874f0]" />
                    <span className="text-[14px] text-slate-700 flex items-center gap-1">
                       {rating}<Star className="w-3 h-3 fill-current" /> & above
                    </span>
                 </label>
               ))}
            </div>
          </div>
          
          {/* Mobile Only Footer in Filter Menu */}
          <div className="md:hidden p-4 flex gap-2 absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200">
              <button onClick={clearFilters} className="flex-1 border border-slate-300 py-3 rounded font-medium text-slate-600 text-sm">Clear</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 bg-[#fb641b] text-white py-3 rounded font-medium shadow-sm text-sm">Apply</button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {showMobileFilters && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 md:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 bg-white shadow-sm p-3 md:p-4 min-h-screen">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-baseline gap-2">
                <h1 className="font-bold text-base md:text-lg text-slate-900 truncate">
                   {filters.category ? filters.category : (filters.searchQuery ? `Results for "${filters.searchQuery}"` : 'All Products')}
                </h1>
                <span className="text-slate-500 text-xs whitespace-nowrap">(Showing {filteredProducts.length} items)</span>
            </div>
            
            {/* Mobile Sticky Sort/Filter Bar */}
            <div className="flex md:hidden border-t border-b border-slate-200 py-2.5 -mx-3 px-3 sticky top-[52px] bg-white z-30 mt-2 shadow-sm">
               <button 
                 className="flex-1 flex items-center justify-center gap-2 font-bold text-sm border-r border-slate-200 text-slate-800"
                 onClick={() => setShowMobileFilters(true)}
               >
                 <ArrowUpDown className="w-4 h-4" /> Sort
               </button>
               <button 
                 className="flex-1 flex items-center justify-center gap-2 font-bold text-sm text-slate-800"
                 onClick={() => setShowMobileFilters(true)}
               >
                 <Filter className="w-4 h-4" /> Filter
               </button>
            </div>

            <div className="hidden md:flex items-center gap-6 text-[14px]">
              <span className="font-bold text-slate-800">Sort By</span>
              <button 
                onClick={() => setFilters({...filters, sortBy: 'relevance'})}
                className={`hover:text-[#2874f0] cursor-pointer ${filters.sortBy === 'relevance' ? 'text-[#2874f0] font-bold border-b-2 border-[#2874f0] pb-0.5' : 'text-slate-600 font-medium'}`}
              >Relevance</button>
              <button 
                onClick={() => setFilters({...filters, sortBy: 'price-low'})}
                className={`hover:text-[#2874f0] cursor-pointer ${filters.sortBy === 'price-low' ? 'text-[#2874f0] font-bold border-b-2 border-[#2874f0] pb-0.5' : 'text-slate-600 font-medium'}`}
              >Price -- Low to High</button>
              <button 
                onClick={() => setFilters({...filters, sortBy: 'price-high'})}
                className={`hover:text-[#2874f0] cursor-pointer ${filters.sortBy === 'price-high' ? 'text-[#2874f0] font-bold border-b-2 border-[#2874f0] pb-0.5' : 'text-slate-600 font-medium'}`}
              >Price -- High to Low</button>
            </div>
          </div>

          {/* Product Grid - 2 Cols on Mobile, 4 on Desktop */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 md:gap-6 border-l border-t border-slate-100 md:border-none">
              {filteredProducts.map(product => {
                const isInWishlist = wishlist.some(p => p.id === product.id);
                return (
                <div key={product.id} className="group bg-white border-r border-b border-slate-100 md:border md:rounded-[4px] md:hover:shadow-xl transition-all duration-200 p-3 md:p-5 relative flex flex-col hover:z-10">
                  {/* Wishlist Icon */}
                  <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                        className="bg-white rounded-full p-1.5 shadow-sm border border-slate-100 cursor-pointer hover:border-red-100"
                     >
                        <Heart className={`w-4 h-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-300 hover:text-red-500 hover:fill-red-500'}`} />
                     </button>
                  </div>

                  <Link to={`/product/${product.id}`} className="block relative h-[150px] md:h-[210px] mb-4 flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                    />
                  </Link>
                  
                  <div className="flex-1 flex flex-col">
                    <Link to={`/product/${product.id}`} className="text-[13px] md:text-[14px] font-medium text-slate-900 mb-1 hover:text-[#2874f0] line-clamp-2 leading-snug group-hover:text-[#2874f0]">
                      {product.title}
                    </Link>
                    
                    <div className="text-[12px] text-slate-400 mb-2">{product.category}</div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-700 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[2px] flex items-center gap-0.5">
                        {product.rating.toFixed(1)} <Star className="w-2 h-2 fill-white" />
                      </div>
                      <span className="text-slate-400 text-[12px] font-medium">({product.reviewsCount.toLocaleString()})</span>
                      <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" className="h-4 ml-1" alt="Assured" />
                    </div>
                    
                    <div className="mt-auto pt-1">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="text-[16px] md:text-[18px] font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                         {product.originalPrice > product.price && (
                           <div className="flex items-center gap-2 text-[12px] md:text-[13px]">
                             <span className="text-slate-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                             <span className="font-bold text-green-700">
                               {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                             </span>
                           </div>
                         )}
                       </div>
                       <div className="text-[12px] text-slate-900 mt-1 font-medium hidden md:block">Free delivery</div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
              <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/error-no-search-results_2353c5.png" alt="No Results" className="w-48 md:w-64 mb-6" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Sorry, no results found!</h2>
              <p className="text-slate-500 mb-6 text-sm">Please check the spelling or try searching for something else</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

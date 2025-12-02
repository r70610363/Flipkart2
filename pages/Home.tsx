

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Star, Clock, Timer } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../constants';

export const Home: React.FC = () => {
  const { products, setFilters, banners } = useShop();
  const trendingProducts = products.filter(p => p.trending).slice(0, 5);
  const mobileDeals = products.filter(p => p.category === 'Mobiles').slice(0, 5);
  
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const navigate = useNavigate();

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (banners.length > 0) {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Countdown Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const nextBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (banners.length > 0) {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }
  };

  const prevBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (banners.length > 0) {
      setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
    }
  };

  const handleCategoryClick = (cat: string) => {
    setFilters(prev => ({ ...prev, category: cat, searchQuery: '' }));
  };

  const handleBrandClick = (brandName: string) => {
    setFilters(prev => ({
      ...prev,
      category: null, 
      searchQuery: brandName 
    }));
    navigate('/shop');
  };

  const handleBannerClick = (category: string) => {
    setFilters(prev => ({ ...prev, category: category, searchQuery: '' }));
    navigate('/shop');
  };

  const getCategoryImage = (cat: string) => {
      switch(cat) {
          case 'Mobiles': return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80'; // Smartphone
          case 'Electronics': return 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80'; // Laptop/Gadget
          case 'Fashion': return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80';
          case 'Watches': return 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=200&q=80'; // Watch
          case 'Home & Living': return 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=200&q=80';
          case 'Beauty': return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=200&q=80'; // Lipstick Image
          case 'Sports': return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=200&q=80';
          case 'Toys': return 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=200&q=80';
          case 'Appliances': return 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=200&q=80'; // Washing Machine
          case 'Flights': return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80'; // Airplane
          case 'Books': return 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=200&q=80';
          case 'Food': return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80'; // Food/Dining
          case 'Kitchen': return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80'; // Kitchen/Cookware
          default: return `https://picsum.photos/seed/${cat}/150/150`;
      }
  };

  const FEATURED_BRANDS = [
    { name: 'Realme', id: 'realme', imgUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Apple', id: 'apple', imgUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80' },
    { name: 'Samsung', id: 'samsung', imgUrl: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&w=400&q=80' },
    { name: 'Nike', id: 'nike', imgUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
    { name: 'Puma', id: 'puma', imgUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80' },
    { name: 'HRX', id: 'hrx', imgUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="pb-8 bg-[#f1f3f6] min-h-screen">
      
      {/* 1. Category Strip (Clean White Bar with Story Rings) */}
      <div className="bg-white shadow-sm mb-3 border-b border-slate-200">
        <div className="container mx-auto px-0 max-w-[1280px]">
          <div className="flex justify-between overflow-x-auto no-scrollbar py-3 md:py-4 px-4 gap-6 md:gap-8">
             {CATEGORIES.map((cat, idx) => (
                <Link 
                  key={cat}
                  to="/shop"
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0 min-w-[60px]"
                >
                  {/* Story Ring Wrapper */}
                  <div className="rounded-full p-[2px] bg-gradient-to-tr from-yellow-300 via-yellow-400 to-orange-400 group-hover:from-[#2874f0] group-hover:to-blue-500 transition-all duration-300 shadow-sm">
                     <div className="bg-white p-[2px] rounded-full">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden relative bg-slate-50">
                            <img src={getCategoryImage(cat)} alt={cat} className="w-full h-full object-cover mix-blend-normal group-hover:scale-110 transition-transform duration-500" />
                        </div>
                     </div>
                  </div>
                  <span className="text-[13px] md:text-[14px] font-semibold text-slate-800 group-hover:text-[#2874f0] whitespace-nowrap text-center leading-tight font-sans">
                    {cat}
                  </span>
                </Link>
             ))}
          </div>
        </div>
      </div>

      {/* 2. Hero Carousel (Full Width, Professional) */}
      <div className="px-2 md:px-3 mb-3">
        <div className="relative h-[160px] sm:h-[220px] md:h-[320px] overflow-hidden shadow-sm bg-white group w-full cursor-pointer">
          {/* Slides */}
          {banners.length > 0 ? (
            <div 
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`Banner ${idx + 1}`} 
                  className="w-full h-full object-cover flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
              Loading offers...
            </div>
          )}

          {/* Navigation Arrows */}
          <button 
             onClick={prevBanner}
             className="absolute left-0 top-1/2 -translate-y-1/2 h-[80px] w-[40px] bg-white/90 hover:bg-white shadow-md rounded-r flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all"
          >
             <ChevronRight className="w-6 h-6 rotate-180 text-slate-800" />
          </button>
          <button 
             onClick={nextBanner}
             className="absolute right-0 top-1/2 -translate-y-1/2 h-[80px] w-[40px] bg-white/90 hover:bg-white shadow-md rounded-l flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all"
          >
             <ChevronRight className="w-6 h-6 text-slate-800" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all shadow-sm ${currentBanner === idx ? 'bg-white scale-125 w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* QUICK DEALS SECTION (Ends in 30 mins) */}
      <div className="px-2 md:px-3 mb-3">
        <div className="bg-white shadow-sm p-4 md:p-6 border border-slate-100">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-3">
                 <h2 className="text-xl md:text-2xl font-bold text-slate-800">Quick Deals on Mobiles</h2>
                 <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded font-bold text-sm border border-red-100">
                    <Timer className="w-4 h-4 animate-pulse" />
                    <span>Ends in {formatTime(timeLeft)}</span>
                 </div>
              </div>
              <button 
                onClick={() => { setFilters(prev => ({ ...prev, category: 'Mobiles' })); navigate('/shop'); }}
                className="bg-[#2874f0] text-white px-5 py-2 text-xs font-bold rounded-[2px] uppercase shadow-sm"
              >
                View All
              </button>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {mobileDeals.map(product => (
                 <Link key={product.id} to={`/product/${product.id}`} className="group border border-slate-200 rounded-[4px] p-3 hover:shadow-lg transition-all bg-white text-center flex flex-col items-center">
                    <div className="h-[140px] w-full mb-3 flex items-center justify-center overflow-hidden">
                       <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-[#2874f0]">{product.title}</h3>
                    <div className="mt-auto">
                        <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-1">Extra ₹2000 Off</div>
                        <div className="font-bold text-base text-slate-900">₹{product.price.toLocaleString('en-IN')}</div>
                    </div>
                 </Link>
              ))}
           </div>
        </div>
      </div>

      {/* 3. Deal of the Day (Blue Split Layout) */}
      <div className="px-2 md:px-3 mb-3">
        <div className="bg-white shadow-sm flex flex-col md:flex-row h-auto md:h-[360px] overflow-hidden relative">
          
          {/* Left Title Card (Blue Gradient) */}
          <div className="md:w-[240px] p-6 flex flex-col items-center justify-end text-center bg-[url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80')] bg-cover bg-center relative flex-shrink-0 min-h-[140px]">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-500/80 to-blue-900/90"></div>
             <div className="z-10 mt-auto mb-6 relative">
                <h2 className="text-3xl font-normal text-white mb-2 leading-tight drop-shadow-md">Best of<br/>Electronics</h2>
                <Link to="/shop" className="bg-[#2874f0] text-white px-5 py-2.5 text-sm font-bold shadow-lg rounded-[2px] hover:bg-white hover:text-[#2874f0] transition-all inline-block border border-white/20">
                  VIEW ALL
                </Link>
             </div>
          </div>

          {/* Product Slider */}
          <div className="flex-1 overflow-x-auto no-scrollbar p-4 md:p-6 flex items-center bg-white">
             <div className="flex gap-4 md:gap-8 min-w-max">
               {trendingProducts.map(product => (
                 <Link key={product.id} to={`/product/${product.id}`} className="w-[160px] md:w-[200px] group text-center flex flex-col items-center cursor-pointer">
                    <div className="h-[180px] w-full mb-3 relative overflow-hidden">
                       <img src={product.image} alt={product.title} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-[14px] font-medium text-slate-800 truncate w-full px-1 mb-1">{product.title}</h3>
                    <div className="text-green-700 text-[14px] font-medium mb-1">From ₹{product.price.toLocaleString('en-IN')}</div>
                    <div className="text-slate-400 text-[13px]">Grab Now!</div>
                 </Link>
               ))}
               
                {/* Add more visual items to fill slider if specific trending count is low */}
                {trendingProducts.length < 4 && trendingProducts.map((product, i) => (
                 <Link key={product.id + 'dup' + i} to={`/product/${product.id}`} className="w-[160px] md:w-[200px] group text-center flex flex-col items-center cursor-pointer">
                    <div className="h-[180px] w-full mb-3 relative overflow-hidden">
                       <img src={product.image} alt={product.title} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-[14px] font-medium text-slate-800 truncate w-full px-1 mb-1">{product.title}</h3>
                    <div className="text-green-700 text-[14px] font-medium mb-1">Min. 50% Off</div>
                    <div className="text-slate-400 text-[13px]">Best Seller</div>
                 </Link>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* 4. Ad Banners Grid (3 Column) - Interactive */}
      <div className="px-2 md:px-3 mb-3">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <div 
              onClick={() => handleBannerClick('Fashion')} 
              className="w-full h-auto aspect-[3/1] md:aspect-auto md:h-[250px] overflow-hidden relative shadow-sm cursor-pointer group"
            >
                <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Sale" />
                <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 text-xs font-bold text-red-600 rounded">FLAT 50% OFF</div>
            </div>
             <div 
              onClick={() => handleBannerClick('Watches')}
              className="w-full h-auto aspect-[3/1] md:aspect-auto md:h-[250px] overflow-hidden relative shadow-sm cursor-pointer group"
            >
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Watches" />
                 <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 text-xs font-bold text-blue-600 rounded">NEW ARRIVALS</div>
            </div>
             <div 
              onClick={() => handleBannerClick('Electronics')}
              className="w-full h-auto aspect-[3/1] md:aspect-auto md:h-[250px] overflow-hidden relative shadow-sm cursor-pointer group"
            >
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Headphones" />
                 <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 rounded">BEST SELLERS</div>
            </div>
         </div>
      </div>

      {/* 5. Featured Brands (Round UI) */}
      <div className="px-2 md:px-3 mb-4">
         <div className="bg-white shadow-sm p-4 md:p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-800">Featured Brands</h2>
                <Link to="/shop" className="bg-[#2874f0] text-white px-4 py-1.5 text-xs font-bold rounded-[2px] uppercase">View All</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 md:gap-8 justify-items-center">
               {FEATURED_BRANDS.map(brand => (
                  <div 
                    key={brand.id} 
                    onClick={() => handleBrandClick(brand.name)}
                    className="flex flex-col items-center gap-3 group cursor-pointer"
                  >
                     <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-slate-200 group-hover:border-[#2874f0] shadow-sm group-hover:shadow-md transition-all relative bg-white">
                        <img 
                          src={brand.imgUrl} 
                          alt={brand.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                     </div>
                     <span className="text-[14px] font-medium text-slate-700 group-hover:text-[#2874f0] transition-colors">{brand.name}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
};
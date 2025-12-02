import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Zap, Tag, Calendar, ShieldCheck, ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle, X, PenLine, Heart, ZoomIn } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Review, CartItem } from '../types';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, user, addReview, openLoginModal, wishlist, toggleWishlist, prepareCheckout } = useShop();
  const product = products.find(p => p.id === id);
  const navigate = useNavigate();
  
  const [activeImg, setActiveImg] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Zoom & Lightbox State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showLightbox, setShowLightbox] = useState(false);

  // Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Selected Color State
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    if (product) {
        setActiveImg(product.image);
        if (product.colors && product.colors.length > 0) {
            setSelectedColor(product.colors[0]);
        }
    }
  }, [product]);

  const galleryImages = product?.images && product.images.length > 0 ? product.images : (product ? [product.image] : []);
  const reviewsList = product?.reviews || [];

  // Auto-Slide Logic
  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const startSlideTimer = () => {
        slideIntervalRef.current = setInterval(() => {
            if (!isHoveringImage && !showLightbox) {
                setActiveImg(prev => {
                    const currentIndex = galleryImages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % galleryImages.length;
                    return galleryImages[nextIndex];
                });
            }
        }, 3000); 
    };

    startSlideTimer();

    return () => {
        if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [galleryImages, isHoveringImage, showLightbox]);

  const handleManualImageChange = (img: string) => {
      setActiveImg(img);
      if (slideIntervalRef.current) {
          clearInterval(slideIntervalRef.current);
      }
  };

  // Zoom Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZooming) return;
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPos({ x, y });
  };

  const similarProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 8);

  const suggestedProducts = products
    .filter(p => p.category !== product?.category && p.trending)
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  if (!product) {
    return <div className="p-12 text-center">Product not found</div>;
  }

  const isInWishlist = wishlist.some(p => p.id === product.id);

  const handleBuyNow = () => {
      if (!product) return;
      const colorToUse = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      const itemToCheckout: CartItem = { ...product, quantity: 1, selectedColor: colorToUse };
      
      // Force sync save via context
      prepareCheckout([itemToCheckout]);
      
      // Also add to cart for persistence
      addToCart(product, selectedColor);
      
      if(!user) {
          openLoginModal();
          return;
      }
      navigate('/checkout');
  };

  const handleAddToCart = () => {
      addToCart(product, selectedColor);
  }

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      const newReview: Review = {
          id: `rev-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          rating: newRating,
          comment: reviewComment,
          date: new Date().toLocaleDateString(),
          likes: 0,
          isCertified: true
      };
      addReview(product.id, newReview);
      setShowReviewModal(false);
      setReviewComment('');
      setNewRating(5);
  };

  return (
    <div className="container mx-auto px-0 md:px-4 py-0 md:py-4 bg-white md:bg-transparent pb-20 md:pb-4 page-animate">
      <div className="md:hidden flex items-center gap-3 p-3 border-b border-slate-100 bg-white sticky top-[64px] z-30">
        <Link to="/shop" className="text-slate-600"><ArrowLeft className="w-6 h-6" /></Link>
        <span className="font-medium truncate">{product.title}</span>
      </div>

      <div className="bg-white md:shadow-sm flex flex-col lg:flex-row">
        {/* Left Column: Images */}
        <div className="lg:w-[40%] p-4 lg:border-r border-slate-100 lg:sticky lg:top-20 h-fit flex flex-col md:flex-row gap-4">
          
          <div className="hidden md:flex flex-col gap-2 order-1 w-[64px]">
             {galleryImages.map((img, idx) => (
                 <div 
                    key={idx} 
                    className={`w-16 h-16 border rounded p-1 cursor-pointer hover:border-[#2874f0] transition-all duration-200 ${activeImg === img ? 'border-[#2874f0] ring-1 ring-[#2874f0]/30' : 'border-slate-200'}`}
                    onMouseEnter={() => handleManualImageChange(img)}
                    onClick={() => handleManualImageChange(img)}
                 >
                     <img src={img} alt="" className="w-full h-full object-contain" />
                 </div>
             ))}
          </div>

          <div className="flex-1 order-2">
            {/* MAIN IMAGE CONTAINER WITH ZOOM */}
            <div 
                className="relative w-full aspect-square md:h-[400px] flex items-center justify-center border border-slate-100 mb-4 p-4 group overflow-hidden bg-white cursor-zoom-in"
                onMouseEnter={() => { setIsHoveringImage(true); setIsZooming(true); }}
                onMouseLeave={() => { setIsHoveringImage(false); setIsZooming(false); }}
                onMouseMove={handleMouseMove}
                onClick={() => setShowLightbox(true)}
            >
                <img 
                    src={activeImg} 
                    alt={product.title} 
                    className={`max-h-full max-w-full object-contain transition-transform ${isZooming ? 'duration-75' : 'duration-300 ease-in-out'}`}
                    style={isZooming ? { 
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, 
                        transform: 'scale(2)' 
                    } : {}} 
                />
                
                {/* Wishlist Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center z-10 hover:border-red-100"
                >
                    <Heart className={`w-5 h-5 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-300 hover:text-red-500 hover:fill-red-500'}`} />
                </button>

                {/* Zoom Icon Hint */}
                <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-slate-500">
                    <ZoomIn className="w-5 h-5" />
                </div>

                {/* Slide Indicators */}
                {galleryImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/80 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        {galleryImages.map((img, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${activeImg === img ? 'bg-[#2874f0]' : 'bg-slate-300'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Mobile Thumbnail Strip */}
            <div className="flex md:hidden gap-2 overflow-x-auto mb-4 pb-2 no-scrollbar snap-x snap-mandatory px-1">
                {galleryImages.map((img, idx) => (
                 <div 
                    key={idx} 
                    className={`w-16 h-16 border rounded-sm p-1 flex-shrink-0 cursor-pointer snap-start transition-all duration-200 ${activeImg === img ? 'border-[#2874f0] ring-1 ring-[#2874f0]/30' : 'border-slate-200'}`}
                    onClick={() => handleManualImageChange(img)}
                 >
                     <img src={img} alt="" className="w-full h-full object-contain" />
                 </div>
             ))}
            </div>

            {/* Buttons */}
            <div className="hidden md:flex gap-2 md:gap-4 mt-2 px-0">
                <button onClick={handleAddToCart} className="flex-1 bg-[#ff9f00] hover:bg-[#f39400] text-white font-bold py-3.5 rounded-[2px] shadow-sm text-sm md:text-base uppercase flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4 fill-white" /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-1 bg-[#fb641b] hover:bg-[#e85d19] text-white font-bold py-3.5 rounded-[2px] shadow-sm text-sm md:text-base uppercase flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 fill-white" /> Buy Now
                </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:w-[60%] p-4 md:p-6">
           <div className="text-xs text-slate-400 mb-2 hidden md:block">
             <Link to="/" className="hover:text-[#2874f0]">Home</Link> {'>'} {product.category} {'>'} {product.title}
           </div>
           
           <h1 className="text-lg md:text-xl font-normal text-slate-900 mb-2 leading-snug">{product.title}</h1>
           
           <div className="flex items-center gap-3 mb-4">
             <div className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-[2px] flex items-center gap-0.5">
               {product.rating.toFixed(1)} <Star className="w-2.5 h-2.5 fill-white" />
             </div>
             <span className="text-slate-500 text-sm font-medium">{product.reviewsCount} Ratings & {reviewsList.length} Reviews</span>
             <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="h-5" />
           </div>

           <div className="flex items-baseline gap-3 mb-4">
             <span className="text-3xl font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
             {product.originalPrice > product.price && (
               <>
                 <span className="text-slate-500 text-sm line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                 <span className="text-green-600 font-bold text-sm">
                   {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                 </span>
               </>
             )}
           </div>

           {/* Color Selection */}
           {product.colors && product.colors.length > 0 && (
               <div className="mb-6">
                   <h3 className="text-sm font-bold text-slate-800 mb-2">Color</h3>
                   <div className="flex flex-wrap gap-3">
                       {product.colors.map(color => (
                           <button 
                               key={color}
                               onClick={() => setSelectedColor(color)}
                               className={`px-3 py-1.5 rounded-[2px] border text-sm font-medium transition-all flex items-center gap-2 ${selectedColor === color ? 'border-[#2874f0] text-[#2874f0] bg-blue-50' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}
                           >
                               <div className={`w-3 h-3 rounded-full border border-slate-200`} style={{ backgroundColor: color.toLowerCase().includes('black') ? 'black' : color.toLowerCase().includes('blue') ? 'blue' : color.toLowerCase().includes('red') ? 'red' : color.toLowerCase().includes('white') ? 'white' : 'gray' }}></div>
                               {color}
                           </button>
                       ))}
                   </div>
               </div>
           )}

           {/* Offers */}
           <div className="mb-6 space-y-2">
             <h3 className="text-sm font-bold text-slate-800">Available offers</h3>
             <div className="flex items-start gap-2 text-sm text-slate-800">
                <Tag className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Bank Offer</span> 5% Unlimited Cashback on Flipkart Axis Bank Credit Card <span className="text-[#2874f0] font-medium ml-1">T&C</span></span>
             </div>
             <div className="flex items-start gap-2 text-sm text-slate-800">
                <Tag className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">Bank Offer</span> 10% Off on SBI Credit Card, up to ₹1,500 <span className="text-[#2874f0] font-medium ml-1">T&C</span></span>
             </div>
             <div className="flex items-start gap-2 text-sm text-slate-800">
                <Calendar className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><span className="font-bold">No Cost EMI</span> available on selected cards</span>
             </div>
           </div>

           {/* TABS HEADER */}
           <div className="flex items-center gap-8 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab('description')} className={`font-medium py-3 px-1 cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'description' ? 'text-[#2874f0] font-bold border-b-2 border-[#2874f0]' : 'text-slate-500 hover:text-slate-800'}`}>Description</button>
              <button onClick={() => setActiveTab('specifications')} className={`font-medium py-3 px-1 cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'specifications' ? 'text-[#2874f0] font-bold border-b-2 border-[#2874f0]' : 'text-slate-500 hover:text-slate-800'}`}>Specifications</button>
              <button onClick={() => setActiveTab('reviews')} className={`font-medium py-3 px-1 cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'text-[#2874f0] font-bold border-b-2 border-[#2874f0]' : 'text-slate-500 hover:text-slate-800'}`}>Reviews ({reviewsList.length})</button>
           </div>

           {/* TAB CONTENT: Description */}
           {activeTab === 'description' && (
              <div className="mb-8 animate-in fade-in duration-300">
                  <p className="text-slate-700 text-sm leading-relaxed">{product.description}<br/><br/>Lorem ipsum dolor sit amet...</p>
                  <div className="mt-4 p-4 bg-slate-50 rounded text-sm text-slate-600">
                    <h4 className="font-bold text-slate-800 mb-2">Product Highlights</h4>
                    <ul className="list-disc list-inside space-y-1">
                       <li>Genuine Brand Warranty</li>
                       <li>7 Days Replacement Policy</li>
                       <li>Cash on Delivery Available</li>
                    </ul>
                  </div>
              </div>
           )}

           {/* TAB CONTENT: Specifications */}
           {activeTab === 'specifications' && (
              <div className="animate-in fade-in duration-300 mb-8">
                 <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-medium text-slate-800">General Info</div>
                    <div className="p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                           <div className="sm:w-1/3 text-slate-500 text-sm">In The Box</div>
                           <div className="sm:w-2/3 text-slate-800 text-sm">Handset, Adapter, USB Cable, Sim Eject Tool, Phone Case, Warranty Card</div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                           <div className="sm:w-1/3 text-slate-500 text-sm">Model Name</div>
                           <div className="sm:w-2/3 text-slate-800 text-sm">{product.title.split('(')[0]}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                           <div className="sm:w-1/3 text-slate-500 text-sm">Category</div>
                           <div className="sm:w-2/3 text-slate-800 text-sm">{product.category}</div>
                        </div>
                    </div>
                 </div>
              </div>
           )}

           {/* TAB CONTENT: Reviews */}
           {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-300 mb-8">
                 <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-24 h-24 bg-white border rounded-full shadow-sm">
                            <div className="text-3xl font-bold text-slate-800 flex items-center gap-1">{product.rating.toFixed(1)} <Star className="w-5 h-5 fill-amber-400 text-amber-400" /></div>
                            <span className="text-xs text-slate-500 text-center px-2">{reviewsList.length} Reviews</span>
                        </div>
                        <div className="flex-1 space-y-1">
                           <div className="flex items-center gap-2 text-xs text-slate-600"><span>5 ★</span><div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden w-32"><div className="h-full bg-green-500 w-[70%]"></div></div></div>
                           <div className="flex items-center gap-2 text-xs text-slate-600"><span>4 ★</span><div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden w-32"><div className="h-full bg-green-500 w-[20%]"></div></div></div>
                           <div className="flex items-center gap-2 text-xs text-slate-600"><span>3 ★</span><div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden w-32"><div className="h-full bg-green-500 w-[5%]"></div></div></div>
                        </div>
                     </div>
                     <button onClick={() => user ? setShowReviewModal(true) : openLoginModal()} className="bg-white border border-slate-300 px-4 py-2 shadow-sm text-sm font-medium rounded hover:shadow-md text-slate-700 flex items-center gap-2"><PenLine className="w-4 h-4" /> Rate Product</button>
                 </div>
                 <div className="space-y-4">
                    {reviewsList.length === 0 && <div className="text-slate-500 text-center py-4">No reviews yet. Be the first to review!</div>}
                    {reviewsList.map(review => (
                        <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                               <span className={`${review.rating >= 3 ? 'bg-green-600' : 'bg-red-500'} text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5`}>{review.rating} <Star className="w-2 h-2 fill-white" /></span>
                               <span className="font-medium text-slate-800 text-sm truncate">{review.comment.substring(0, 50)}...</span>
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{review.comment}</p>
                            <div className="flex justify-between items-center text-xs text-slate-400">
                               <div className="flex items-center gap-2"><span className="font-medium text-slate-500">{review.userName}</span>{review.isCertified && <span className="flex items-center gap-0.5"><CheckCircle className="w-3 h-3 text-slate-400" /> Certified Buyer</span>}<span>{review.date}</span></div>
                               <div className="flex items-center gap-3"><span className="flex items-center gap-1 cursor-pointer hover:text-slate-600"><ThumbsUp className="w-3 h-3" /> {review.likes}</span></div>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Seller Info & Security */}
           <div className="flex items-center gap-2 text-sm mb-4 pt-4 border-t border-slate-100">
              <span className="text-slate-500">Seller:</span><span className="font-medium text-[#2874f0]">RetailNet</span>
              <div className="bg-[#2874f0] text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">4.5 <Star className="w-2 h-2 fill-white" /></div>
           </div>
           <div className="flex gap-8 py-4">
              <div className="flex flex-col items-center w-24 text-center"><ShieldCheck className="w-8 h-8 text-[#2874f0] mb-2" /><span className="text-xs font-medium text-slate-600">100% Secure Payments</span></div>
              <div className="flex flex-col items-center w-24 text-center"><ShieldCheck className="w-8 h-8 text-[#2874f0] mb-2" /><span className="text-xs font-medium text-slate-600">Genuine Products</span></div>
           </div>
        </div>
      </div>
      
      {/* SIMILAR PRODUCTS SECTION */}
      {similarProducts.length > 0 && (
         <div className="mt-4 bg-white p-4 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Similar Products</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {similarProducts.map(simProduct => (
                    <Link key={simProduct.id} to={`/product/${simProduct.id}`} className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] border border-slate-200 rounded-[4px] p-3 hover:shadow-md transition-shadow flex flex-col bg-white group">
                        <div className="h-[150px] w-full mb-3 flex items-center justify-center overflow-hidden"><img src={simProduct.image} alt={simProduct.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" /></div>
                        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1 hover:text-[#2874f0] leading-snug">{simProduct.title}</h3>
                         <div className="mt-auto"><div className="flex items-center gap-1 mb-1"><span className="bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">{simProduct.rating.toFixed(1)} <Star className="w-2 h-2 fill-white" /></span><span className="text-xs text-slate-500">({simProduct.reviewsCount})</span></div><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm md:text-base">₹{simProduct.price.toLocaleString('en-IN')}</span></div></div>
                    </Link>
                ))}
            </div>
         </div>
      )}

      {/* YOU MIGHT ALSO LIKE SECTION */}
      {suggestedProducts.length > 0 && (
         <div className="mt-4 bg-white p-4 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">You Might Also Like</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {suggestedProducts.map(suggProduct => (
                    <Link key={suggProduct.id} to={`/product/${suggProduct.id}`} className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] border border-slate-200 rounded-[4px] p-3 hover:shadow-md transition-shadow flex flex-col bg-white group">
                        <div className="h-[150px] w-full mb-3 flex items-center justify-center overflow-hidden"><img src={suggProduct.image} alt={suggProduct.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" /></div>
                        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1 hover:text-[#2874f0] leading-snug">{suggProduct.title}</h3>
                        <div className="text-xs text-slate-400 mb-1">{suggProduct.category}</div>
                         <div className="mt-auto"><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm md:text-base">₹{suggProduct.price.toLocaleString('en-IN')}</span></div></div>
                    </Link>
                ))}
            </div>
         </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded shadow-lg overflow-hidden animate-in zoom-in duration-200">
                 <div className="bg-[#2874f0] p-4 flex justify-between items-center text-white"><h3 className="font-bold text-lg">Write a Review</h3><button onClick={() => setShowReviewModal(false)}><X className="w-6 h-6" /></button></div>
                 <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                     <div><label className="block text-sm font-bold text-slate-700 mb-2">Rate this product</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map(star => (<button type="button" key={star} onClick={() => setNewRating(star)} className="focus:outline-none transition-transform active:scale-110"><Star className={`w-8 h-8 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} /></button>))}</div></div>
                     <div><label className="block text-sm font-bold text-slate-700 mb-2">Description</label><textarea required rows={4} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-[#2874f0] outline-none" placeholder="Description..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}></textarea></div>
                     <button type="submit" className="w-full bg-[#fb641b] text-white font-bold py-3 rounded shadow-sm uppercase text-sm">Submit Review</button>
                 </form>
             </div>
          </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowLightbox(false)}>
            <button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-50">
                <X className="w-8 h-8" />
            </button>
            <img 
                src={activeImg} 
                alt="Full Screen" 
                className="max-h-[85vh] max-w-[95vw] object-contain shadow-2xl select-none" 
                onClick={(e) => e.stopPropagation()} 
            />
            {/* Lightbox Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 no-scrollbar z-50 bg-black/50 rounded-full backdrop-blur-sm">
                {galleryImages.map((img, idx) => (
                    <div 
                        key={idx} 
                        className={`w-12 h-12 md:w-16 md:h-16 border-2 rounded-md cursor-pointer flex-shrink-0 transition-all ${activeImg === img ? 'border-[#2874f0] opacity-100' : 'border-white/30 opacity-60 hover:opacity-100'}`}
                        onClick={(e) => { e.stopPropagation(); handleManualImageChange(img); }}
                    >
                        <img src={img} className="w-full h-full object-cover rounded-sm" alt="" />
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MOBILE FIXED BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white flex md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] h-[60px]">
          <button onClick={handleAddToCart} className="w-1/2 bg-white text-slate-800 font-bold text-sm uppercase flex items-center justify-center border-t border-slate-200 active:bg-slate-50">Add to Cart</button>
          <button onClick={handleBuyNow} className="w-1/2 bg-[#fb641b] text-white font-bold text-sm uppercase flex items-center justify-center active:bg-[#e85d19]">Buy Now</button>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Plus, Trash, Edit, Wand2, X, Save, Star, ChevronDown, Search, ImagePlus, TrendingUp, IndianRupee, Image as ImageIcon, Upload, Loader2, Menu, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { UserRole, Product } from '../types';
import { generateProductDescription } from '../services/geminiService';

export const Admin: React.FC = () => {
  const { user, products, adminOrders, updateOrder, addProduct, removeProduct, banners, updateBanners } = useShop();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'banners'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Banner Management State
  const [newBannerUrl, setNewBannerUrl] = useState('');

  // Form State
  const initialFormState: Product = {
    id: '',
    title: '',
    price: 0,
    originalPrice: 0,
    category: 'Electronics',
    description: '',
    image: 'https://picsum.photos/400/400',
    images: ['https://picsum.photos/400/400'],
    rating: 4.5,
    reviewsCount: 100,
    reviews: [],
    trending: false
  };

  const [formData, setFormData] = useState<Product>(initialFormState);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Filter State for Admin Table
  const [searchTerm, setSearchTerm] = useState('');

  if (!user || user.role !== UserRole.ADMIN) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f1f3f6]">
            <div className="bg-white p-8 rounded shadow-sm text-center border-t-4 border-red-500">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-500">You do not have permission to view the Admin Panel.</p>
                <Link to="/" className="inline-block mt-4 text-[#2874f0] font-medium hover:underline">Go back to Home</Link>
            </div>
        </div>
    );
  }

  // Handlers
  const openAddModal = () => {
    setFormData({
      ...initialFormState,
      id: `p-${Date.now()}`,
      price: 999,
      originalPrice: 1499
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({ 
        ...product,
        images: product.images && product.images.length > 0 ? product.images : [product.image]
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure the main 'image' property is synced with the first image in the gallery
    const finalProduct = {
        ...formData,
        image: formData.images.length > 0 ? formData.images[0] : formData.image
    };
    
    addProduct(finalProduct); 
    setShowModal(false);
  };

  const handleGenerateDescription = async () => {
    if(!formData.title) {
      alert("Please enter a product title first.");
      return;
    }
    setIsGeneratingAi(true);
    const desc = await generateProductDescription(formData.title, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingAi(false);
  };

  // File Upload Helper
  const handleFileUpload = (file: File, callback: (base64: string) => void) => {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { 
          alert("File size too large. Please select an image under 5MB.");
          return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
          setIsUploading(false);
          if (typeof reader.result === 'string') {
              callback(reader.result);
          }
      };
      reader.readAsDataURL(file);
  };

  // Product Image Logic
  const handleAddImage = () => {
      if (!newImageUrl) return;
      if (formData.images.length >= 10) {
          alert("Maximum 10 images allowed.");
          return;
      }
      setFormData(prev => ({
          ...prev,
          images: [...prev.images, newImageUrl]
      }));
      setNewImageUrl('');
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          if (formData.images.length >= 10) {
              alert("Maximum 10 images allowed.");
              return;
          }
          handleFileUpload(e.target.files[0], (base64) => {
              setFormData(prev => ({
                  ...prev,
                  images: [...prev.images, base64]
              }));
          });
      }
  };

  const handleRemoveImage = (index: number) => {
      setFormData(prev => {
          const updated = prev.images.filter((_, i) => i !== index);
          return {
              ...prev,
              images: updated
          };
      });
  };

  // Banner Logic
  const handleAddBanner = () => {
    if (!newBannerUrl) return;
    updateBanners([...banners, newBannerUrl]);
    setNewBannerUrl('');
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleFileUpload(e.target.files[0], (base64) => {
              updateBanners([...banners, base64]);
          });
      }
  };

  const handleRemoveBanner = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);
    updateBanners(updated);
  };

  // Calculations
  const discountPercent = formData.originalPrice > formData.price 
    ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100) 
    : 0;

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = products.reduce((acc, p) => acc + p.price, 0);
  const totalRevenue = adminOrders.reduce((acc, o) => acc + o.total, 0);
  
  const categoryStats = products.reduce((acc, p) => {
      const cat = p.category || 'Uncategorized';
      if (!acc[cat]) {
          acc[cat] = { count: 0, value: 0 };
      }
      acc[cat].count += 1;
      acc[cat].value += p.price;
      return acc;
  }, {} as Record<string, { count: number, value: number }>);

  const categoryKeys = Object.keys(categoryStats);


  return (
    <div className="flex min-h-screen bg-[#f1f3f6] font-sans flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-[#2874f0] text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
              <Link to="/" className="p-1 -ml-2 active:opacity-80" title="Back to Website">
                 <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="font-bold text-lg italic">Flipkart Admin</div>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
      </div>

      {/* Sidebar */}
      <aside className={`
          bg-white shadow-sm fixed md:sticky top-[60px] md:top-0 h-[calc(100vh-60px)] md:h-screen z-10 border-r border-slate-200 w-64 transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 bg-[#2874f0] text-white hidden md:block">
          <h2 className="text-xl font-bold italic tracking-wide">Flipkart</h2>
          <p className="text-xs text-blue-100 mt-1 opacity-80">Seller Dashboard</p>
        </div>
        <nav className="p-4 space-y-1 flex flex-col h-[calc(100%-80px)]">
          <div className="space-y-1">
            <button onClick={() => {setActiveTab('dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-[2px] font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-[#2874f0]' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button onClick={() => {setActiveTab('products'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-[2px] font-medium transition-colors ${activeTab === 'products' ? 'bg-blue-50 text-[#2874f0]' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Package className="w-5 h-5" /> Products
            </button>
            <button onClick={() => {setActiveTab('orders'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-[2px] font-medium transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-[#2874f0]' : 'text-slate-600 hover:bg-slate-50'}`}>
              <ShoppingCart className="w-5 h-5" /> Orders
            </button>
            <button onClick={() => {setActiveTab('banners'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-[2px] font-medium transition-colors ${activeTab === 'banners' ? 'bg-blue-50 text-[#2874f0]' : 'text-slate-600 hover:bg-slate-50'}`}>
              <ImageIcon className="w-5 h-5" /> Banners
            </button>
          </div>
          
          {/* Back to Website Link */}
          <div className="mt-auto border-t border-slate-100 pt-2">
            <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-[2px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Website
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-[1600px] overflow-x-hidden">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
               <span className="text-sm text-slate-500">Welcome back, Admin</span>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-[4px] shadow-sm border-b-4 border-green-500">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-full text-green-600">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[4px] shadow-sm border-b-4 border-orange-500">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{adminOrders.length}</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[4px] shadow-sm border-b-4 border-blue-500">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">Listed Products</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-full text-[#2874f0]">
                        <Package className="w-5 h-5" />
                    </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[4px] shadow-sm border-b-4 border-purple-500">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">Inventory Value</p>
                        <p className="text-lg md:text-2xl font-bold text-slate-900 mt-1 truncate">₹{totalInventoryValue.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[4px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#2874f0]" />
                            Category Distribution
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                                    <th className="px-6 py-3 font-bold">Category</th>
                                    <th className="px-6 py-3 font-bold text-right">Count</th>
                                    <th className="px-6 py-3 font-bold text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categoryKeys.map((cat) => (
                                    <tr key={cat} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium text-slate-700">{cat}</td>
                                        <td className="px-6 py-3 text-right text-slate-600">{categoryStats[cat].count}</td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-800">₹{categoryStats[cat].value.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-[4px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-orange-500" />
                            Recent Orders
                        </h3>
                        <button onClick={() => setActiveTab('orders')} className="text-[#2874f0] text-xs font-bold uppercase hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[400px]">
                        <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <th className="px-4 py-3 font-bold">ID</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                            <th className="px-4 py-3 font-bold text-right">Amount</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {adminOrders.slice(0, 5).map(order => (
                            <tr key={order.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-[#2874f0] text-xs">{order.id}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                {order.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-xs">₹{order.total.toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
            
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
              <button onClick={openAddModal} className="bg-[#2874f0] text-white px-6 py-2.5 rounded-[2px] font-medium flex items-center gap-2 hover:bg-blue-600 shadow-sm transition-colors w-full md:w-auto justify-center">
                <Plus className="w-5 h-5" /> Add New Product
              </button>
            </div>

            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Search products..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-[2px] focus:outline-none focus:border-[#2874f0] shadow-sm"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
            
            <div className="bg-white rounded-[4px] shadow-sm border border-slate-100 overflow-hidden">
               {/* Desktop Table View */}
               <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-left text-sm min-w-[700px]">
                   <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                     <tr>
                       <th className="px-6 py-4 font-bold">Product</th>
                       <th className="px-6 py-4 font-bold">Category</th>
                       <th className="px-6 py-4 font-bold">Price Info</th>
                       <th className="px-6 py-4 font-bold">Rating</th>
                       <th className="px-6 py-4 font-bold text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {filteredProducts.map(product => (
                       <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 p-1 border border-slate-100 rounded bg-white flex-shrink-0">
                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                             </div>
                             <div>
                                <p className="font-medium text-slate-900 line-clamp-1 max-w-[250px]" title={product.title}>{product.title}</p>
                                {product.trending && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">Trending</span>}
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-slate-600">{product.category}</td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-slate-600">
                                <span>{product.rating}</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <button 
                                onClick={() => openEditModal(product)} 
                                className="p-2 text-slate-400 hover:text-[#2874f0] hover:bg-blue-50 rounded transition-colors"
                             >
                               <Edit className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => removeProduct(product.id)} 
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                             >
                               <Trash className="w-4 h-4" />
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Mobile Card View */}
               <div className="md:hidden divide-y divide-slate-100">
                  {filteredProducts.map(product => (
                     <div key={product.id} className="p-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <div className="w-20 h-20 flex-shrink-0 border border-slate-100 rounded p-1 bg-white">
                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900 line-clamp-2 text-sm leading-tight mb-1">{product.title}</h3>
                                <div className="text-xs text-slate-500 mb-1">{product.category}</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                                    {product.trending && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Trending</span>}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                     <span className="bg-green-600 text-white px-1 rounded text-[10px] font-bold flex items-center gap-0.5">{product.rating} <Star className="w-2 h-2 fill-white" /></span>
                                     <span>({product.reviewsCount})</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                            <button 
                                onClick={() => openEditModal(product)} 
                                className="flex-1 bg-[#2874f0]/10 text-[#2874f0] py-2 rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2874f0]/20"
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button 
                                onClick={() => removeProduct(product.id)} 
                                className="flex-1 bg-red-50 text-red-500 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-100"
                            >
                                <Trash className="w-4 h-4" /> Delete
                            </button>
                        </div>
                     </div>
                  ))}
                  {filteredProducts.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">No products found</div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>
            <div className="space-y-4">
              {adminOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[4px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-100">
                   <div className="flex-1 w-full">
                     <div className="flex items-center gap-4 mb-3">
                       <span className="font-bold text-[#2874f0] text-base md:text-lg">{order.id}</span>
                       <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded font-medium">{new Date(order.date).toLocaleDateString()}</span>
                     </div>
                     <div className="flex flex-wrap gap-2 mb-3">
                        {order.items.slice(0,3).map((item: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 px-2 py-1 text-xs text-slate-700 rounded border border-slate-100">
                                {item.title.substring(0, 20)}... x{item.quantity}
                            </div>
                        ))}
                     </div>
                     <div className="text-sm text-slate-600">
                        Total: <span className="font-bold text-slate-900 text-lg">₹{order.total.toLocaleString('en-IN')}</span>
                     </div>
                   </div>
                   
                   <div className="flex flex-col gap-2 w-full md:w-auto min-w-[200px]">
                     <label className="text-xs font-bold text-slate-500 uppercase">Update Status</label>
                     <div className="relative">
                        <select 
                        value={order.status} 
                        onChange={(e) => updateOrder(order.id, e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 rounded-[2px] px-4 py-2.5 text-sm focus:border-[#2874f0] outline-none cursor-pointer font-medium text-slate-700"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
             <h1 className="text-2xl font-bold text-slate-800">Homepage Banners</h1>
             <div className="bg-white p-4 md:p-6 rounded-[4px] shadow-sm border border-slate-100">
                <div className="flex flex-col gap-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="Enter Image URL or Upload from Device" 
                        value={newBannerUrl}
                        onChange={(e) => setNewBannerUrl(e.target.value)}
                        className="w-full border border-slate-300 rounded-[2px] px-4 py-2.5 focus:border-[#2874f0] outline-none text-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex items-center gap-2 border border-slate-200 p-2 rounded border-dashed">
                             <label className="cursor-pointer flex items-center justify-center w-full gap-2 text-[#2874f0] text-sm font-medium">
                                <input type="file" hidden accept="image/*" onChange={handleBannerUpload} />
                                <Upload className="w-4 h-4" /> Upload Image
                             </label>
                             {isUploading && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /></span>}
                        </div>
                        <button 
                          onClick={handleAddBanner}
                          disabled={!newBannerUrl || isUploading}
                          className="bg-[#2874f0] text-white px-6 py-2.5 rounded-[2px] font-medium shadow-sm hover:bg-blue-600 disabled:opacity-50 w-full sm:w-auto"
                        >
                          Add Banner
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {banners.map((banner, index) => (
                      <div key={index} className="relative group border border-slate-200 rounded overflow-hidden">
                         <img src={banner} alt={`Banner ${index + 1}`} className="w-full h-32 md:h-48 object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => handleRemoveBanner(index)}
                              className="bg-white text-red-500 px-4 py-2 rounded shadow-sm font-bold text-sm hover:bg-red-50 flex items-center gap-2"
                            >
                               <Trash className="w-4 h-4" /> Delete
                            </button>
                         </div>
                      </div>
                    ))}
                </div>
             </div>
          </div>
        )}

      </main>

      {/* Reuse existing Product Modal logic here (unchanged from previous version, just ensuring wrapper is responsive) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Modal Content Wrapper - Make scrollable */}
             <div className="px-4 py-3 bg-[#2874f0] text-white flex justify-between items-center flex-shrink-0">
               <h2 className="text-lg font-medium flex items-center gap-2">
                 {isEditing ? 'Edit Product' : 'Add New Product'}
               </h2>
               <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <form id="productForm" onSubmit={handleSave} className="space-y-6">
                    {/* ... Form Content ... */}
                     <div className="bg-white p-4 rounded shadow-sm border border-slate-100">
                        {/* Simplified Form Fields for Mobile brevity in code block */}
                        <div className="space-y-4">
                            <input 
                                required 
                                type="text" 
                                className="w-full px-3 py-2 border border-slate-300 rounded" 
                                placeholder="Product Title"
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                            />
                             <div className="grid grid-cols-2 gap-4">
                                 <input type="number" placeholder="Selling Price" className="w-full px-3 py-2 border border-slate-300 rounded" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                                 <input type="number" placeholder="MRP" className="w-full px-3 py-2 border border-slate-300 rounded" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} />
                             </div>
                             {/* Image Upload Section */}
                             <div>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" className="flex-1 border p-2 rounded text-sm" placeholder="Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} />
                                    <button type="button" onClick={handleAddImage} className="bg-slate-800 text-white px-3 rounded text-sm">Add</button>
                                    <label className="bg-[#2874f0] text-white px-3 rounded text-sm flex items-center justify-center"><input type="file" hidden onChange={handleProductImageUpload} /><Upload className="w-4 h-4" /></label>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square border rounded overflow-hidden">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                             </div>
                             
                             {/* Description */}
                             <div>
                                 <div className="flex justify-between items-center mb-2">
                                     <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                     <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingAi} className="text-[#2874f0] text-xs font-bold uppercase flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                                         {isGeneratingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                         Generate with AI
                                     </button>
                                 </div>
                                 <textarea 
                                     rows={4}
                                     className="w-full px-3 py-2 border border-slate-300 rounded text-sm" 
                                     value={formData.description} 
                                     onChange={e => setFormData({...formData, description: e.target.value})} 
                                 />
                             </div>
                             
                             {/* Category & Other Settings */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                                     <select className="w-full px-3 py-2 border border-slate-300 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                         <option>Electronics</option>
                                         <option>Fashion</option>
                                         <option>Home & Living</option>
                                         <option>Beauty</option>
                                         <option>Sports</option>
                                         <option>Books</option>
                                     </select>
                                 </div>
                                 <div className="flex items-end pb-2">
                                     <label className="flex items-center gap-2 cursor-pointer">
                                         <input type="checkbox" checked={formData.trending} onChange={e => setFormData({...formData, trending: e.target.checked})} className="w-4 h-4 text-[#2874f0] border-slate-300 rounded focus:ring-[#2874f0]" />
                                         <span className="text-sm font-medium text-slate-700">Mark as Trending / Best Seller</span>
                                     </label>
                                 </div>
                             </div>
                             
                             {/* Social Proof (Manual Control) */}
                             <div className="pt-4 border-t border-slate-100">
                                 <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Social Proof (Manual Control)</h3>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="text-xs text-slate-400 block mb-1">Rating (0-5)</label>
                                         <input type="number" step="0.1" max="5" className="w-full px-3 py-2 border border-slate-300 rounded" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} />
                                     </div>
                                     <div>
                                         <label className="text-xs text-slate-400 block mb-1">Review Count</label>
                                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded" value={formData.reviewsCount} onChange={e => setFormData({...formData, reviewsCount: Number(e.target.value)})} />
                                     </div>
                                 </div>
                             </div>
                        </div>
                     </div>
                </form>
            </div>
            <div className="p-4 border-t bg-white flex justify-end gap-2 flex-shrink-0">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" form="productForm" className="px-6 py-2 bg-[#fb641b] text-white font-bold rounded shadow-sm">
                    {isEditing ? 'Update Product' : 'Save Product'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
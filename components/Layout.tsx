
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User as UserIcon, LogOut, ChevronDown, Plus, ShoppingBag, Store, Megaphone, HelpCircle, Briefcase, Loader2, Bell, CheckCheck, Heart, Eye, EyeOff, Home, LayoutGrid, Gift } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { checkUserExists, registerUser, authenticateUser } from '../services/data';
import { sendOtp, verifyOtp } from '../services/otpService';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, cart, login, logout, filters, setFilters, isLoginModalOpen, openLoginModal, closeLoginModal, wishlist, notifications, addNotification, markAllNotificationsRead } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [identifier, setIdentifier] = useState(''); // Can be email or mobile
  
  // Signup State
  const [signupForm, setSignupForm] = useState({
      name: '',
      mobile: '',
      email: '',
      password: '',
      confirmPassword: ''
  });

  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'mobile_otp' | 'email_otp'>('input');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const location = useLocation();
  const navigate = useNavigate();

  // Bottom Nav Logic: Hide on specific "Action" pages
  const hideBottomNavRoutes = ['/product', '/cart', '/checkout', '/payment', '/order-summary', '/track-order'];
  const showBottomNav = !hideBottomNavRoutes.some(route => location.pathname.startsWith(route));

  const handleNotificationClick = (id: number, link: string) => {
      setShowNotifications(false);
      navigate(link);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, category: null }));
    navigate('/shop');
  };

  const resetAuth = () => {
      setIdentifier('');
      setSignupForm({ name: '', mobile: '', email: '', password: '', confirmPassword: '' });
      setOtp('');
      setStep('input');
      setError('');
      setSuccessMsg('');
      setAuthMode('login');
      setIsLoading(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
  };

  const handleFinalSignup = async () => {
      try {
          const u = await registerUser({
              name: signupForm.name,
              email: signupForm.email,
              mobile: signupForm.mobile,
              password: signupForm.password
          });
          login(u);
          addNotification("Welcome to Flipkart!", "Thank you for joining. Start exploring our latest collections.", "/shop");
          closeLoginModal();
          resetAuth();
      } catch (err: any) {
          setError(err.message || 'Registration failed');
          setIsLoading(false);
      }
  };

  const verifyAndProceed = async (target: string, code: string, currentPhase: 'login' | 'mobile_otp' | 'email_otp') => {
      setIsLoading(true);
      setError('');
      
      try {
          // Verify the OTP
          const verifyResponse = await verifyOtp(target, code);
          
          if (verifyResponse.success) {
              
              if (authMode === 'login') {
                  const u = await authenticateUser(target);
                  login(u);
                  closeLoginModal();
                  resetAuth();
              } else {
                  // Signup Flow
                  if (currentPhase === 'mobile_otp') {
                      await handleFinalSignup();
                  } 
              }
          } else {
              setError("Invalid OTP. Please try again.");
              setIsLoading(false);
          }
      } catch (err: any) {
          console.error(err);
          setError(err.message || 'Authentication failed');
          setIsLoading(false);
      }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Prevent double submission if loading
    if (isLoading && step !== 'input') return; 
    setIsLoading(true);

    try {
        // ---- LOGIN FLOW ----
        if (authMode === 'login') {
            const inputVal = identifier.trim();

            if (step === 'input') {
                // Strictly allow only Mobile Numbers for Login as per previous request
                const isPhone = /^[6-9]\d{9}$/.test(inputVal);

                if (!isPhone) {
                    setError('Please enter a valid 10-digit Mobile Number');
                    setIsLoading(false);
                    return;
                }

                const exists = await checkUserExists(inputVal);
                if (!exists) {
                    setError('Account does not exist. Please Sign Up.');
                    setIsLoading(false);
                    return;
                }

                // Send OTP for Login
                const response = await sendOtp(inputVal);
                if (response.success) {
                    // Show OTP in message for Testing/Demo purposes
                    setSuccessMsg(`OTP Sent to ${inputVal} (${response.devCode})`);
                    setStep('mobile_otp'); // Reusing mobile_otp state for generic login otp step
                    
                    // Auto-fill logic ONLY for Mobile Numbers
                    setTimeout(() => {
                        if (response.devCode) {
                            setOtp(response.devCode);
                            verifyAndProceed(inputVal, response.devCode, 'login');
                        }
                    }, 5000);
                } else {
                    setError(response.message);
                    setIsLoading(false);
                }
            } else {
                // Verify Login OTP (Manual Submit)
                if (otp.length < 4) {
                    setError('Please enter valid 4-digit OTP');
                    setIsLoading(false);
                    return;
                }
                verifyAndProceed(inputVal, otp, 'login');
            }
        } 
        // ---- SIGNUP FLOW ----
        else {
            if (step === 'input') {
                // Validate Signup Form
                if (!signupForm.name.trim()) { setError("Name is required"); setIsLoading(false); return; }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) { setError("Invalid Email Address"); setIsLoading(false); return; }
                if (!/^[6-9]\d{9}$/.test(signupForm.mobile)) { setError("Invalid Mobile Number"); setIsLoading(false); return; }
                if (signupForm.password.length < 6) { setError("Password must be at least 6 chars"); setIsLoading(false); return; }
                if (signupForm.password !== signupForm.confirmPassword) { setError("Passwords do not match"); setIsLoading(false); return; }

                const exists = await checkUserExists(signupForm.mobile) || await checkUserExists(signupForm.email);
                if (exists) {
                    setError('Account already exists with this Mobile or Email. Please Login.');
                    setIsLoading(false);
                    return;
                }

                // Step 1: Send OTP to Mobile
                const response = await sendOtp(signupForm.mobile);
                if (response.success) {
                    // Show OTP in message for Testing/Demo purposes
                    setSuccessMsg(`OTP Sent to ${signupForm.mobile} (${response.devCode})`);
                    setStep('mobile_otp');

                    // Auto-fill logic for Mobile Numbers (5s delay)
                    setTimeout(() => {
                        if (response.devCode) {
                            setOtp(response.devCode);
                            verifyAndProceed(signupForm.mobile, response.devCode, 'mobile_otp');
                        }
                    }, 5000);
                } else {
                    setError(response.message);
                    setIsLoading(false);
                }
            } else if (step === 'mobile_otp') {
                 // Should be handled by auto-verify mostly, but allow manual
                 if (otp.length < 4) { setError('Invalid OTP'); setIsLoading(false); return; }
                 verifyAndProceed(signupForm.mobile, otp, 'mobile_otp');
            }
        }
    } catch (err) {
        console.error(err);
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
      setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
      setStep('input');
      setError('');
      setSuccessMsg('');
      setOtp('');
  };

  useEffect(() => {
      if(isLoginModalOpen) {
          resetAuth();
      }
  }, [isLoginModalOpen]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-[#f1f3f6]">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#2874f0] shadow-md md:h-[64px]">
        <div className="container mx-auto px-3 md:px-4 h-auto md:h-full flex flex-col md:flex-row items-center gap-2 md:gap-8 max-w-[1200px] relative py-2 md:py-0">
          <div className="flex items-center justify-between w-full md:w-auto h-[56px] md:h-auto">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link to="/" className="flex flex-col items-start leading-none min-w-[90px] group">
                <div className="text-white font-bold text-lg md:text-[20px] italic tracking-wide drop-shadow-sm">Flipkart</div>
                <div className="text-[11px] text-slate-200 italic flex items-center gap-0.5 font-medium hover:underline cursor-pointer opacity-80 group-hover:opacity-100">
                  Explore <span className="text-[#ffe500] font-bold">Plus</span> 
                  <Plus className="w-2.5 h-2.5 text-[#ffe500]" strokeWidth={4} />
                </div>
              </Link>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex md:hidden ml-auto items-center gap-4 text-white relative">
                {!user && (
                    <button onClick={openLoginModal} className="bg-white text-[#2874f0] px-3 py-1 text-xs font-bold rounded-[2px] shadow-sm">
                      Login
                    </button>
                )}

                {/* Mobile Notification Bell (Hidden here if Bottom Nav is active, or kept as duplicate) 
                    - Keeping it here for now as Quick Action, Bottom Nav will handle main navigation
                */}
                <button 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className="relative md:hidden"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff6161] border border-[#2874f0] rounded-full flex items-center justify-center"></span>
                  )}
                </button>
                
                <Link to="/cart" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#2874f0]">
                      {totalItems}
                    </span>
                  )}
                </Link>
            </div>
          </div>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[560px] relative shadow-md rounded-[2px]">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full pl-4 pr-10 py-2 rounded-[2px] text-[14px] text-slate-800 focus:outline-none shadow-inner h-[36px]"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-[#2874f0]">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6 text-white font-medium text-[15px] relative">
            
            {/* Login Button */}
            {user ? (
               <div className="group relative cursor-pointer hidden md:flex items-center gap-1">
                 <span className="text-white font-semibold">Hi, {user.name}</span>
                 <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                 
                 {/* Dropdown */}
                 <div className="absolute top-full right-0 pt-2 w-56 hidden group-hover:block z-[60]">
                   <div className="bg-white text-slate-800 shadow-xl rounded-[2px] overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                      {user.role === 'admin' && (
                         <Link to="/admin" className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-50 text-[#2874f0] font-semibold">Admin Panel</Link>
                      )}
                      <Link to="/profile" className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex items-center gap-2 text-slate-800"><UserIcon className="w-4 h-4"/> My Profile</Link>
                      <Link to="/wishlist" className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex items-center gap-2 text-slate-800">
                        <Heart className="w-4 h-4"/> Wishlist
                        {wishlist.length > 0 && <span className="bg-red-50 text-white text-[10px] px-1.5 rounded-full">{wishlist.length}</span>}
                      </Link>
                      <Link to="/my-orders" className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex items-center gap-2 text-slate-800"><Briefcase className="w-4 h-4"/> Orders</Link>
                      <div onClick={logout} className="px-4 py-3 hover:bg-slate-50 text-slate-800 cursor-pointer flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-slate-500" /> Logout
                      </div>
                   </div>
                 </div>
               </div>
            ) : (
              <button 
                onClick={openLoginModal}
                className="hidden md:block bg-white text-[#2874f0] px-10 py-[5px] font-bold text-sm shadow-sm hover:bg-blue-50 transition-colors rounded-[2px] tracking-wide"
              >
                Login
              </button>
            )}

            <div className="hidden md:block cursor-pointer hover:text-slate-200 font-semibold">Become a Seller</div>
            
            <div className="hidden md:flex items-center gap-1 cursor-pointer hover:text-slate-200 font-semibold">
              More <ChevronDown className="w-3 h-3" />
            </div>

            {/* Desktop Notification Bell */}
            <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="relative hover:text-slate-200"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-1 w-2 h-2 bg-[#ff6161] border border-[#2874f0] rounded-full"></span>
                )}
            </button>

            <Link to="/cart" className="flex items-center gap-2 hover:text-slate-200 font-semibold">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border border-[#2874f0]">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Cart</span>
            </Link>
          </div>

          {/* Notifications Dropdown (Global) */}
          {showNotifications && (
            <div className="absolute top-[56px] md:top-[50px] right-2 md:right-20 w-[95%] md:w-[340px] max-w-[340px] bg-white shadow-xl rounded-[2px] border border-slate-200 z-[60] overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-medium flex justify-between items-center sticky top-0 z-10">
                    <span className="font-bold">Notifications ({unreadCount})</span>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button onClick={markAllNotificationsRead} className="text-[11px] font-bold text-[#2874f0] hover:underline uppercase flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                <CheckCheck className="w-3 h-3" /> Mark All Read
                            </button>
                        )}
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 ml-2"><X className="w-4 h-4"/></button>
                    </div>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n.id, n.link)}
                            className={`p-4 border-b border-slate-50 hover:bg-blue-50 cursor-pointer transition-colors flex items-start gap-3 ${n.unread ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-[#2874f0]' : 'bg-transparent'}`}></div>
                            <div>
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <h4 className={`text-sm leading-tight ${n.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{n.title}</h4>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mt-1">{n.desc}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 text-slate-300" />
                            No new notifications
                        </div>
                    )}
                </div>
                <div className="p-3 text-center border-t border-slate-100 bg-white">
                    <button className="text-[#2874f0] text-xs font-bold uppercase hover:underline">View All Notifications</button>
                </div>
            </div>
          )}

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-2 pb-2 bg-[#2874f0]">
           <form onSubmit={handleSearch} className="relative">
              <input
                 type="text"
                 placeholder="Search for products..."
                 className="w-full pl-3 pr-10 py-2 rounded-[2px] text-base focus:outline-none shadow-sm h-[38px] bg-white text-slate-900 placeholder:text-sm"
                 value={filters.searchQuery}
                 onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2874f0] w-5 h-5" />
           </form>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 md:hidden animate-in fade-in duration-200" onClick={() => setIsMenuOpen(false)}>
            <div className="bg-white w-[280px] h-full overflow-y-auto animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-[#2874f0] p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                       <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-lg">{user ? user.name : 'Login & Signup'}</span>
                </div>
                <X className="w-6 h-6 cursor-pointer opacity-80 hover:opacity-100" onClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="flex flex-col text-sm text-slate-700 font-medium">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50 flex items-center gap-3"><Store className="w-4 h-4 text-slate-500"/> Home</Link>
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50 flex items-center gap-3"><Briefcase className="w-4 h-4 text-slate-500"/> All Categories</Link>
                
                {/* Profile Link in Sidebar - Handle Login */}
                <button 
                    onClick={() => { setIsMenuOpen(false); user ? navigate('/profile') : openLoginModal(); }} 
                    className="w-full text-left px-5 py-4 border-b border-slate-100 hover:bg-slate-50 flex items-center gap-3 font-medium text-slate-700"
                >
                    <UserIcon className="w-4 h-4 text-slate-500"/> My Profile
                </button>

                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50 flex items-center gap-3"><Heart className="w-4 h-4 text-slate-500"/> My Wishlist</Link>
                <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50 flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-slate-500"/> My Orders</Link>
                {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50 text-[#2874f0] flex items-center gap-3"><Briefcase className="w-4 h-4"/> Admin Panel</Link>
                )}
                {!user ? (
                <button onClick={() => { openLoginModal(); setIsMenuOpen(false); }} className="text-left px-5 py-4 border-b border-slate-100 hover:bg-slate-50 text-[#2874f0] font-bold">Login</button>
                ) : (
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left px-5 py-4 border-b border-slate-100 hover:bg-slate-50 text-red-500 flex items-center gap-3"><LogOut className="w-4 h-4"/> Logout</button>
                )}
            </nav>
            <div className="mt-auto p-4 bg-slate-50">
               <div className="flex items-center justify-center gap-1 text-xs text-slate-400 italic">Flipkart v1.0</div>
            </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-grow w-full mx-auto ${showBottomNav ? 'pb-[60px]' : 'pb-0'}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {showBottomNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between items-center px-4 py-2 z-50 h-[60px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-[#2874f0]' : 'text-slate-500'}`}>
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link to="/shop" className={`flex flex-col items-center gap-1 ${location.pathname === '/shop' ? 'text-[#2874f0]' : 'text-slate-500'}`}>
                <LayoutGrid className="w-5 h-5" />
                <span className="text-[10px] font-medium">Categories</span>
            </Link>
            <button onClick={() => setShowNotifications(!showNotifications)} className={`flex flex-col items-center gap-1 relative ${showNotifications ? 'text-[#2874f0]' : 'text-slate-500'}`}>
                <Bell className="w-5 h-5" />
                <span className="text-[10px] font-medium">Alerts</span>
                 {unreadCount > 0 && (
                    <span className="absolute -top-1 right-2 w-2.5 h-2.5 bg-[#ff6161] border border-white rounded-full"></span>
                 )}
            </button>
            
            {/* Account - Opens Login if not authenticated */}
            <button 
                onClick={() => user ? navigate('/profile') : openLoginModal()} 
                className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' ? 'text-[#2874f0]' : 'text-slate-500'}`}
            >
                <UserIcon className="w-5 h-5" />
                <span className="text-[10px] font-medium">Account</span>
            </button>

            <Link to="/cart" className={`flex flex-col items-center gap-1 relative ${location.pathname === '/cart' ? 'text-[#2874f0]' : 'text-slate-500'}`}>
                 <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                          {totalItems}
                        </span>
                      )}
                 </div>
                <span className="text-[10px] font-medium">Cart</span>
            </Link>
        </div>
      )}

      {/* Footer code kept same as before ... */}
      <footer className="bg-[#172337] text-white pt-12 pb-8 text-[12px] mt-auto font-sans border-t border-[#454d5e]">
        <div className="container mx-auto px-4 max-w-[1200px] w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#454d5e] pb-12">
                <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <h3 className="text-[#878787] mb-3 uppercase font-medium tracking-wide">About</h3>
                        <ul className="space-y-2 font-medium">
                            <li><Link to="/info/contact-us" className="hover:underline cursor-pointer block hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link to="/info/about-us" className="hover:underline cursor-pointer block hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/info/careers" className="hover:underline cursor-pointer block hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="/info/swift-cart-stories" className="hover:underline cursor-pointer block hover:text-white transition-colors">Flipkart Stories</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-[#878787] mb-3 uppercase font-medium tracking-wide">Group Companies</h3>
                        <ul className="space-y-2 font-medium">
                            <li><Link to="/info/myntra" className="hover:underline cursor-pointer block hover:text-white transition-colors">Myntra</Link></li>
                            <li><Link to="/info/wholesale" className="hover:underline cursor-pointer block hover:text-white transition-colors">Flipkart Wholesale</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-[#878787] mb-3 uppercase font-medium tracking-wide">Help</h3>
                        <ul className="space-y-2 font-medium">
                            <li><Link to="/info/payments" className="hover:underline cursor-pointer block hover:text-white transition-colors">Payments</Link></li>
                            <li><Link to="/info/shipping" className="hover:underline cursor-pointer block hover:text-white transition-colors">Shipping</Link></li>
                            <li><Link to="/info/cancellation-returns" className="hover:underline cursor-pointer block hover:text-white transition-colors">Cancellation & Returns</Link></li>
                            <li><Link to="/info/faq" className="hover:underline cursor-pointer block hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-[#878787] mb-3 uppercase font-medium tracking-wide">Consumer Policy</h3>
                        <ul className="space-y-2 font-medium">
                            <li><Link to="/info/terms-of-use" className="hover:underline cursor-pointer block hover:text-white transition-colors">Terms Of Use</Link></li>
                            <li><Link to="/info/security" className="hover:underline cursor-pointer block hover:text-white transition-colors">Security</Link></li>
                            <li><Link to="/info/privacy" className="hover:underline cursor-pointer block hover:text-white transition-colors">Privacy</Link></li>
                            <li><Link to="/info/sitemap" className="hover:underline cursor-pointer block hover:text-white transition-colors">Sitemap</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-8 md:border-l border-[#454d5e] md:pl-8">
                    <div>
                        <h3 className="text-[#878787] mb-3 uppercase font-medium tracking-wide">Mail Us:</h3>
                        <p className="leading-relaxed text-white">
                            Flipkart Internet Private Limited,<br/>
                            Buildings Alyssa, Begonia &<br/>
                            Clove Embassy Tech Village,<br/>
                            Outer Ring Road, Devarabeesanahalli Village,<br/>
                            Bengaluru, 560103,<br/>
                            Karnataka, India
                        </p>
                    </div>
                     <div>
                        <h3 className="text-[#878787] mb-3 uppercase font-medium tracking-wide">Registered Office Address:</h3>
                        <p className="leading-relaxed text-white">
                            Flipkart Internet Private Limited,<br/>
                            Buildings Alyssa, Begonia &<br/>
                            Clove Embassy Tech Village,<br/>
                            Outer Ring Road, Devarabeesanahalli Village,<br/>
                            Bengaluru, 560103,<br/>
                            Karnataka, India<br/>
                            CIN: U51109KA2012PTC066107<br/>
                            Telephone: <span className="text-[#2874f0] font-bold">044-45614700</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-center md:text-left">
                 <div className="flex flex-wrap justify-center gap-6">
                     <Link to="/info/seller" className="flex items-center gap-2 cursor-pointer hover:underline"><span className="text-[#ffe500]"><Store className="w-4 h-4" /></span> Become a Seller</Link>
                     <Link to="/info/advertise" className="flex items-center gap-2 cursor-pointer hover:underline"><span className="text-[#ffe500]"><Megaphone className="w-4 h-4" /></span> Advertise</Link>
                     <Link to="/info/gift-cards" className="flex items-center gap-2 cursor-pointer hover:underline"><span className="text-[#ffe500]"><Gift className="w-4 h-4" /></span> Gift Cards</Link>
                     <Link to="/info/help-center" className="flex items-center gap-2 cursor-pointer hover:underline"><span className="text-[#ffe500]"><HelpCircle className="w-4 h-4" /></span> Help Center</Link>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 text-[13px]">
                    <span>© 2007-2025 Flipkart.com</span>
                 </div>
                 <div className="hidden lg:block">
                     <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/payment-method_69e7ec.svg" alt="Payment Methods" className="h-5" />
                 </div>
            </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-[4px] shadow-2xl w-full md:max-w-[850px] max-w-[360px] h-auto md:h-[550px] flex overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-300 flex-col md:flex-row">
            
            {/* Left Side */}
            <div className="hidden md:flex w-[40%] bg-[#2874f0] p-10 flex-col justify-between text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-[28px] font-bold mb-4 tracking-tight">
                  {authMode === 'login' ? 'Login' : 'Looks like you\'re new here!'}
                </h2>
                <p className="text-[18px] text-[#dbdbdb] leading-relaxed font-medium">
                  {authMode === 'login' 
                    ? 'Get access to your Orders, Wishlist and Recommendations' 
                    : 'Sign up with your mobile number to get started'}
                </p>
              </div>
              <div className="relative z-10 mt-auto mb-6 flex justify-center">
                    <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" alt="Login Illustration" className="w-full object-contain" />
              </div>
            </div>

            {/* Right Side (Form) */}
            <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center bg-white overflow-y-auto">
               <button onClick={closeLoginModal} className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-400 hover:text-slate-800 transition-colors p-2 z-10">
                 <X className="w-6 h-6" />
               </button>

               <div className="w-full max-w-sm mx-auto mt-4 md:mt-0">
                 <form onSubmit={handleAuthSubmit} className="space-y-6">
                  
                  {step === 'input' ? (
                    authMode === 'login' ? (
                        // LOGIN FORM
                        <div className="relative group">
                            <input
                                type="tel"
                                maxLength={10}
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                                className="w-full py-2.5 border-b border-slate-300 focus:border-[#2874f0] outline-none transition-colors peer bg-transparent z-10 relative text-slate-800 font-medium text-base md:text-sm"
                                placeholder=" "
                            />
                            <label className="absolute left-0 top-2.5 text-slate-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Enter Mobile number</label>
                        </div>
                    ) : (
                        // SIGNUP FORM
                        <div className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    required
                                    value={signupForm.name}
                                    onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                                    className="w-full py-2.5 border-b border-slate-300 focus:border-[#2874f0] outline-none transition-colors peer bg-transparent z-10 relative text-slate-800 font-medium text-base md:text-sm"
                                    placeholder=" "
                                />
                                <label className="absolute left-0 top-2.5 text-slate-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Name</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type="tel"
                                    required
                                    value={signupForm.mobile}
                                    onChange={(e) => setSignupForm({...signupForm, mobile: e.target.value.replace(/\D/g,'')})}
                                    maxLength={10}
                                    className="w-full py-2.5 border-b border-slate-300 focus:border-[#2874f0] outline-none transition-colors peer bg-transparent z-10 relative text-slate-800 font-medium text-base md:text-sm"
                                    placeholder=" "
                                />
                                <label className="absolute left-0 top-2.5 text-slate-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Mobile Number</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    value={signupForm.email}
                                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                                    className="w-full py-2.5 border-b border-slate-300 focus:border-[#2874f0] outline-none transition-colors peer bg-transparent z-10 relative text-slate-800 font-medium text-base md:text-sm"
                                    placeholder=" "
                                />
                                <label className="absolute left-0 top-2.5 text-slate-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Email ID</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={signupForm.password}
                                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                                    className="w-full py-2.5 border-b border-slate-300 focus:border-[#2874f0] outline-none transition-colors peer bg-transparent z-10 relative text-slate-800 font-medium pr-8 text-base md:text-sm"
                                    placeholder=" "
                                />
                                <label className="absolute left-0 top-2.5 text-slate-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Create Password</label>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                </button>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={signupForm.confirmPassword}
                                    onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                                    className="w-full py-2.5 border-b border-slate-300 focus:border-[#2874f0] outline-none transition-colors peer bg-transparent z-10 relative text-slate-800 font-medium pr-8 text-base md:text-sm"
                                    placeholder=" "
                                />
                                <label className="absolute left-0 top-2.5 text-slate-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Confirm Password</label>
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-2 text-slate-400 hover:text-slate-600">
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                </button>
                            </div>
                        </div>
                    )
                  ) : (
                    <div className="relative">
                       {/* OTP Step Content */}
                       <input
                         type="text"
                         required
                         value={otp}
                         onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 4) setOtp(val);
                         }}
                         maxLength={4}
                         className="w-full py-2.5 border-b border-slate-300 focus:border-[#2874f0] outline-none transition-colors peer text-center text-2xl tracking-[0.5em] font-bold bg-transparent z-10 relative text-slate-800"
                         placeholder=" "
                       />
                        <label className="absolute left-0 top-2.5 text-slate-500 text-base transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#2874f0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs w-full text-center pointer-events-none">
                            Enter OTP sent to {authMode === 'signup' ? signupForm.mobile : identifier}
                        </label>
                    </div>
                  )}

                  {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded border border-red-100 flex items-center justify-center text-center">{error}</div>}
                  {successMsg && <div className="text-green-600 text-sm font-bold bg-green-50 p-2 rounded border border-green-100 flex items-center justify-center animate-pulse text-center">{successMsg}</div>}

                  <div className="text-xs text-slate-500 leading-relaxed text-center mt-8">
                    By continuing, you agree to Flipkart's <span className="text-[#2874f0] font-medium cursor-pointer hover:underline">Terms of Use</span> and <span className="text-[#2874f0] font-medium cursor-pointer hover:underline">Privacy Policy</span>.
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#fb641b] hover:bg-[#f05a10] text-white font-bold py-3.5 shadow-md rounded-[2px] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-[15px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                        <>
                           <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                        </>
                    ) : (
                        step === 'input' 
                            ? (authMode === 'login' ? 'Request OTP' : 'Verify & Signup') 
                            : (authMode === 'login' ? 'Login' : 'Verify Mobile')
                    )}
                  </button>

                  {step === 'input' && (
                     <div className="text-center pt-2">
                        <span onClick={toggleAuthMode} className="text-[#2874f0] text-sm font-bold cursor-pointer hover:underline block p-2">
                           {authMode === 'login' ? 'New to Flipkart? Create an account' : 'Existing User? Log in'}
                        </span>
                     </div>
                  )}
                 </form>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

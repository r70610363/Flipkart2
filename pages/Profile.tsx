import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserIcon, Briefcase, Heart, LogOut, Edit2, Check, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Profile: React.FC = () => {
  const { user, logout, updateUserProfile } = useShop();
  const navigate = useNavigate();

  // If not logged in, redirect
  useEffect(() => {
      if (!user) {
          navigate('/');
      }
  }, [user, navigate]);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      mobile: '',
      gender: '' as 'Male' | 'Female' | ''
  });

  // Editing State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name || '',
              email: user.email || '',
              mobile: user.mobile || '',
              gender: user.gender || ''
          });
      }
  }, [user]);

  const handleSaveInfo = async () => {
      if (!user) return;
      await updateUserProfile({
          ...user,
          name: formData.name,
          gender: formData.gender as 'Male' | 'Female'
      });
      setIsEditingInfo(false);
  };

  const handleSaveContact = async () => {
      if (!user) return;
      await updateUserProfile({
          ...user,
          email: formData.email,
          mobile: formData.mobile
      });
      setIsEditingContact(false);
  };

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-0 md:px-4 py-4 md:py-8 min-h-screen bg-[#f1f3f6]">
        <div className="flex flex-col md:flex-row gap-4">
            
            {/* Left Sidebar */}
            <div className="w-full md:w-[280px] shrink-0">
                {/* User Card */}
                <div className="bg-white shadow-sm rounded-[2px] p-4 flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                            alt="Avatar" 
                            className="w-full h-full"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Hello,</div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="bg-white shadow-sm rounded-[2px] overflow-hidden">
                    <div className="flex items-center gap-4 p-4 border-b border-slate-100 text-[#2874f0] font-bold text-sm bg-blue-50">
                        <UserIcon className="w-5 h-5" /> Account Settings
                    </div>
                    <div className="flex flex-col text-sm text-slate-600">
                        <button className="px-12 py-3 text-left hover:bg-slate-50 text-[#2874f0] font-medium bg-blue-50/50">Profile Information</button>
                        <button className="px-12 py-3 text-left hover:bg-slate-50">Manage Addresses</button>
                        <button className="px-12 py-3 text-left hover:bg-slate-50">PAN Card Information</button>
                    </div>

                    <div className="flex items-center gap-4 p-4 border-b border-slate-100 text-slate-500 font-bold text-sm border-t">
                        <Briefcase className="w-5 h-5" /> My Orders
                    </div>
                    <button onClick={() => navigate('/my-orders')} className="w-full px-12 py-3 text-left hover:bg-slate-50 text-sm text-slate-600 block">View All Orders</button>

                    <div className="flex items-center gap-4 p-4 border-b border-slate-100 text-slate-500 font-bold text-sm border-t">
                        <Heart className="w-5 h-5" /> My Stuff
                    </div>
                    <div className="flex flex-col text-sm text-slate-600">
                        <button onClick={() => navigate('/wishlist')} className="px-12 py-3 text-left hover:bg-slate-50">My Wishlist</button>
                        <button className="px-12 py-3 text-left hover:bg-slate-50">My Coupons</button>
                        <button className="px-12 py-3 text-left hover:bg-slate-50">My Reviews & Ratings</button>
                    </div>

                    <div className="border-t border-slate-100 mt-2">
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-[#2874f0] font-bold text-sm transition-colors">
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white shadow-sm rounded-[2px] p-6">
                
                {/* Personal Information */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg text-slate-800">Personal Information</h2>
                        {!isEditingInfo ? (
                            <button onClick={() => setIsEditingInfo(true)} className="text-[#2874f0] text-sm font-medium hover:underline">Edit</button>
                        ) : (
                            <button onClick={() => setIsEditingInfo(false)} className="text-[#2874f0] text-sm font-medium hover:underline">Cancel</button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 block mb-1">First Name</label>
                            <input 
                                type="text" 
                                disabled={!isEditingInfo}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={`w-full p-2 border rounded ${isEditingInfo ? 'border-slate-300 bg-white' : 'border-transparent bg-slate-50'}`}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 block mb-1">Gender</label>
                            <div className="flex gap-6 mt-2">
                                <label className={`flex items-center gap-2 cursor-pointer ${!isEditingInfo && 'opacity-60 cursor-not-allowed'}`}>
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="Male" 
                                        checked={formData.gender === 'Male'} 
                                        onChange={() => setFormData({...formData, gender: 'Male'})}
                                        disabled={!isEditingInfo}
                                        className="accent-[#2874f0]"
                                    />
                                    <span className="text-sm">Male</span>
                                </label>
                                <label className={`flex items-center gap-2 cursor-pointer ${!isEditingInfo && 'opacity-60 cursor-not-allowed'}`}>
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="Female" 
                                        checked={formData.gender === 'Female'}
                                        onChange={() => setFormData({...formData, gender: 'Female'})}
                                        disabled={!isEditingInfo}
                                        className="accent-[#2874f0]"
                                    />
                                    <span className="text-sm">Female</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {isEditingInfo && (
                        <div className="mt-4">
                            <button onClick={handleSaveInfo} className="bg-[#2874f0] text-white px-6 py-2 rounded-[2px] font-bold text-sm shadow-sm hover:bg-blue-600">SAVE</button>
                        </div>
                    )}
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg text-slate-800">Contact Information</h2>
                        {!isEditingContact ? (
                            <button onClick={() => setIsEditingContact(true)} className="text-[#2874f0] text-sm font-medium hover:underline">Edit</button>
                        ) : (
                            <button onClick={() => setIsEditingContact(false)} className="text-[#2874f0] text-sm font-medium hover:underline">Cancel</button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 block mb-1">Email Address</label>
                            <input 
                                type="email" 
                                disabled={!isEditingContact}
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`w-full p-2 border rounded ${isEditingContact ? 'border-slate-300 bg-white' : 'border-transparent bg-slate-50'}`}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 block mb-1">Mobile Number</label>
                            <input 
                                type="tel" 
                                disabled={!isEditingContact}
                                value={formData.mobile}
                                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                className={`w-full p-2 border rounded ${isEditingContact ? 'border-slate-300 bg-white' : 'border-transparent bg-slate-50'}`}
                            />
                        </div>
                    </div>

                    {isEditingContact && (
                        <div className="mt-4">
                            <button onClick={handleSaveContact} className="bg-[#2874f0] text-white px-6 py-2 rounded-[2px] font-bold text-sm shadow-sm hover:bg-blue-600">SAVE</button>
                        </div>
                    )}
                </div>

                {/* FAQs */}
                <div className="mt-12">
                    <h3 className="font-bold text-base text-slate-800 mb-4">FAQs</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-1">What happens when I update my email address (or mobile number)?</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-1">When will my Flipkart account be updated with the new email address (or mobile number)?</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
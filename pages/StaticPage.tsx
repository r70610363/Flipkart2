import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Info, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';

const PAGE_CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
  'contact-us': {
    title: 'Contact Us',
    content: (
      <div className="space-y-6">
        <p>
          We are here to help you! Whether you have a question about your order, need help with a return, or just want to say hello, our support team is ready to assist.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white border border-slate-200 p-4 rounded flex items-start gap-3">
              <Phone className="w-6 h-6 text-[#2874f0] mt-1" />
              <div>
                 <h3 className="font-bold text-slate-800">Customer Support</h3>
                 <p className="text-sm text-slate-600">1800 202 9898 (Toll Free)</p>
                 <p className="text-sm text-slate-600">044-45614700</p>
              </div>
           </div>
           <div className="bg-white border border-slate-200 p-4 rounded flex items-start gap-3">
              <Mail className="w-6 h-6 text-[#2874f0] mt-1" />
              <div>
                 <h3 className="font-bold text-slate-800">Email Us</h3>
                 <p className="text-sm text-slate-600">support@flipkart.com</p>
                 <p className="text-sm text-slate-600">queries@flipkart.com</p>
              </div>
           </div>
           <div className="bg-white border border-slate-200 p-4 rounded flex items-start gap-3">
              <Clock className="w-6 h-6 text-[#2874f0] mt-1" />
              <div>
                 <h3 className="font-bold text-slate-800">Operating Hours</h3>
                 <p className="text-sm text-slate-600">Mon - Sat: 9:00 AM - 7:00 PM</p>
                 <p className="text-sm text-slate-600">Sunday: Closed</p>
              </div>
           </div>
           <div className="bg-white border border-slate-200 p-4 rounded flex items-start gap-3">
              <MapPin className="w-6 h-6 text-[#2874f0] mt-1" />
              <div>
                 <h3 className="font-bold text-slate-800">Headquarters</h3>
                 <p className="text-sm text-slate-600">Flipkart Internet Pvt Ltd, Bengaluru, Karnataka, India.</p>
              </div>
           </div>
        </div>
      </div>
    )
  },
  'about-us': {
    title: 'About Us',
    content: (
      <div className="space-y-4">
        <p>
          Launched in 2007, <strong>Flipkart</strong> is India's leading e-commerce marketplace. We believe in the power of technology to transform the shopping experience.
        </p>
        <p>
          Our mission is to provide a seamless, enjoyable, and reliable shopping experience to millions of Indians. With a vast selection of products across categories like Electronics, Fashion, Home, and Beauty, we bring the market to your fingertips.
        </p>
        <h3 className="font-bold text-lg text-slate-800 mt-4">Our Values</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Customer Obsession:</strong> We start with the customer and work backwards.</li>
          <li><strong>Transparency:</strong> No hidden fees, no fake reviews.</li>
          <li><strong>Innovation:</strong> Constantly improving our platform for speed and ease.</li>
        </ul>
      </div>
    )
  },
  'shipping': {
    title: 'Shipping Policy',
    content: (
      <div className="space-y-4">
        <p>At Flipkart, we take great care in delivering your products to you, and we partner only with reputed national couriers.</p>
        <h3 className="font-bold text-slate-800">Delivery Timelines</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
           <li><strong>Metro Cities:</strong> 2-3 Business Days</li>
           <li><strong>Rest of India:</strong> 4-7 Business Days</li>
           <li><strong>Remote Areas:</strong> 7+ Business Days</li>
        </ul>
        <h3 className="font-bold text-slate-800 mt-4">Shipping Charges</h3>
        <p>
           Shipping is <strong>FREE</strong> for all orders above ₹500. For orders below ₹500, a nominal fee of ₹50 is applied to cover logistics costs.
        </p>
      </div>
    )
  },
  'cancellation-returns': {
    title: 'Cancellation & Returns',
    content: (
      <div className="space-y-4">
         <p>We offer a "No Questions Asked" return policy for most categories within the specified return window.</p>
         <div className="border rounded p-4 bg-slate-50">
            <h4 className="font-bold mb-2">Return Windows</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
               <li><strong>Lifestyle & Fashion:</strong> 30 Days</li>
               <li><strong>Electronics:</strong> 7 Days Replacement</li>
               <li><strong>Home & Furniture:</strong> 10 Days</li>
            </ul>
         </div>
         <p>Refunds are processed within 5-7 business days after the quality check of the returned item is completed.</p>
      </div>
    )
  },
  'privacy': {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-4">
        <p>We value the trust you place in us. That's why we insist upon the highest standards for secure transactions and customer information privacy.</p>
        <h3 className="font-bold text-slate-800">Collection of Personally Identifiable Information</h3>
        <p>We collect email address, name, phone number, etc. when you set up a free account with Flipkart. While you can browse some sections of our site without being a registered member, certain activities (such as placing an order) do require registration.</p>
        <h3 className="font-bold text-slate-800">Security Precautions</h3>
        <p>Our site has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Whenever you change or access your account information, we offer the use of a secure server.</p>
      </div>
    )
  },
  'terms-of-use': {
    title: 'Terms of Use',
    content: (
      <div className="space-y-4">
         <p>Welcome to Flipkart. By using our website, you agree to the following terms and conditions.</p>
         <ul className="list-decimal pl-5 space-y-2">
            <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account and password.</li>
            <li><strong>Pricing:</strong> Prices for products are described on our Website and are incorporated into these Terms by reference. All prices are in Indian Rupees.</li>
            <li><strong>Termination:</strong> We may suspend or terminate your use of the Website or any Service if we believe, in our sole and absolute discretion, that you have breached any of the Terms.</li>
         </ul>
      </div>
    )
  },
  'payments': {
    title: 'Payments',
    content: (
       <div className="space-y-4">
          <p>Flipkart supports a wide array of payment methods to ensure a seamless checkout experience.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-3 border rounded flex items-center gap-3"><CheckCircle className="text-green-600 w-5 h-5"/> Credit/Debit Cards (Visa, Mastercard, Rupay)</div>
             <div className="p-3 border rounded flex items-center gap-3"><CheckCircle className="text-green-600 w-5 h-5"/> Net Banking (All Major Banks)</div>
             <div className="p-3 border rounded flex items-center gap-3"><CheckCircle className="text-green-600 w-5 h-5"/> UPI (Google Pay, PhonePe, Paytm)</div>
             <div className="p-3 border rounded flex items-center gap-3"><CheckCircle className="text-green-600 w-5 h-5"/> Cash on Delivery (COD)</div>
             <div className="p-3 border rounded flex items-center gap-3"><CheckCircle className="text-green-600 w-5 h-5"/> EMI Options</div>
          </div>
       </div>
    )
  },
  'security': {
     title: 'Security',
     content: (
        <div className="space-y-4">
           <p>Your online transaction on Flipkart is secure with the highest levels of transaction security currently available on the Internet.</p>
           <p>All your personal information is encrypted using 256-bit encryption technology. We do not store your card details on our servers; they are processed directly by PCI-DSS compliant payment gateways.</p>
        </div>
     )
  },
  'careers': {
     title: 'Careers at Flipkart',
     content: (
        <div className="space-y-4">
           <p>Join us in building the future of e-commerce! We are looking for passionate individuals who love solving complex problems.</p>
           <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-[#2874f0]">Current Openings</h4>
              <ul className="mt-2 space-y-1 list-disc pl-5">
                 <li>Senior Frontend Engineer (React)</li>
                 <li>Backend Developer (Node.js)</li>
                 <li>Product Manager</li>
                 <li>UX Designer</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">Send your resume to <strong>careers@flipkart.com</strong></p>
           </div>
        </div>
     )
  }
};

export const StaticPage: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  
  // Default fallback if page not found in map
  const pageKey = page || '';
  const data = PAGE_CONTENT[pageKey] || {
    title: pageKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    content: (
      <p>Information regarding {pageKey.replace(/-/g, ' ')} will be updated shortly. Please contact customer support for immediate assistance.</p>
    )
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[60vh]">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2874f0] mb-6 font-medium text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="bg-white p-6 md:p-10 rounded-[4px] shadow-sm border border-slate-100 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">{data.title}</h1>
        
        <div className="prose max-w-none text-slate-600 space-y-6 leading-relaxed text-sm md:text-base">
          {/* Dynamic Content */}
          {data.content}
          
          {/* Generic Footer Box for all info pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-6 border-t border-slate-100">
             <div className="p-6 bg-blue-50 rounded border border-blue-100">
                <h3 className="font-bold text-[#2874f0] mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" /> Need Help?
                </h3>
                <p className="text-sm">
                   Can't find what you're looking for? Reach out to our support team directly.
                </p>
             </div>
             <div className="p-6 bg-green-50 rounded border border-green-100">
                <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Our Commitment
                </h3>
                <p className="text-sm">
                   Flipkart ensures 100% transparency and security in all operations.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
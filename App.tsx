

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Admin } from './pages/Admin';
import { StaticPage } from './pages/StaticPage';
import { CheckoutAddress } from './pages/CheckoutAddress';
import { OrderSummary } from './pages/OrderSummary';
import { Payment } from './pages/Payment';
import { Wishlist } from './pages/Wishlist';
import { OrderSuccess } from './pages/OrderSuccess';
import { MyOrders } from './pages/MyOrders';
import { Profile } from './pages/Profile';
import { ScrollToTop } from './components/ScrollToTop';
import { TrackOrder } from './pages/TrackOrder';

function App() {
  return (
    <ShopProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<CheckoutAddress />} />
                <Route path="/order-summary" element={<OrderSummary />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/track-order/:orderId" element={<TrackOrder />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/info/:page" element={<StaticPage />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </HashRouter>
    </ShopProvider>
  );
}

export default App;
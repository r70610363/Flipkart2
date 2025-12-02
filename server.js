
const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');
require('dotenv').config();

const app = express();

// --- In-memory store for OTPs (for development only) ---
const otpStore = {}; // Store: { mobile: { code: '1234', expiresAt: 1678886400000 } }

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Cashfree Initialization ---
Cashfree.XClientId = process.env.CASHFREE_APP_ID || "";
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || "";
Cashfree.XEnvironment = 'PROD';

// --- API Endpoints ---

app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// 1. Send OTP
app.post('/send-otp', (req, res) => {
    const { mobile } = req.body;
    if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    otpStore[mobile] = { code: otp, expiresAt };

    // IMPORTANT: In a real-world scenario, you would use an SMS gateway service here.
    console.log(`[Server] OTP for ${mobile} is ${otp}. This will NOT be sent to the client.`);

    // Send a generic success message WITHOUT the OTP
    res.json({ success: true, message: `OTP sent to ${mobile}.` });
});

// 2. Verify OTP
app.post('/verify-otp', (req, res) => {
    const { mobile, code } = req.body;
    if (!mobile || !code) {
        return res.status(400).json({ success: false, message: 'Mobile number and OTP code are required' });
    }

    const storedOtp = otpStore[mobile];

    if (storedOtp && storedOtp.code === code && Date.now() < storedOtp.expiresAt) {
        // OTP is correct and not expired
        delete otpStore[mobile]; // Clean up used OTP
        res.json({ success: true, message: 'OTP verified successfully' });
    } else if (storedOtp && Date.now() >= storedOtp.expiresAt) {
        res.status(400).json({ success: false, message: 'OTP has expired' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

// 3. Initiate Payment
app.post('/payment/initiate', async (req, res) => {
    const { amount, orderId, email, name } = req.body;

    try {
        const orderRequest = {
            order_id: orderId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
                customer_id: `customer_${Date.now()}`,
                customer_email: email,
                customer_phone: '9999999999', // Placeholder
                customer_name: name,
            },
            order_meta: {
                return_url: `https://9000-firebase-flipkart-1-1764653036675.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev/order-success/{order_id}`,
            },
        };

        const response = await Cashfree.PGCreateOrder('2023-08-01', orderRequest);
        res.json({ payment_session_id: response.data.payment_session_id });

    } catch (error) {
        console.error('Cashfree Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create payment session' });
    }
});

// Mock API for products
app.get('/products', (req, res) => {
    res.json([
        { id: 'p-1', title: 'Test Product 1', price: 100, originalPrice: 120, category: 'Test', image: 'https://via.placeholder.com/150' },
        { id: 'p-2', title: 'Test Product 2', price: 250, originalPrice: 300, category: 'Test', image: 'https://via.placeholder.com/150' }
    ]);
});

// Mock API for orders
app.get('/orders', (req, res) => {
    res.json([]);
});

// --- Server Start ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Development API Server is running on http://localhost:${PORT}`);
});

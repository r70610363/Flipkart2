
import { API_BASE_URL, ENABLE_API } from './config';

// In-memory fallback store for simulation
const mockOtpStore: Record<string, { code: string; expiresAt: number }> = {};

export const sendOtp = async (mobileNumber: string): Promise<{ success: boolean; message: string; devCode?: string }> => {
    
    // 1. Try connecting to Real Backend if Enabled
    if (ENABLE_API) {
        try {
            // This is where your future Node.js backend will trigger the Email/SMS
            const response = await fetch(`${API_BASE_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: mobileNumber })
            });

            const data = await response.json();
            if (data.success) {
                return { success: true, message: data.message, devCode: data.devCode };
            }
        } catch (error) {
            console.log("Backend not reachable. Switching to Simulation Mode.");
        }
    }

    // 2. Fallback: Simulation Mode (Frontend Only)
    return new Promise((resolve) => {
        // Generate Random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
        
        console.log(`[Mock Backend] Triggering Email/SMS to ${mobileNumber} with code: ${otp}`);
        
        mockOtpStore[mobileNumber] = {
            code: otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        // Simulate network delay
        setTimeout(() => {
            resolve({ 
                success: true, 
                message: `OTP Sent to ${mobileNumber}`,
                devCode: otp 
            });
        }, 1000);
    });
};

export const verifyOtp = async (mobileNumber: string, code: string): Promise<{ success: boolean; message: string }> => {
    
    if (ENABLE_API) {
        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: mobileNumber, code })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                return { success: true, message: "Verification Successful" };
            }
        } catch (error) {
            // Ignore backend error and check local mock
        }
    }

    // 2. Fallback: Check Simulation Store
    return new Promise((resolve) => {
        setTimeout(() => {
            const session = mockOtpStore[mobileNumber];
            
            // STRICT CHECK: Code must match generated OTP
            if (session && session.code === code) {
                resolve({ success: true, message: "Verification Successful" });
            } else {
                resolve({ success: false, message: "Invalid OTP" });
            }
        }, 800);
    });
};

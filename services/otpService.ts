
import { API_BASE_URL, ENABLE_API } from './config';

// In-memory fallback store for simulation
const mockOtpStore: Record<string, { code: string; expiresAt: number }> = {};

// IMPORTANT: In a real app, never return the OTP code in the response.
// This is only for simulation purposes.
export const sendOtp = async (mobileNumber: string): Promise<{ success: boolean; message: string }> => {
    
    // 1. Try connecting to Real Backend if Enabled
    if (ENABLE_API) {
        try {
            const response = await fetch(`${API_BASE_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: mobileNumber })
            });

            const data = await response.json();
            if (data.success) {
                // The backend should NEVER return the OTP. Just a confirmation.
                return { success: true, message: data.message };
            }
        } catch (error) {
            console.log("Backend not reachable for OTP. Switching to Simulation Mode.");
        }
    }

    // 2. Fallback: Simulation Mode (Frontend Only)
    return new Promise((resolve) => {
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
        
        // In a real scenario, this console.log would not exist. The OTP would be sent via SMS/Email only.
        console.log(`[Mock Backend] OTP for ${mobileNumber} is: ${otp}`);
        
        mockOtpStore[mobileNumber] = {
            code: otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // OTP expires in 5 minutes
        };

        setTimeout(() => {
            // The OTP is no longer returned in the response for security reasons.
            resolve({ 
                success: true, 
                message: `OTP has been sent to ${mobileNumber}`
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
            return { success: data.success, message: data.message };

        } catch (error) {
            console.log("Backend not reachable. Verifying with Mock OTP.");
        }
    }

    // 2. Fallback: Check Simulation Store
    return new Promise((resolve) => {
        setTimeout(() => {
            const session = mockOtpStore[mobileNumber];
            
            if (session && session.code === code && Date.now() < session.expiresAt) {
                delete mockOtpStore[mobileNumber]; // OTP is used, delete it.
                resolve({ success: true, message: "Verification Successful" });
            } else if (session && Date.now() >= session.expiresAt) {
                resolve({ success: false, message: "OTP has expired" });
            } else {
                resolve({ success: false, message: "Invalid OTP" });
            }
        }, 800);
    });
};

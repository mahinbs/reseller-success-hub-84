/**
 * Application Configuration
 * Centralized configuration for payment gateways, API keys, and other settings
 */

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
    // Replace with your actual Razorpay Key ID
    // You can get this from your Razorpay Dashboard > Account & Settings > API Keys
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_here',

    // Currency configuration
    currency: 'INR',

    // Company details
    name: 'BoostMySites',
    description: 'AI-Powered Digital Services',

    // Theme configuration
    theme: {
        color: '#4F46E5' // Primary color from Tailwind config
    },

    // Checkout configuration
    checkout: {
        timeout: 900, // 15 minutes in seconds
        retry: {
            enabled: true,
            max_count: 3
        }
    }
};

// Payment Configuration
export const PAYMENT_CONFIG = {
    // Order expiry time in milliseconds (15 minutes)
    orderExpiryTime: 15 * 60 * 1000,

    // Supported payment methods
    supportedMethods: [
        'card',
        'netbanking',
        'wallet',
        'upi',
        'emi',
        'paylater'
    ],

    // Status refresh interval in milliseconds
    statusRefreshInterval: 5000,

    // Maximum retry attempts for failed payments
    maxRetryAttempts: 3
};

// GST Configuration
export const GST_CONFIG = {
    rate: 0.18, // 18% GST
    displayText: '+ 18% GST applicable'
};

// API Configuration
export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
};

// App Configuration
export const APP_CONFIG = {
    name: 'BoostMySites',
    version: '1.0.0',
    supportEmail: 'support@boostmysites.com',
    supportPhone: '+91 XXX XXX XXXX',

    // Feature flags
    features: {
        razorpayPayments: true,
        emailInvoices: true,
        downloadInvoices: true,
        paymentRetry: true,
        realTimeStatusUpdates: true
    }
};

// Environment helper
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Validation helper for required environment variables
export const validateEnvironment = () => {
    const missingVars: string[] = [];

    if (!RAZORPAY_CONFIG.key || RAZORPAY_CONFIG.key === 'rzp_test_your_key_here') {
        missingVars.push('VITE_RAZORPAY_KEY_ID');
    }

    if (missingVars.length > 0) {
        console.warn('Missing environment variables:', missingVars);
        console.warn('Please check your .env file and ensure all required variables are set.');
    }

    return missingVars.length === 0;
}; 
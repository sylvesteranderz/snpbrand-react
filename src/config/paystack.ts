// Paystack Configuration
// Replace these with your actual Paystack keys

export const PAYSTACK_CONFIG = {
  // Test keys (for development)
  PUBLIC_KEY: 'pk_test_your_paystack_public_key_here',
  
  // Live keys (for production)
  // PUBLIC_KEY: 'pk_live_your_live_paystack_public_key_here',
  
  // Currency (NGN for Nigeria, USD for US, etc.)
  CURRENCY: 'NGN',
  
  // Additional configuration
  CHANNELS: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
}

// Instructions for setup:
// 1. Sign up at https://paystack.com
// 2. Get your public key from the dashboard
// 3. Replace 'pk_test_your_paystack_public_key_here' with your actual public key
// 4. For production, use your live public key instead

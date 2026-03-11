export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_paystack_public_key_here',
  CURRENCY: 'GHS',
  CHANNELS: ['card', 'mobile_money'],
}

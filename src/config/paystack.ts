export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  CURRENCY: 'GHS',
  CHANNELS: ['card', 'mobile_money'],
}

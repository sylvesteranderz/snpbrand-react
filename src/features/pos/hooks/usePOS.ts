import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  id: string;
  name: string;
  barcode: string;
  price: number;
  category: string;
  cartQuantity: number;
}

export function usePOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

  const scanBarcode = async (barcode: string) => {
    try {
      setLoading(true);
      const { data: product, error: prodErr } = await supabase!
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();
      
      if (prodErr || !product) {
        throw new Error('Product not found');
      }

      const stockQty = product.stock_quantity || 0;
      if (stockQty <= 0 || product.in_stock === false) {
        throw new Error('Product out of stock');
      }

      // Check if item is already in cart and if we have enough inventory for one more
      const existing = cart.find(item => item.id === product.id);
      if (existing && existing.cartQuantity >= stockQty) {
          throw new Error('Insufficient inventory for more quantity');
      }

      addToCart(product);
      return { success: true, product };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.id === productId ? { ...item, cartQuantity: qty } : item));
  };

  const checkout = async (paymentMethod: string, amountPaid: number, cashierId: string) => {
    setLoading(true);
    try {
      if (cart.length === 0) throw new Error('Cart is empty');

      // 1. Insert into sales
      const { data: sale, error: saleErr } = await supabase!
        .from('sales')
        .insert({
          total: total,
          payment_method: paymentMethod,
          cashier_id: cashierId,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (saleErr) throw saleErr;

      // 2. Insert into sales_items
      const salesItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.cartQuantity,
        price: item.price,
      }));

      const { error: itemsErr } = await supabase!.from('sales_items').insert(salesItems);
      if (itemsErr) throw itemsErr;

      // 3. Deduct inventory quantities directly from products
      for (const item of cart) {
        const { data: currentProd } = await supabase!
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();
          
        if (currentProd) {
          const newQty = Math.max(0, (currentProd.stock_quantity || 0) - item.cartQuantity);
          await supabase!
            .from('products')
            .update({ 
              stock_quantity: newQty,
              in_stock: newQty > 0
            })
            .eq('id', item.id);
        }
      }

      // 4. Insert into payments
      const { error: payErr } = await supabase!.from('payments').insert({
        sale_id: sale.id,
        amount_paid: amountPaid,
        payment_method: paymentMethod,
        date: new Date().toISOString()
      });
      if (payErr) throw payErr;

      // Generates receipt
      const receiptData = {
        saleId: sale.id,
        date: new Date().toISOString(),
        items: [...cart],
        total,
        amountPaid,
        change: paymentMethod === 'Cash' ? amountPaid - total : 0,
        paymentMethod
      };

      setReceipt(receiptData);
      setCart([]);
      return { success: true };
    } catch (err: any) {
      console.error('Checkout error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearReceipt = () => setReceipt(null);

  return { cart, total, loading, receipt, scanBarcode, addToCart, removeFromCart, updateQty, checkout, clearReceipt };
}

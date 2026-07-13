import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface OrderItem {
  product_id?: string;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  fulfillment_location: string | null;
  created_at: string;
}

// Monotonically increasing counter so every channel name is unique,
// even across React 18 Strict Mode double-invokes or hot reloads.
let channelCounter = 0;

const parseItems = (raw: any, context: string): OrderItem[] => {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  } catch (e) {
    console.error(`Failed to parse order items (${context}):`, e);
    return [];
  }
};

const formatOrder = (raw: any): Order => ({
  ...raw,
  items: parseItems(raw.items, raw.order_number),
});

export const useAccraOrders = (locationName: 'Kumasi' | 'Accra') => {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string | null>(null);

  // Stable ref so the realtime callback always sees the current locationName
  // without needing to be listed as an effect dependency.
  const locationNameRef = useRef(locationName);
  useEffect(() => { locationNameRef.current = locationName; }, [locationName]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('orders')
        .select('*')
        .neq('status', 'delivered');

      if (locationName === 'Accra') {
        q = q.eq('fulfillment_location', 'Accra');
      } else {
        q = q.or('fulfillment_location.eq.Kumasi,fulfillment_location.is.null');
      }

      const { data, error: err } = await q.order('created_at', { ascending: true });
      if (err) throw err;
      setOrders((data || []).map(formatOrder));
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(
        !navigator.onLine
          ? 'You appear to be offline — pull to refresh'
          : (err.message || 'Failed to load orders.')
      );
    } finally {
      setLoading(false);
    }
  }, [locationName]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Realtime subscription — unique channel name per mount prevents the
  // "cannot add postgres_changes callbacks after subscribe()" error that
  // React 18 Strict Mode triggers by mounting effects twice.
  useEffect(() => {
    const channelName = `orders-changes-${locationName}-${++channelCounter}`;

    const belongsHere = (order: Order) => {
      const loc = order.fulfillment_location;
      return locationNameRef.current === 'Accra'
        ? loc === 'Accra'
        : loc === 'Kumasi' || loc === null || loc === '';
    };

    // All .on() calls MUST be chained before .subscribe() — never after.
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          const { eventType } = payload;
          const newRow = payload.new as Order;
          const oldRow = payload.old as Order;

          if (eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== oldRow.id));
            return;
          }

          if (eventType === 'INSERT') {
            if (newRow.status !== 'delivered' && belongsHere(newRow)) {
              const formatted = formatOrder(newRow);
              setOrders(prev =>
                prev.some(o => o.id === formatted.id) ? prev : [...prev, formatted]
              );
            }
            return;
          }

          if (eventType === 'UPDATE') {
            if (newRow.status === 'delivered' || !belongsHere(newRow)) {
              // Delivered or reassigned away — remove from this queue
              setOrders(prev => prev.filter(o => o.id !== newRow.id));
            } else {
              const formatted = formatOrder(newRow);
              setOrders(prev => {
                if (prev.some(o => o.id === formatted.id)) {
                  return prev.map(o => o.id === formatted.id ? formatted : o);
                }
                // Reassigned into this location — insert and keep sorted
                return [...prev, formatted].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationName]); // locationName triggers a full channel rebuild on switch

  return { orders, loading, error, refresh: fetchOrders };
};
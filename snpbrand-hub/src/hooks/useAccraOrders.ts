import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface OrderItem {
  product_id?: string;
  product_name?: string;
  name?: string;
  size?: string;
  selected_size?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_info?: any;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  fulfillment_location: string | null;
  created_at: string;
  total_amount: number;
  shipping_address: any;
}

export const useAccraOrders = (locationName: 'Kumasi' | 'Accra') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pull all orders that are not delivered, regardless of location
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'delivered')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formattedOrders: Order[] = (data || []).map((order: any) => {
        let parsedItems: OrderItem[] = [];
        try {
          parsedItems = typeof order.items === 'string'
            ? JSON.parse(order.items)
            : (order.items || []);
        } catch (e) {
          console.error(`Failed to parse order items for order ${order.order_number}:`, e);
        }
        return {
          ...order,
          items: parsedItems,
        };
      });

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      if (!navigator.onLine) {
        setError('You appear to be offline — pull to refresh');
      } else {
        setError(err.message || 'Failed to load orders.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`orders-realtime-changes-${locationName}-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload: any) => {
          const newRow = payload.new as Order;
          const oldRow = payload.old as Order;
          const eventType = payload.eventType;

          if (eventType === 'DELETE') {
            setOrders((prev) => prev.filter((order) => order.id !== oldRow.id));
          } else if (eventType === 'INSERT') {
            if (newRow.status !== 'delivered') {
              let parsedItems: OrderItem[] = [];
              try {
                parsedItems = typeof newRow.items === 'string'
                  ? JSON.parse(newRow.items as any)
                  : (newRow.items || []);
              } catch (e) {
                console.error(`Failed to parse inserted order items:`, e);
              }
              const formattedNewRow: Order = {
                ...newRow,
                items: parsedItems,
              };

              setOrders((prev) => {
                if (prev.some((o) => o.id === formattedNewRow.id)) return prev;
                const updatedList = [formattedNewRow, ...prev];
                return updatedList.sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              });
            }
          } else if (eventType === 'UPDATE') {
            if (newRow.status === 'delivered') {
              setOrders((prev) => prev.filter((order) => order.id !== newRow.id));
            } else {
              let parsedItems: OrderItem[] = [];
              try {
                parsedItems = typeof newRow.items === 'string'
                  ? JSON.parse(newRow.items as any)
                  : (newRow.items || []);
              } catch (e) {
                console.error(`Failed to parse updated order items:`, e);
              }
              const formattedNewRow: Order = {
                ...newRow,
                items: parsedItems,
              };

              setOrders((prev) => {
                const exists = prev.some((o) => o.id === formattedNewRow.id);
                let updatedList;
                if (exists) {
                  updatedList = prev.map((order) =>
                    order.id === formattedNewRow.id ? formattedNewRow : order
                  );
                } else {
                  updatedList = [formattedNewRow, ...prev];
                }
                return updatedList.sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
  }, [locationName]);

  return { orders, setOrders, loading, error, refresh: fetchOrders };
};

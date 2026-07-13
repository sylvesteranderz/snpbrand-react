import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface StockItem {
  product_id: string;
  product_name: string;
  size: string;
  location_id: string;
  quantity: number;
}

export const useAccraStock = (locationId: string | null) => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async (locId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('stock_levels')
        .select(`
          product_id,
          size,
          location_id,
          quantity,
          products (
            name
          )
        `)
        .eq('location_id', locId);

      if (err) throw err;

      const formattedStock: StockItem[] = (data || []).map((item: any) => ({
        product_id: item.product_id,
        product_name: item.products?.name || 'Unknown Product',
        size: item.size,
        location_id: item.location_id,
        quantity: item.quantity,
      }));

      setStock(formattedStock);
    } catch (err: any) {
      console.error('Failed to fetch stock levels:', err);
      if (!navigator.onLine) {
        setError('You appear to be offline — pull to refresh');
      } else {
        setError(err.message || 'Failed to load stock levels.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (locationId) {
      await fetchStock(locationId);
    }
  }, [locationId, fetchStock]);

  useEffect(() => {
    if (locationId) {
      fetchStock(locationId);
    } else {
      setStock([]);
      setLoading(false);
    }
  }, [locationId, fetchStock]);

  // Set up realtime subscription
  useEffect(() => {
    if (!locationId) return;

    const channel = supabase
      .channel(`stock-realtime-${locationId}-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_levels',
          filter: `location_id=eq.${locationId}`
        },
        async (payload: any) => {
          const newRow = payload.new;
          const oldRow = payload.old;
          const eventType = payload.eventType;

          if (eventType === 'DELETE') {
            setStock((prev) =>
              prev.filter(
                (item) =>
                  !(item.product_id === oldRow.product_id && item.size === oldRow.size)
              )
            );
          } else if (eventType === 'INSERT' || eventType === 'UPDATE') {
            // Find if product name is already in state
            let pName = 'Unknown Product';
            setStock((prev) => {
              const existingItem = prev.find((item) => item.product_id === newRow.product_id);
              if (existingItem) {
                pName = existingItem.product_name;
              }
              
              const itemIdx = prev.findIndex(
                (item) =>
                  item.product_id === newRow.product_id && item.size === newRow.size
              );

              const updatedItem: StockItem = {
                product_id: newRow.product_id,
                product_name: pName,
                size: newRow.size,
                location_id: newRow.location_id,
                quantity: newRow.quantity,
              };

              if (itemIdx > -1) {
                // Update
                const newStock = [...prev];
                newStock[itemIdx] = updatedItem;
                return newStock;
              } else {
                // Insert
                return [...prev, updatedItem];
              }
            });

            // If product name is unknown, fetch it from products table and update
            if (pName === 'Unknown Product') {
              try {
                const { data } = await supabase
                  .from('products')
                  .select('name')
                  .eq('id', newRow.product_id)
                  .single();

                if (data && data.name) {
                  setStock((prev) =>
                    prev.map((item) =>
                      item.product_id === newRow.product_id
                        ? { ...item, product_name: data.name }
                        : item
                    )
                  );
                }
              } catch (err) {
                console.error('Failed to fetch product name for new stock level entry:', err);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationId]);

  return { stock, setStock, loading, error, refresh };
};

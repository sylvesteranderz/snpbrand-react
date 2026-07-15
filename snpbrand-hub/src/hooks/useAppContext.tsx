import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useAccraOrders, Order } from './useAccraOrders';
import { useAccraStock, StockItem } from './useAccraStock';
import { supabase } from '../lib/supabase';

interface AppContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  ordersLoading: boolean;
  ordersError: string | null;
  refreshOrders: () => Promise<void>;

  stock: StockItem[];
  setStock: React.Dispatch<React.SetStateAction<StockItem[]>>;
  stockLoading: boolean;
  stockError: string | null;
  refreshStock: () => Promise<void>;

  productsList: { id: string; name: string; price?: number; sizes?: string[] }[];
  locationsMap: { Accra: string; Kumasi: string };
  metadataLoading: boolean;
  metadataError: string | null;
  refreshMetadata: () => Promise<void>;
  
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedLocation, activeLocationId, user } = useAuth();

  // 1. Mount persistent stock and order hooks at root level
  const {
    orders,
    setOrders,
    loading: ordersLoading,
    error: ordersError,
    refresh: refreshOrders,
  } = useAccraOrders(selectedLocation);

  const {
    stock,
    setStock,
    loading: stockLoading,
    error: stockError,
    refresh: refreshStock,
  } = useAccraStock(activeLocationId);

  // 2. Global Metadata State (Products catalog & Location UUID mapping)
  const [productsList, setProductsList] = useState<{ id: string; name: string; price?: number; sizes?: string[] }[]>([]);
  const [locationsMap, setLocationsMap] = useState<{ Accra: string; Kumasi: string }>({ Accra: '', Kumasi: '' });
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const refreshMetadata = useCallback(async () => {
    if (!user) return;
    setMetadataError(null);
    try {
      // Fetch Kumasi and Accra location UUIDs
      const { data: locs, error: locError } = await supabase
        .from('locations')
        .select('id, name')
        .in('name', ['Accra', 'Kumasi']);

      if (locError) throw locError;

      const newMap = { Accra: '', Kumasi: '' };
      (locs || []).forEach((l) => {
        if (l.name === 'Accra') newMap.Accra = l.id;
        if (l.name === 'Kumasi') newMap.Kumasi = l.id;
      });
      setLocationsMap(newMap);

      // Fetch products list
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('id, name, price, sizes');

      if (prodError) throw prodError;

      const formattedProducts = (prodData || []).map((p: any) => {
        let sizesArr: string[] = [];
        if (Array.isArray(p.sizes)) {
          sizesArr = p.sizes;
        } else if (typeof p.sizes === 'string') {
          try {
            sizesArr = JSON.parse(p.sizes);
          } catch {
            sizesArr = p.sizes.replace(/[{}]/g, '').split(',');
          }
        }
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          sizes: sizesArr,
        };
      });

      setProductsList(formattedProducts);
    } catch (err: any) {
      console.error('Failed to load metadata in AppProvider:', err);
      if (!navigator.onLine) {
        setMetadataError('You appear to be offline — pull to refresh');
      } else {
        setMetadataError(err.message || 'Failed to initialize metadata.');
      }
    } finally {
      setMetadataLoading(false);
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      refreshOrders(),
      refreshStock(),
      refreshMetadata(),
    ]);
  }, [user, refreshOrders, refreshStock, refreshMetadata]);

  // Load metadata on initial login / state change
  useEffect(() => {
    if (user) {
      refreshMetadata();
    } else {
      setProductsList([]);
      setLocationsMap({ Accra: '', Kumasi: '' });
      setMetadataLoading(false);
    }
  }, [user, refreshMetadata]);

  // 3. Network Reconnection Reconciliation Listener
  useEffect(() => {
    const handleOnline = () => {
      console.log('[AppContext] Device came back online. Reconciling local cache with database...');
      refreshAll();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshAll]);

  return (
    <AppContext.Provider
      value={{
        orders,
        setOrders,
        ordersLoading,
        ordersError,
        refreshOrders,
        stock,
        setStock,
        stockLoading,
        stockError,
        refreshStock,
        productsList,
        locationsMap,
        metadataLoading,
        metadataError,
        refreshMetadata,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

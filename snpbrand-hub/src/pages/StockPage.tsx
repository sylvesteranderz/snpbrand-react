import React, { useState } from 'react';
import { RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import { StockTable } from '../components/StockTable';

export const StockPage: React.FC = () => {
  const { selectedLocation } = useAuth();
  const { stock, stockLoading: loading, stockError: error, refreshStock: refresh } = useAppContext();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const isLoading = loading && !refreshing;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center">
            <Package className="w-5 h-5 text-primary-500 mr-1.5" />
            {selectedLocation} Stock
          </h1>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
            Live Inventory
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
          className="p-2.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Offline/Error Banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start space-x-3 text-sm animate-fade-in shadow-sm">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-amber-600">Please verify your internet connection and tap the refresh button.</p>
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 font-medium">Loading stock levels...</p>
        </div>
      ) : (
        <StockTable stock={stock} />
      )}
    </div>
  );
};

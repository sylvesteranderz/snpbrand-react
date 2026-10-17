import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, ShoppingBag, X } from 'lucide-react';
import { StockItem } from '../hooks/useAccraStock';

interface StockTableProps {
  stock: StockItem[];
}

interface GroupedStock {
  productName: string;
  productId: string;
  sizes: { size: string; quantity: number }[];
  hasStock: boolean;
}

// Helper to sort standard apparel and shoe sizes
const sizeOrder = ['xs', 's', 'm', 'l', 'xl', 'xxl', '3xl', '4xl'];

const sortSizes = (a: string, b: string) => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const aIndex = sizeOrder.indexOf(aLower);
  const bIndex = sizeOrder.indexOf(bLower);

  if (aIndex > -1 && bIndex > -1) return aIndex - bIndex;
  if (aIndex > -1) return -1;
  if (bIndex > -1) return 1;

  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

  return a.localeCompare(b);
};

export const StockTable: React.FC<StockTableProps> = ({ stock }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Group and sort stock data
  const groupedStockList = useMemo(() => {
    const groups: { [productName: string]: GroupedStock } = {};

    stock.forEach((item) => {
      if (!groups[item.product_name]) {
        groups[item.product_name] = {
          productName: item.product_name,
          productId: item.product_id,
          sizes: [],
          hasStock: false,
        };
      }
      groups[item.product_name].sizes.push({ size: item.size, quantity: item.quantity });
    });

    // Check if product has any stock, and sort sizes for each product
    return Object.values(groups).map((group) => {
      group.sizes.sort((a, b) => sortSizes(a.size, b.size));
      group.hasStock = group.sizes.some((s) => s.quantity > 0);
      return group;
    });
  }, [stock]);

  // Filter and sort products (products with stock first, then alphabetically)
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    // Apply search filter
    const filtered = query
      ? groupedStockList.filter((p) => p.productName.toLowerCase().includes(query))
      : groupedStockList;

    // Sort: positive stock first, then alphabetical by name
    return [...filtered].sort((a, b) => {
      if (a.hasStock && !b.hasStock) return -1;
      if (!a.hasStock && b.hasStock) return 1;
      return a.productName.localeCompare(b.productName);
    });
  }, [groupedStockList, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Product stock grid */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={product.productId}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                  {product.productName}
                </h3>
                {!product.hasStock && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Sizes list */}
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => {
                  const hasQty = s.quantity > 0;
                  return (
                    <div
                      key={s.size}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 ${
                        hasQty
                          ? 'bg-primary-50 text-primary-700 border-primary-100'
                          : 'bg-gray-50 text-gray-400 border-gray-100 opacity-60'
                      }`}
                    >
                      <span className="uppercase">{s.size}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                          hasQty ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500 line-through'
                        }`}
                      >
                        {s.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-2">
          {searchQuery ? (
            <>
              <AlertCircle className="w-10 h-10 text-gray-400" />
              <p className="font-semibold text-gray-700">No results found</p>
              <p className="text-sm text-gray-400">
                We couldn't find any products matching "{searchQuery}"
              </p>
            </>
          ) : (
            <>
              <ShoppingBag className="w-10 h-10 text-gray-400" />
              <p className="font-semibold text-gray-700">Stock is empty</p>
              <p className="text-sm text-gray-400">No stock rows exist for Accra location.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

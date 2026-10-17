import React, { useState, useMemo } from 'react';
import { Search, X, Check, Package } from 'lucide-react';
import { StockItem } from '../hooks/useAccraStock';

interface ProductPickerProps {
  stock: StockItem[];
  onSelect: (productId: string, productName: string) => void;
  selectedProductId?: string;
}

interface PickerProduct {
  productId: string;
  productName: string;
  totalStock: number;
  availableSizes: { size: string; quantity: number }[];
}

export const ProductPicker: React.FC<ProductPickerProps> = ({
  stock,
  onSelect,
  selectedProductId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Group items by product, filtering only those with stock > 0
  const pickerProducts = useMemo(() => {
    const productsMap: { [id: string]: PickerProduct } = {};

    stock.forEach((item) => {
      if (item.quantity <= 0) return; // Only show products with stock > 0

      if (!productsMap[item.product_id]) {
        productsMap[item.product_id] = {
          productId: item.product_id,
          productName: item.product_name,
          totalStock: 0,
          availableSizes: [],
        };
      }

      productsMap[item.product_id].totalStock += item.quantity;
      productsMap[item.product_id].availableSizes.push({
        size: item.size,
        quantity: item.quantity,
      });
    });

    return Object.values(productsMap);
  }, [stock]);

  // Filter based on search query
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pickerProducts;
    return pickerProducts.filter((p) => p.productName.toLowerCase().includes(query));
  }, [pickerProducts, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products in stock..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-950 placeholder-gray-400"
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

      {/* Product List */}
      <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-0.5">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const isSelected = selectedProductId === product.productId;
            return (
              <button
                key={product.productId}
                type="button"
                onClick={() => onSelect(product.productId, product.productName)}
                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-150 min-h-[56px] ${
                  isSelected
                    ? 'bg-primary-50 border-primary-300 ring-1 ring-primary-300'
                    : 'bg-white border-gray-100 hover:border-gray-200 active:bg-gray-50'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="space-y-1.5 pr-4 flex-1">
                  <h4 className="font-bold text-gray-900 leading-tight">
                    {product.productName}
                  </h4>
                  <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-gray-500">
                    {product.availableSizes.map((s) => (
                      <span
                        key={s.size}
                        className="bg-gray-100 px-1.5 py-0.5 rounded uppercase"
                      >
                        {s.size} ({s.quantity})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Stock</span>
                    <span className="text-sm font-bold text-gray-800 flex items-center justify-end">
                      <Package className="w-3.5 h-3.5 text-gray-400 mr-1" />
                      {product.totalStock}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white border border-gray-100 rounded-xl space-y-2">
            <Package className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-semibold text-sm">No products in stock</p>
            {searchQuery ? (
              <p className="text-xs text-gray-400">
                We couldn't find items matching "{searchQuery}" with active stock.
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                No inventory rows are currently populated for Accra.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

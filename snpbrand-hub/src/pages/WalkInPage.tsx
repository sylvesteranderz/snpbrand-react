import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ProductPicker } from '../components/ProductPicker';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../hooks/useAppContext';

type Step = 'product' | 'size' | 'details' | 'success';

export const WalkInPage: React.FC = () => {
  const { user, role, activeLocationId, selectedLocation } = useAuth();
  const { stock, setStock, stockLoading, stockError } = useAppContext();

  // Wizard state
  const [step, setStep] = useState<Step>('product');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSizeStock, setSelectedSizeStock] = useState<number>(0);
  
  // Form input state
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  // Admin-only "Assign to order" states
  const [assignToOrder, setAssignToOrder] = useState<boolean>(false);
  const [assignedOrderNumber, setAssignedOrderNumber] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter sizes for the selected product that have stock > 0
  const availableSizes = React.useMemo(() => {
    if (!selectedProductId) return [];
    return stock.filter(
      (item) => item.product_id === selectedProductId && item.quantity > 0
    );
  }, [stock, selectedProductId]);

  // If stock updates, make sure quantity doesn't exceed new stock
  useEffect(() => {
    if (selectedProductId && selectedSize) {
      const match = stock.find(
        (item) => item.product_id === selectedProductId && item.size === selectedSize
      );
      if (match) {
        setSelectedSizeStock(match.quantity);
        if (quantity > match.quantity) {
          setQuantity(match.quantity);
        }
      }
    }
  }, [stock, selectedProductId, selectedSize, quantity]);

  const handleSelectProduct = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setSelectedSize('');
    setStep('size');
  };

  const handleSelectSize = (size: string, currentStock: number) => {
    setSelectedSize(size);
    setSelectedSizeStock(currentStock);
    setQuantity(1);
    setUnitPrice('');
    setNote('');
    setAssignToOrder(false);
    setAssignedOrderNumber('');
    setError(null);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'size') {
      setStep('product');
    } else if (step === 'details') {
      setStep('size');
    }
  };

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to record a sale.');
      return;
    }
    if (!activeLocationId) {
      setError('Active location ID is not resolved yet.');
      return;
    }

    const numericPrice = parseFloat(unitPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid selling price greater than 0.');
      return;
    }

    if (quantity < 1 || quantity > selectedSizeStock) {
      setError(`Invalid quantity. Must be between 1 and ${selectedSizeStock}.`);
      return;
    }

    if (assignToOrder && !assignedOrderNumber.trim()) {
      setError('Please enter the order number to assign this sale to.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Format note: if assigned to order, prepend order number
    let finalNote = note.trim();
    if (assignToOrder && assignedOrderNumber.trim()) {
      const orderRef = `Order: ${assignedOrderNumber.trim()}`;
      finalNote = finalNote ? `${orderRef} - ${finalNote}` : orderRef;
    }

    try {
      // ALWAYS call log_walk_in_sale to preserve the paper trail in walk_in_sales table
      const { error: rpcErr } = await supabase.rpc('log_walk_in_sale', {
        p_product_id: selectedProductId,
        p_size: selectedSize,
        p_location_id: activeLocationId,
        p_quantity: quantity,
        p_unit_price: numericPrice,
        p_sold_by: user.id,
        p_note: finalNote || null,
      });

      if (rpcErr) {
        throw new Error(rpcErr.message);
      }

      // Success
      setStep('success');
      // Decrement stock levels locally in memory immediately
      setStock((prevStock) =>
        prevStock.map((item) =>
          item.product_id === selectedProductId && item.size === selectedSize
            ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
            : item
        )
      );
    } catch (err: any) {
      console.error('Walk-in sale registration failed:', err);
      setError(err.message || 'An error occurred while logging the sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedProductId('');
    setSelectedProductName('');
    setSelectedSize('');
    setSelectedSizeStock(0);
    setQuantity(1);
    setUnitPrice('');
    setNote('');
    setAssignToOrder(false);
    setAssignedOrderNumber('');
    setError(null);
    setStep('product');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {step !== 'product' && step !== 'success' && (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all mr-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center">
              <ShoppingBag className="w-5 h-5 text-primary-500 mr-1.5" />
              Walk-in Sale
            </h1>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
              {selectedLocation} Hub
            </p>
          </div>
        </div>
        {step !== 'product' && step !== 'success' && (
          <button
            onClick={handleReset}
            className="text-xs text-red-500 font-semibold uppercase hover:underline min-h-[44px] px-2 flex items-center"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Main Form Area */}
      {stockLoading && step === 'product' ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 font-medium">Loading inventory...</p>
        </div>
      ) : stockError && step === 'product' ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start space-x-3 text-sm">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">{stockError}</p>
            <p className="text-xs text-amber-600 mt-1">Cannot select products while offline.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-4">
          {/* STEP 1: Product Selection */}
          {step === 'product' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Step 1: Select Product
              </h3>
              <ProductPicker
                stock={stock}
                onSelect={handleSelectProduct}
                selectedProductId={selectedProductId}
              />
            </div>
          )}

          {/* STEP 2: Size Selection */}
          {step === 'size' && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Selected Product</span>
                <p className="text-base font-bold text-gray-900">{selectedProductName}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Step 2: Choose Size
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableSizes.map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => handleSelectSize(item.size, item.quantity)}
                      className="p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/20 active:scale-[0.98] transition-all flex items-center justify-between min-h-[52px]"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <span className="font-bold text-gray-800 uppercase text-sm">{item.size}</span>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                        {item.quantity} left
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Details & Confirmation */}
          {step === 'details' && (
            <form onSubmit={handleConfirmSale} className="space-y-5">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block uppercase">Product</span>
                  <span className="font-bold text-gray-900 line-clamp-1">{selectedProductName}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-semibold block uppercase">Size</span>
                  <span className="font-bold text-gray-900 uppercase">{selectedSize} ({selectedSizeStock} in stock)</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-start space-x-2 text-sm animate-fade-in">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Quantity Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                    <span>Quantity</span>
                    <span className="text-primary-600 font-bold">Max: {selectedSizeStock}</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      disabled={quantity <= 1 || submitting}
                      onClick={() => setQuantity((q) => q - 1)}
                      className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center disabled:opacity-40 select-none"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-bold text-xl text-gray-900 py-2 border border-gray-100 rounded-xl bg-gray-50/50">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      disabled={quantity >= selectedSizeStock || submitting}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center disabled:opacity-40 select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Input */}
                <div className="space-y-1">
                  <label htmlFor="price" className="text-xs font-semibold text-gray-500 uppercase">
                    Selling Price (GHS)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    disabled={submitting}
                    className="block w-full py-3 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-bold text-gray-900 text-lg placeholder-gray-300"
                  />
                </div>

                {/* Admin-only "Assign to Order" Toggle */}
                {role === 'admin' && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <label htmlFor="assignToggle" className="text-xs font-bold text-gray-700 uppercase">
                        Assign to existing order?
                      </label>
                      <input
                        id="assignToggle"
                        type="checkbox"
                        checked={assignToOrder}
                        onChange={(e) => setAssignToOrder(e.target.checked)}
                        disabled={submitting}
                        className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20"
                        style={{ minHeight: '30px' }}
                      />
                    </div>
                    
                    {assignToOrder && (
                      <div className="space-y-1 animate-fade-in">
                        <label htmlFor="orderNum" className="text-[10px] font-bold text-gray-500 uppercase">
                          Order Number (e.g. SNP-20260713-1000)
                        </label>
                        <input
                          id="orderNum"
                          type="text"
                          required
                          placeholder="SNP-XXXXXXXX-XXXX"
                          value={assignedOrderNumber}
                          onChange={(e) => setAssignedOrderNumber(e.target.value)}
                          disabled={submitting}
                          className="block w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold text-gray-900"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Note Field */}
                <div className="space-y-1">
                  <label htmlFor="note" className="text-xs font-semibold text-gray-500 uppercase">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="note"
                    rows={2}
                    placeholder="Add cash sale notes..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={submitting}
                    className="block w-full py-2.5 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-gray-900 placeholder-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Confirm Sale Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-xl text-base shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 min-h-[48px]"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Registering Sale...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Sale</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Success View */}
          {step === 'success' && (
            <div className="py-10 text-center space-y-4 animate-slide-up">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-lg">Sale Confirmed!</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  {assignToOrder
                    ? `The sale has been successfully linked to order ${assignedOrderNumber.trim()} and inventory updated.`
                    : 'The walk-in sale has been logged successfully and inventory updated.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="w-full max-w-xs bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:scale-95 transition-all py-3 min-h-[44px]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  New Sale
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

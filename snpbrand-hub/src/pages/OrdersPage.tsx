import React, { useState, useEffect } from 'react';
import { RefreshCw, ClipboardList, CheckCircle2, AlertTriangle, LogOut, Plus, X, Trash2, ShoppingBag } from 'lucide-react';
import { OrderCard } from '../components/OrderCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../hooks/useAppContext';

interface ManualItemInput {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
}

export const OrdersPage: React.FC = () => {
  const { signOut, selectedLocation, role } = useAuth();
  const {
    orders,
    ordersLoading,
    ordersError,
    productsList,
    locationsMap,
    metadataLoading,
    metadataError,
    refreshAll,
  } = useAppContext();

  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Manual Order Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderItems, setOrderItems] = useState<ManualItemInput[]>([]);
  
  // Single Item Input State (within Modal)
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priceInput, setPriceInput] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Trigger default price/size when product changes in the modal selector
  useEffect(() => {
    if (selectedProdId) {
      const prod = productsList.find((p) => p.id === selectedProdId);
      if (prod) {
        if (prod.price) setPriceInput(prod.price.toString());
        if (prod.sizes && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        } else {
          setSelectedSize('');
        }
      }
    }
  }, [selectedProdId, productsList]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleOrderFulfilled = (orderId: string) => {
    console.log(`Order ${orderId} fulfilled successfully.`);
  };

  // Modal handlers
  const handleOpenModal = () => {
    setCustomerName('');
    setCustomerPhone('');
    setOrderItems([]);
    setSelectedProdId(productsList[0]?.id || '');
    setSelectedSize('');
    setQuantity(1);
    setPriceInput('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setModalError(null);
    if (!selectedProdId) {
      setModalError('Please select a product.');
      return;
    }
    if (!selectedSize.trim()) {
      setModalError('Please select or specify a size.');
      return;
    }
    const unitPrice = parseFloat(priceInput);
    if (isNaN(unitPrice) || unitPrice < 0) {
      setModalError('Please enter a valid price.');
      return;
    }
    if (quantity < 1) {
      setModalError('Quantity must be at least 1.');
      return;
    }

    const prod = productsList.find((p) => p.id === selectedProdId);
    if (!prod) return;

    // Check if item already added
    const existingIdx = orderItems.findIndex(
      (item) => item.productId === selectedProdId && item.size === selectedSize
    );

    if (existingIdx > -1) {
      // Update quantity
      const updated = [...orderItems];
      updated[existingIdx].quantity += quantity;
      setOrderItems(updated);
    } else {
      // Add new
      setOrderItems([
        ...orderItems,
        {
          productId: selectedProdId,
          productName: prod.name,
          size: selectedSize,
          quantity,
          price: unitPrice,
        },
      ]);
    }

    // Reset item inputs
    setQuantity(1);
    setPriceInput(prod.price ? prod.price.toString() : '');
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const handleSubmitManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!customerName.trim()) {
      setModalError('Customer name is required.');
      return;
    }
    if (orderItems.length === 0) {
      setModalError('Please add at least one item to the order.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Reformat items for DB JSONB format: array of {product_id, product_name, size, quantity, price}
      const formattedItems = orderItems.map((item) => ({
        product_id: item.productId,
        product_name: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      // Insert order while OMITTING order_number so the Postgres sequence (order_number_seq) handles formatting
      const { data, error: insertErr } = await supabase
        .from('orders')
        .insert([
          {
            user_id: null,
            total_amount: totalAmount,
            status: 'pending',
            payment_method: 'pay_on_delivery',
            shipping_address: { address: 'Manual Storefront Pickup' },
            items: formattedItems,
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim() || null,
            fulfillment_location: selectedLocation,
            source: 'manual',
            created_at: new Date().toISOString()
          }
        ])
        .select('order_number')
        .single();

      if (insertErr) throw insertErr;

      console.log('Manual order generated successfully with order number:', data?.order_number);
      setIsModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      console.error('Failed to create manual order:', err);
      setModalError(err.message || 'Failed to submit manual order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const displayedError = ordersError || metadataError;
  const isLoading = (ordersLoading || metadataLoading) && !refreshing;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center">
            <ClipboardList className="w-5 h-5 text-primary-500 mr-1.5" />
            {selectedLocation} Orders
          </h1>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
            Fulfillment Queue
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Create Manual Order (Admin Only) */}
          {role === 'admin' && (
            <button
              onClick={handleOpenModal}
              className="p-2.5 rounded-lg border border-primary-200 text-primary-600 bg-primary-50 hover:bg-primary-100 active:scale-95 transition-all min-h-[44px] flex items-center justify-center space-x-1 font-bold text-xs focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Manual</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {/* Logout Button */}
          <button
            onClick={() => signOut()}
            className="p-2.5 rounded-lg border border-red-100 text-red-500 bg-red-50/50 hover:bg-red-50 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Offline/Error Banner */}
      {displayedError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start space-x-3 text-sm animate-fade-in shadow-sm">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="font-semibold">{displayedError}</p>
            <p className="text-xs text-amber-600">Please check your connection and tap the refresh button above.</p>
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 font-medium">Loading orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              locationsMap={locationsMap}
              productsList={productsList}
              onFulfilled={handleOrderFulfilled}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-sm py-16 animate-slide-up">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 text-base">All Caught Up!</h3>
            <p className="text-sm text-gray-400">No pending orders for {selectedLocation}.</p>
          </div>
        </div>
      )}

      {/* MANUAL ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[92vh] animate-slide-up">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Create Manual Order</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Fulfilling at {selectedLocation}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              {/* Customer Info Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Phone</label>
                    <input
                      type="tel"
                      placeholder="0241234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Add Item Form Section */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Product Item
                </h3>
                
                <div className="space-y-2">
                  {/* Select Product */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Product</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {productsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Size Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Size</label>
                      {productsList.find((p) => p.id === selectedProdId)?.sizes?.length ? (
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          {productsList
                            .find((p) => p.id === selectedProdId)
                            ?.sizes?.map((size) => (
                              <option key={size} value={size}>
                                {size.toUpperCase()}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="M"
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      )}
                    </div>

                    {/* Qty Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                      />
                    </div>

                    {/* Price Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Price (GHS)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs py-2 px-3 rounded-lg border border-gray-950 flex items-center justify-center space-x-1 active:scale-[0.98] transition-all min-h-[38px]"
                  >
                    <span>Add Item to Queue</span>
                  </button>
                </div>
              </div>

              {/* Added Items Queue */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Items Queue ({orderItems.length})
                </h3>
                {orderItems.length > 0 ? (
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white max-h-[180px] overflow-y-auto">
                    {orderItems.map((item, index) => (
                      <div key={index} className="p-3 flex justify-between items-center text-xs">
                        <div className="pr-2">
                          <p className="font-bold text-gray-900 line-clamp-1">{item.productName}</p>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">
                            Size: {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-gray-900">
                            GHS {(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 p-1 min-h-[32px] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                    No items added yet. Use the selector above.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Submit */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-2xl">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Amount</span>
                <span className="text-base font-black text-gray-900">
                  GHS {orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
              
              <button
                type="button"
                disabled={submittingOrder}
                onClick={handleSubmitManualOrder}
                className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
              >
                {submittingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

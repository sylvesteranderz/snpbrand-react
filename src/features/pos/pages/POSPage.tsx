import React, { useState, useRef, useEffect } from 'react';
import { usePOS } from '../hooks/usePOS';
import Receipt from '../components/Receipt';
import { useAuth } from '@/features/auth/hooks/useAuthSupabase';
import { Trash2, Search, CreditCard, Banknote, Smartphone, AlertCircle } from 'lucide-react';

export default function POSPage() {
  const { user } = useAuth();
  const { cart, total, loading, receipt, scanBarcode, updateQty, checkout, clearReceipt } = usePOS();
  
  const [barcodeInput, setBarcodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Keeping input focused for barcode scanner
  useEffect(() => {
    if (!receipt) {
      inputRef.current?.focus();
    }
  }, [receipt, cart.length]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    
    setErrorMsg('');
    const res = await scanBarcode(barcodeInput.trim());
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to scan product');
    }
    setBarcodeInput('');
    inputRef.current?.focus();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setErrorMsg('');
    const amountPaid = paymentMethod === 'Cash' ? parseFloat(amountReceived) : total;
    
    if (paymentMethod === 'Cash' && (isNaN(amountPaid) || amountPaid < total)) {
       setErrorMsg('Amount received is less than total');
       return;
    }

    const cashierId = user?.id || 'unknown';
    const res = await checkout(paymentMethod, amountPaid, cashierId);
    
    if (!res.success) {
       setErrorMsg(res.error || 'Checkout failed');
    } else {
       setAmountReceived('');
       setPaymentMethod('Cash');
    }
  };

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`;
  
  const changeDue = paymentMethod === 'Cash' && parseFloat(amountReceived) >= total 
    ? parseFloat(amountReceived) - total 
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-16">
      {/* Header bar already exists in App layout, but we can add POS specific subheader if we want */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Point of Sale</h1>
        <div className="text-sm text-gray-500">
          Cashier: <span className="font-semibold">{user?.email || 'Guest'}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL - CART & SCANNING */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden border-r">
          <div className="p-4 border-b bg-gray-50">
            <form onSubmit={handleScan} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                disabled={loading}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                placeholder="Scan barcode or enter manually and press Enter..."
              />
            </form>
            {errorMsg && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errorMsg}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Search size={48} className="mb-4 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Scan a product to begin</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded shadow-sm hover:border-gray-300 transition">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.price)} each • <span className="font-mono text-xs">{item.barcode}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded">
                      <button 
                        onClick={() => updateQty(item.id, item.cartQuantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition"
                      >−</button>
                      <span className="px-3 border-x text-center w-12 font-medium">
                        {item.cartQuantity}
                      </span>
                      <button 
                        onClick={() => updateQty(item.id, item.cartQuantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition"
                      >+</button>
                    </div>
                    
                    <div className="w-24 text-right font-bold text-gray-900">
                      {formatCurrency(item.price * item.cartQuantity)}
                    </div>
                    
                    <button 
                      onClick={() => updateQty(item.id, 0)}
                      className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL - CHECKOUT */}
        <div className="w-full md:w-[360px] bg-gray-50 flex flex-col">
          <div className="p-6 flex-1">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Payment Summary</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-full -z-10 opacity-50"></div>
              <p className="text-sm text-gray-500 mb-1">Total Amount Due</p>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                {formatCurrency(total)}
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex flex-col items-center justify-center py-3 rounded border text-sm font-medium transition ${
                      paymentMethod === 'Cash' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Banknote size={20} className="mb-1" />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Mobile Money')}
                    className={`flex flex-col items-center justify-center py-3 rounded border text-sm font-medium transition ${
                      paymentMethod === 'Mobile Money' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone size={20} className="mb-1" />
                    MoMo
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`flex flex-col items-center justify-center py-3 rounded border text-sm font-medium transition ${
                      paymentMethod === 'Card' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard size={20} className="mb-1" />
                    Card
                  </button>
                </div>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Amount Received</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-medium">GH₵</span>
                      <input
                        type="number"
                        min={total}
                        step="0.01"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded focus:ring-black focus:border-black font-medium text-lg"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium text-gray-600">Change Due</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(changeDue)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-white border-t border-gray-200">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading || (paymentMethod === 'Cash' && (parseFloat(amountReceived) < total || !amountReceived))}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <span>Complete Sale →</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {receipt && <Receipt receipt={receipt} onClose={clearReceipt} />}
    </div>
  );
}

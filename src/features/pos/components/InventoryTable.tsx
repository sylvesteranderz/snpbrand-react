import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Check, X, Plus } from 'lucide-react';

export default function InventoryTable() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');

  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveForm, setReceiveForm] = useState({
    product_id: '',
    quantity: '',
    supplier_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [invRes, recRes] = await Promise.all([
        supabase!.from('products').select('*').order('stock_quantity', { ascending: true }),
        supabase!.from('stock_receipts').select('*, products(name)').order('created_at', { ascending: false }).limit(50)
      ]);
        
      if (invRes.error) {
        console.error("Supabase Error (Inventory):", invRes.error);
      } else {
        setInventory(invRes.data || []);
      }

      if (recRes.error) {
        // Will error 42P01 if stock_receipts doesn't exist yet, we silently ignore if so
        if (recRes.error.code !== '42P01') console.error("Supabase Error (Receipts):", recRes.error);
      } else {
        setReceipts(recRes.data || []);
      }

    } catch (err) {
      console.error("FetchData Exception:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQty = async (id: string) => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty < 0) {
      alert('Invalid quantity. Please enter a positive number.');
      return;
    }

    try {
      const { error } = await supabase!
        .from('products')
        .update({ 
           stock_quantity: qty, 
           in_stock: qty > 0,
           updated_at: new Date().toISOString() 
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQty('');
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditQty(String(item.stock_quantity || 0));
  };

  const handleReceiveSubmit = async () => {
    const qty = parseInt(receiveForm.quantity);
    if (!receiveForm.product_id || isNaN(qty) || qty <= 0) {
      alert("Please select a product and enter a valid positive quantity.");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase!.auth.getUser();
      const userId = user?.id;

      const product = inventory.find(p => p.id === receiveForm.product_id);
      if (!product) throw new Error("Product not found");

      const newQty = (product.stock_quantity || 0) + qty;

      // Add to current stock
      const { error: prodErr } = await supabase!
        .from('products')
        .update({ 
          stock_quantity: newQty, 
          in_stock: newQty > 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (prodErr) throw prodErr;

      // Log receipt
      const { error: recErr } = await supabase!
        .from('stock_receipts')
        .insert([{
           product_id: product.id,
           quantity_received: qty,
           supplier_name: receiveForm.supplier_name || null,
           notes: receiveForm.notes || null,
           received_by: userId || null
        }]);

      if (recErr) throw recErr;

      alert("Stock received successfully!");
      setIsReceiving(false);
      setReceiveForm({ product_id: '', quantity: '', supplier_name: '', notes: '' });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Error receiving stock: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && inventory.length === 0) {
    return <div className="text-gray-500 py-4">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Inventory Status</h2>
          {!isReceiving && (
            <button
              onClick={() => setIsReceiving(true)}
              className="flex items-center space-x-1 bg-black text-white px-3 py-2 rounded text-sm hover:bg-gray-800 transition"
            >
              <Plus size={16} />
              <span>Receive Stock</span>
            </button>
          )}
        </div>

        {isReceiving && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 text-sm">
            <h3 className="font-semibold text-gray-700 mb-3">Receiving Stock Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-600 mb-1 text-xs">Product *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-black outline-none bg-white"
                  value={receiveForm.product_id}
                  onChange={(e) => setReceiveForm({ ...receiveForm, product_id: e.target.value })}
                >
                  <option value="">Select a product...</option>
                  {inventory.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.stock_quantity || 0})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1 text-xs">Qty Received *</label>
                <input 
                  type="number" min="1"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-black outline-none bg-white"
                  value={receiveForm.quantity}
                  onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 text-xs">Supplier (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-black outline-none bg-white"
                  value={receiveForm.supplier_name}
                  onChange={(e) => setReceiveForm({ ...receiveForm, supplier_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 text-xs">Notes (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-black outline-none bg-white"
                  value={receiveForm.notes}
                  onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleReceiveSubmit} className="bg-black text-white px-4 py-1.5 rounded hover:bg-gray-800 transition">Save Receipt</button>
              <button onClick={() => setIsReceiving(false)} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Product Name</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Threshold</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => {
                const productName = item.name;
                const currentQty = item.stock_quantity || 0;
                const isLowStock = currentQty <= 5;
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className={isLowStock ? 'bg-amber-50/50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {productName}
                      {isLowStock && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Low Stock
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none"
                        />
                      ) : (
                        <span className={`font-semibold ${isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                          {currentQty}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-gray-500">
                      5
                    </td>
                    
                    <td className="px-4 py-3 text-gray-500 text-xs text-nowrap">
                      {item.updated_at ? new Date(item.updated_at).toLocaleString() : 'N/A'}
                    </td>
                    
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleSaveQty(item.id)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                            <Check size={16} />
                          </button>
                          <button onClick={cancelEdit} className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(item)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {inventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">No products found.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Stock History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty Received</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipts.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{new Date(rec.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{rec.products?.name || `Product #${rec.product_id}`}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">+{rec.quantity_received}</td>
                  <td className="px-4 py-3 text-gray-500">{rec.supplier_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{rec.received_by ? rec.received_by.substring(0,8) + '...' : 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {receipts.length === 0 && (
            <div className="text-center py-8 text-gray-500">No stock history yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

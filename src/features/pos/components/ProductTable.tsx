import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Trash2, Plus, X, Check } from 'lucide-react';

export default function ProductTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', barcode: '', category: '', price: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Starting fetchProducts...");
      const { data, error } = await supabase!
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Supabase Error (Products):", error);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error("FetchProducts Exception:", err);
    } finally {
      console.log("fetchProducts finally block, setting loading false");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.barcode || !formData.price || !formData.category) {
      alert('All fields are required');
      return;
    }
    
    try {
      if (editingId) {
        const { error } = await supabase!.from('products').update({
          name: formData.name,
          barcode: formData.barcode,
          category: formData.category,
          price: parseFloat(formData.price)
        }).eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase!.from('products').insert([{
          name: formData.name,
          barcode: formData.barcode,
          category: formData.category,
          price: parseFloat(formData.price),
          stock_quantity: 0,
          in_stock: false
        }]);

        if (error) throw error;
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', barcode: '', category: '', price: '' });
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert('Error saving product: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase!.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err: any) {
       console.error(err);
       alert('Error deleting product. It might have associated inventory or sales records.');
    }
  };

  const startEdit = (p: any) => {
    setFormData({ name: p.name, barcode: p.barcode, category: p.category, price: String(p.price) });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', barcode: '', category: '', price: '' });
  };

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`;

  if (loading && products.length === 0) {
    return <div className="text-gray-500 py-4">Loading products...</div>;
  }

  return (
    <div className="bg-white rounded shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Products ({products.length})</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1 bg-black text-white px-3 py-2 rounded text-sm hover:bg-gray-800 transition"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Barcode</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isAdding && (
              <tr className="bg-blue-50/50">
                <td className="px-4 py-3">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none"
                    placeholder="Product Name"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none"
                    placeholder="Barcode"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none"
                    placeholder="Category"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-500 text-sm">GH₵</span>
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded pl-9 pr-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={handleSave} className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded">
                    <Check size={16} />
                  </button>
                  <button onClick={cancelEdit} className="text-red-600 hover:text-red-700 bg-red-50 p-1.5 rounded">
                    <X size={16} />
                  </button>
                </td>
              </tr>
            )}
            
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.barcode}</td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => startEdit(p)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">No products found.</div>
        )}
      </div>
    </div>
  );
}

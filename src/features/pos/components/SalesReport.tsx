import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SalesReport() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      let query = supabase!
        .from('sales')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', `${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        query = query.lte('date', `${endDate}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Supabase Error (Sales):", error);
      } else {
        setSales(data || []);
      }
    } catch (err) {
      console.error("FetchSales Exception:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `GH₵${(amount || 0).toFixed(2)}`;
  
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Start Date</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">End Date</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
          />
        </div>
        
        <div className="ml-auto bg-green-50 px-4 py-2 rounded border border-green-200 text-right">
          <div className="text-xs font-medium text-green-700 uppercase">Total Revenue (Filtered)</div>
          <div className="text-xl font-bold text-green-800">{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Sale ID</th>
                <th className="px-4 py-3 font-medium">Date Object</th>
                <th className="px-4 py-3 font-medium">Cashier</th>
                <th className="px-4 py-3 font-medium">Payment Method</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">Loading sales...</td>
                </tr>
              )}
              {!loading && sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No sales found for this period.</td>
                </tr>
              )}
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {String(sale.id).substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {/* Assuming cashier_id might be a UUID, we show short version or name if available */}
                    {sale.cashier_id ? String(sale.cashier_id).substring(0,8) : 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {sale.payment_method || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

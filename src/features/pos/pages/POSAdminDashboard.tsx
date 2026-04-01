import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductTable from '../components/ProductTable';
import InventoryTable from '../components/InventoryTable';
import SalesReport from '../components/SalesReport';
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';

export default function POSAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    revenueToday: 0,
    lowStockCount: 0,
    totalProducts: 0
  });

  useEffect(() => {
    fetchStats();
  }, [activeTab]); // Refetch when tab changes too to keep fresh

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Total sales & revenue today
    const { data: salesData } = await supabase!
      .from('sales')
      .select('total')
      .gte('date', `${today}T00:00:00.000Z`);

    const revenue = salesData?.reduce((sum, s) => sum + (s.total || 0), 0) || 0;
    const totalSales = salesData?.length || 0;

    // Total products
    const { count: productCount } = await supabase!
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Low stock count (assuming generic default logic since no complex rpc)
    // We fetch inventory, then filter. Or if threshold is column, we can filter. 
    // Wait, in Supabase we can do a filter if the columns are in same table. But threshold is in inventory.
    // Yes: .filter('quantity', 'lte', 'low_stock_threshold') maybe doesn't work simply. Let's fetch and reduce.
    const { data: invData } = await supabase!.from('inventory').select('quantity, low_stock_threshold');
    const lowStock = (invData || []).filter(item => item.quantity <= (item.low_stock_threshold || 5)).length;

    setStats({
      totalSalesToday: totalSales,
      revenueToday: revenue,
      lowStockCount: lowStock,
      totalProducts: productCount || 0
    });
  };

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Administration</h1>
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm border border-b-0 border-gray-200 overflow-hidden">
          <nav className="-mb-px flex">
            {['overview', 'products', 'inventory', 'sales'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-center font-medium text-sm transition focus:outline-none ${
                  activeTab === tab 
                    ? 'border-b-2 border-black text-black bg-gray-50/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat Cards */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
                <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenueToday)}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
                <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sales Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSalesToday}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
                <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
                <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'products' && <ProductTable />}
          {activeTab === 'inventory' && <InventoryTable />}
          {activeTab === 'sales' && <SalesReport />}
        </div>
      </div>
    </div>
  );
}

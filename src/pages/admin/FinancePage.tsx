import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminBottomTabBar from '@/features/admin/components/AdminBottomTabBar';
import MetricGrid from '@/features/admin/components/MetricGrid';
import MetricTile from '@/features/admin/components/MetricTile';
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Warehouse,
  LineChart,
  Tag,
  Plus,
  DollarSign,
  Calendar,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { useFinanceStats, useAddExpense, Period } from '@/hooks/useFinanceData';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'finance', label: 'Finance', icon: LineChart },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'discounts', label: 'Discounts', icon: Tag },
];

const FinancePage: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('month');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for adding expense
  const [amount, setAmount] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [formError, setFormError] = useState<string>('');

  const { data: stats, loading, error, refetch } = useFinanceStats(period);
  const { addExpense, loading: isSaving } = useAddExpense();

  const handleSidebarClick = (tabId: string) => {
    if (tabId === 'finance') return;
    navigate('/admin', { state: { activeTab: tabId } });
  };

  const handleOpenAddModal = () => {
    setAmount('');
    setLabel('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!label.trim()) {
      setFormError('Please enter a description label.');
      return;
    }
    if (!date) {
      setFormError('Please select a date.');
      return;
    }

    try {
      await addExpense({
        amount: parsedAmount,
        label: label.trim(),
        date,
      });
      setShowAddModal(false);
      refetch();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add expense.');
    }
  };

  const formatExpenseDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatPriceWithNegative = (val: number) => {
    if (val < 0) {
      return `-${formatPrice(Math.abs(val))}`;
    }
    return formatPrice(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 overflow-x-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 mb-6 gap-4"
        >
          <div>
            <h1 className="text-3xl font-chilanka font-normal text-gray-900">
              Finance
            </h1>
          </div>

          {/* Period Toggle */}
          <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm w-full sm:w-max overflow-x-auto">
            {(['today', 'week', 'month'] as Period[]).map((p) => {
              const active = period === p;
              let labelText = 'Today';
              if (p === 'week') labelText = 'This week';
              if (p === 'month') labelText = 'This month';

              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap capitalize ${
                    active
                      ? 'bg-[#DEAD6F] text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {labelText}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-16">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:block lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Admin Panel</h3>
                <p className="text-sm text-gray-500">Store Management</p>
              </div>

              <nav className="p-4">
                <ul className="space-y-1.5">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.id === 'finance';
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => handleSidebarClick(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                            isActive
                              ? 'bg-[#DEAD6F]/10 text-gray-950 font-bold border-l-4 border-[#DEAD6F]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-[#DEAD6F]' : ''}`} />
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 space-y-6"
          >
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#DEAD6F] mb-4" />
                <span className="text-sm text-gray-500">Calculating period financials...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Error Loading Financial Data</h3>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                  <button
                    onClick={refetch}
                    className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && stats && (
              <>
                {/* Metrics Grid */}
                <MetricGrid cols={3}>
                  <MetricTile
                    label="Revenue"
                    value={formatPrice(stats.revenue)}
                    icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                  />
                  <MetricTile
                    label="Orders"
                    value={stats.orderCount}
                    icon={<ShoppingCart className="w-4 h-4 text-gray-400" />}
                  />
                  <MetricTile
                    label="Avg Order Value"
                    value={stats.revenue === 0 || stats.avgOrderValue === null ? '—' : formatPrice(stats.avgOrderValue)}
                    icon={<TrendingUp className="w-4 h-4 text-gray-400" />}
                  />
                  <MetricTile
                    label="COG (Cost of Goods)"
                    value={stats.revenue === 0 ? '—' : formatPrice(stats.cog)}
                    icon={<Package className="w-4 h-4 text-gray-400" />}
                  />
                  <MetricTile
                    label="Gross Profit"
                    value={stats.revenue === 0 ? '—' : formatPriceWithNegative(stats.grossProfit)}
                    valueClass={stats.grossProfit > 0 ? 'text-green-600' : stats.grossProfit < 0 ? 'text-red-600' : 'text-gray-900'}
                    icon={<LineChart className="w-4 h-4 text-gray-400" />}
                  />
                  <MetricTile
                    label="Net Profit"
                    value={stats.revenue === 0 ? '—' : formatPriceWithNegative(stats.netProfit)}
                    valueClass={stats.netProfit > 0 ? 'text-green-600' : stats.netProfit < 0 ? 'text-red-600' : 'text-gray-900'}
                    icon={<LineChart className="w-4 h-4 text-gray-400" />}
                  />
                </MetricGrid>

                {/* Expenses Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Expenses</h2>
                    <button
                      onClick={handleOpenAddModal}
                      className="text-[#DEAD6F] hover:text-[#d4a83d] font-bold text-sm transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {stats.expensesList.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400 italic">
                      No expenses logged for this period.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="divide-y divide-gray-100">
                        {stats.expensesList.map((expense) => (
                          <div
                            key={expense.id}
                            className="py-3.5 flex justify-between items-start gap-4"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{expense.label}</p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                {formatExpenseDate(expense.date)}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-gray-900 shrink-0">
                              {formatPrice(expense.amount)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Footer Row */}
                      <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-base font-extrabold text-gray-950">
                        <span>Total Expenses</span>
                        <span>{formatPrice(stats.expenses)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <AdminBottomTabBar />

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 z-10 flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add New Expense</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3.5 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Amount (₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#DEAD6F] focus:border-[#DEAD6F] outline-none text-gray-800 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description Label
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Delivery, Packaging, Ads"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#DEAD6F] focus:border-[#DEAD6F] outline-none text-gray-800 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#DEAD6F] focus:border-[#DEAD6F] outline-none text-gray-800 text-sm font-semibold"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-[#DEAD6F] hover:bg-[#d4a83d] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl shadow-sm text-sm flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Expense'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FinancePage;

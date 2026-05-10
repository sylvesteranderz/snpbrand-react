import React, { useEffect, useState, useCallback } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FinancialTransaction, ExpenseCategory } from '@/types'

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'packaging',   label: 'Packaging' },
  { value: 'marketing',   label: 'Marketing' },
  { value: 'logistics',   label: 'Logistics' },
  { value: 'data_airtime',label: 'Data / Airtime' },
  { value: 'other',       label: 'Other' },
]

const CAT_BADGE: Record<string, string> = {
  packaging:    'bg-orange-100 text-orange-700',
  marketing:    'bg-pink-100 text-pink-700',
  logistics:    'bg-blue-100 text-blue-700',
  data_airtime: 'bg-purple-100 text-purple-700',
  other:        'bg-gray-100 text-gray-600',
}

const today = () => new Date().toISOString().slice(0, 10)
const currentMonth = () => new Date().toISOString().slice(0, 7)

const ExpenseLogger: React.FC = () => {
  const [expenses, setExpenses] = useState<FinancialTransaction[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  // Filters
  const [monthFilter, setMonthFilter] = useState(currentMonth())
  const [catFilter, setCatFilter]     = useState<ExpenseCategory | 'all'>('all')

  // Form
  const [amount, setAmount]           = useState('')
  const [category, setCategory]       = useState<ExpenseCategory>('packaging')
  const [description, setDescription] = useState('')
  const [date, setDate]               = useState(today())

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const start = `${monthFilter}-01`
    const end   = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1))
      .toISOString().slice(0, 10)

    let query = supabase!
      .from('financial_transactions')
      .select('*')
      .eq('type', 'expense')
      .gte('date', start)
      .lt('date', end)
      .order('date', { ascending: false })
      .limit(30)

    if (catFilter !== 'all') query = query.eq('category', catFilter)

    const { data } = await query
    setExpenses(data ?? [])
    setLoading(false)
  }, [monthFilter, catFilter])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0)       { setError('Enter a valid amount'); return }
    if (!description.trim())    { setError('Description is required'); return }

    setSaving(true)
    try {
      const { error: dbErr } = await supabase!.from('financial_transactions').insert({
        type:        'expense',
        amount:      amt,
        category,
        description: description.trim(),
        date,
      })
      if (dbErr) throw dbErr
      setAmount(''); setDescription(''); setDate(today())
      fetchExpenses()
    } catch (err: any) {
      setError(err?.message || 'Failed to save expense.')
    } finally {
      setSaving(false)
    }
  }

  const totalShown = expenses.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-6">
      {/* Log Expense Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Expense
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min="0.01" step="0.01" required
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 250.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Packaging bags — 200 units"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit" disabled={saving}
            className="w-full py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Log Expense'}
          </button>
        </form>
      </div>

      {/* Expense Log */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Recent Expenses</h3>
          <div className="flex gap-2 items-center">
            <input
              type="month" value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={catFilter} onChange={e => setCatFilter(e.target.value as ExpenseCategory | 'all')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={fetchExpenses} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Total */}
        {!loading && expenses.length > 0 && (
          <div className="flex justify-end">
            <span className="text-sm text-gray-500">
              Total shown: <strong className="text-gray-900">GHS {totalShown.toFixed(2)}</strong>
            </span>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['Date', 'Category', 'Description', 'Amount'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">Loading…</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">No expenses logged for this period.</td></tr>
              ) : expenses.map(ex => (
                <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(ex.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CAT_BADGE[ex.category ?? 'other']}`}>
                      {CATEGORIES.find(c => c.value === ex.category)?.label ?? ex.category ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{ex.description}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">GHS {Number(ex.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ExpenseLogger

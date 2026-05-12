import React, { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { InventoryTransaction, TransactionType } from '@/types'

const TYPE_LABELS: Record<TransactionType | 'all', string> = {
  all:        'All Types',
  restock:    'Restock',
  sale:       'Sale',
  adjustment: 'Adjustment',
  return:     'Return',
}

const TYPE_BADGE: Record<string, string> = {
  restock:    'bg-green-100 text-green-700',
  sale:       'bg-blue-100 text-blue-700',
  adjustment: 'bg-amber-100 text-amber-700',
  return:     'bg-purple-100 text-purple-700',
}

const currentMonth = () => new Date().toISOString().slice(0, 7)

const InventoryLog: React.FC = () => {
  const [rows, setRows]         = useState<(InventoryTransaction & { product_name: string })[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading]   = useState(true)

  // Filters
  const [typeFilter, setTypeFilter]       = useState<TransactionType | 'all'>('all')
  const [monthFilter, setMonthFilter]     = useState(currentMonth())
  const [productFilter, setProductFilter] = useState('all')

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase!.from('products').select('id, name').order('name')
    if (data) setProducts(data)
  }, [])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const start = `${monthFilter}-01`
    const end   = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1))
      .toISOString().slice(0, 10)

    let query = supabase!
      .from('inventory_transactions')
      .select('*, products(name)')
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false })

    if (typeFilter !== 'all')    query = query.eq('type', typeFilter)
    if (productFilter !== 'all') query = query.eq('product_id', productFilter)

    const { data } = await query
    setRows(
      (data ?? []).map((r: any) => ({
        ...r,
        product_name: r.products?.name ?? '—',
      }))
    )
    setLoading(false)
  }, [typeFilter, monthFilter, productFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchRows() }, [fetchRows])

  // Summary stats
  const today         = new Date().toISOString().slice(0, 10)
  const restockedToday = rows.filter(r => r.type === 'restock' && r.created_at.slice(0, 10) === today)
    .reduce((s, r) => s + r.quantity, 0)
  const restockedMonth = rows.filter(r => r.type === 'restock').reduce((s, r) => s + r.quantity, 0)
  const restockedProducts = new Set(rows.filter(r => r.type === 'restock').map(r => r.product_id)).size

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Restocked today',       value: `${restockedToday} units` },
          { label: 'Restocked this month',  value: `${restockedMonth} units` },
          { label: 'Products restocked',    value: `${restockedProducts} products` },
        ].map(c => (
          <div key={c.label} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as TransactionType | 'all')}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
        >
          {(Object.keys(TYPE_LABELS) as (TransactionType | 'all')[]).map(k => (
            <option key={k} value={k}>{TYPE_LABELS[k]}</option>
          ))}
        </select>
        <input
          type="month" value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={productFilter}
          onChange={e => setProductFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button
          onClick={fetchRows}
          className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              {['Date', 'Product', 'Size', 'Type', 'Qty', 'Unit Cost', 'Note'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No transactions found for this period.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium max-w-[160px] truncate">{r.product_name}</td>
                <td className="px-4 py-3">
                  {r.size && r.size !== 'unknown'
                    ? <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">{r.size}</span>
                    : <span className="text-gray-400">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[r.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                  </span>
                </td>
                <td className={`px-4 py-3 font-semibold ${r.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {r.quantity > 0 ? `+${r.quantity}` : r.quantity}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {r.unit_cost != null ? `GHS ${Number(r.unit_cost).toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{r.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryLog

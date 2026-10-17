import React, { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProfitLossSummary } from '@/types'

const currentMonth = () => new Date().toISOString().slice(0, 7)

const fmt = (n: number) =>
  `GHS ${Math.abs(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

interface Card {
  label:    string
  key:      keyof ProfitLossSummary
  color:    string
  bg:       string
  positive: boolean // true = green when positive, false = always neutral
}

const CARDS: Card[] = [
  { label: 'Gross Revenue',       key: 'gross_revenue',      color: 'text-green-700',  bg: 'bg-green-50  border-green-200',  positive: true  },
  { label: 'COGS',                key: 'cogs',               color: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200',  positive: false },
  { label: 'Gross Profit',        key: 'gross_profit',       color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200',   positive: true  },
  { label: 'Operating Expenses',  key: 'operating_expenses', color: 'text-red-700',    bg: 'bg-red-50    border-red-200',    positive: false },
  { label: 'Net Profit',          key: 'net_profit',         color: 'text-primary-700',bg: 'bg-primary-50 border-primary-200', positive: true },
]

const ProfitLoss: React.FC = () => {
  const [month, setMonth]       = useState(currentMonth())
  const [data, setData]         = useState<ProfitLossSummary | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const fetchPnL = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data: result, error: rpcErr } = await supabase!
        .rpc('get_pnl_summary', { p_month: `${month}-01` })
      if (rpcErr) throw rpcErr
      setData(result as ProfitLossSummary)
    } catch (err: any) {
      setError(err?.message || 'Failed to load P&L data.')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { fetchPnL() }, [fetchPnL])

  return (
    <div className="space-y-5">
      {/* Header + month picker */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Profit & Loss Summary</h3>
          <p className="text-xs text-gray-500 mt-0.5">All figures in GHS · Weighted average cost method</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month" value={month}
            onChange={e => setMonth(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
          />
          <button onClick={fetchPnL} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* P&L Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CARDS.map(c => (
            <div key={c.key} className={`rounded-xl border p-4 animate-pulse ${c.bg}`}>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CARDS.map(c => {
            const val      = Number(data[c.key])
            const isNeg    = val < 0
            const valueColor = c.positive
              ? (isNeg ? 'text-red-600' : c.color)
              : c.color

            return (
              <div key={c.key} className={`rounded-xl border p-4 ${c.bg}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-gray-600 leading-tight">{c.label}</p>
                  {c.key === 'net_profit'
                    ? (val >= 0
                        ? <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
                        : <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />)
                    : <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                  }
                </div>
                <p className={`text-xl font-bold mt-2 ${valueColor}`}>
                  {isNeg ? `−${fmt(val)}` : fmt(val)}
                </p>
              </div>
            )
          })}
        </div>
      ) : null}

      {/* Margin note */}
      {data && !loading && (
        <p className="text-xs text-gray-400 text-right">
          Gross margin:{' '}
          {data.gross_revenue > 0
            ? `${((data.gross_profit / data.gross_revenue) * 100).toFixed(1)}%`
            : '—'}
          &ensp;·&ensp;
          Net margin:{' '}
          {data.gross_revenue > 0
            ? `${((data.net_profit / data.gross_revenue) * 100).toFixed(1)}%`
            : '—'}
        </p>
      )}
    </div>
  )
}

export default ProfitLoss

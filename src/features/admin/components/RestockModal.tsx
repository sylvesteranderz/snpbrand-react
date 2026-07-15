import React, { useState, useEffect } from 'react'
import { X, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

interface RestockModalProps {
  product: Product
  onClose: () => void
  onSuccess: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

const RestockModal: React.FC<RestockModalProps> = ({ product, onClose, onSuccess }) => {
  // Per-size quantities — keyed by size name, value is string so inputs stay controlled
  const [sizeQtys, setSizeQtys]   = useState<Record<string, string>>({})
  const [sizes, setSizes]         = useState<string[]>([])
  const [loadingSizes, setLoadingSizes] = useState(true)
  // Current on-hand per size from stock_levels (single source of truth)
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({})
  // TODO: location picker once hub UI exists
  const [kumasiId, setKumasiId]   = useState<string | null>(null)

  const [unitCost, setUnitCost]   = useState('')
  const [note, setNote]           = useState('')
  const [date, setDate]           = useState(today())
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')  // pre-submit validation only
  // Per-size results shown after the submit loop completes
  const [sizeResults, setSizeResults] = useState<{ size: string; success: boolean; error?: string }[]>([])

  // Fetch Kumasi location id, authoritative sizes, and current stock_levels on open
  useEffect(() => {
    const fetchSizes = async () => {
      setLoadingSizes(true)

      // TODO: location picker once hub UI exists
      const { data: loc } = await supabase!
        .from('locations')
        .select('id')
        .eq('name', 'Kumasi')
        .single()
      if (loc?.id) setKumasiId(loc.id)

      const { data } = await supabase!
        .from('products')
        .select('sizes, size_stock')
        .eq('id', product.id)
        .single()

      let fetchedSizes: string[] = []
      if (data?.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
        fetchedSizes = data.sizes
      } else if (data?.size_stock && typeof data.size_stock === 'object') {
        fetchedSizes = Object.keys(data.size_stock)
      } else if (product.sizes && product.sizes.length > 0) {
        fetchedSizes = product.sizes
      }
      if (fetchedSizes.length === 0) fetchedSizes = ['General']

      setSizes(fetchedSizes)
      const initial: Record<string, string> = {}
      fetchedSizes.forEach(s => { initial[s] = '' })
      setSizeQtys(initial)

      // Read current on-hand from stock_levels
      if (loc?.id) {
        const { data: levels } = await supabase!
          .from('stock_levels')
          .select('size, quantity')
          .eq('product_id', product.id)
          .eq('location_id', loc.id)
        const map: Record<string, number> = {}
        ;(levels ?? []).forEach((r: any) => { map[r.size] = r.quantity })
        setStockLevels(map)
      }

      setLoadingSizes(false)
    }
    fetchSizes()
  }, [product.id, product.sizes])

  // Total units across all size inputs
  const totalUnits = Object.values(sizeQtys)
    .reduce((sum, v) => sum + (parseInt(v) || 0), 0)

  const totalCost = unitCost && totalUnits > 0
    ? (totalUnits * parseFloat(unitCost)).toFixed(2)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSizeResults([])

    const unitCostNum = parseFloat(unitCost)
    if (!unitCostNum || unitCostNum <= 0) { setError('Unit cost must be greater than 0'); return }
    if (totalUnits < 1) { setError('Enter at least 1 unit for one size'); return }
    if (!kumasiId) { setError('Could not resolve location. Please try again.'); return }

    setSaving(true)

    const toRestock = sizes
      .map(size => ({ size, qty: parseInt(sizeQtys[size]) || 0 }))
      .filter(r => r.qty > 0)

    const results: { size: string; success: boolean; error?: string }[] = []

    for (const { size, qty } of toRestock) {
      try {
        const { error: rpcErr } = await supabase!
          .rpc('apply_stock_change', {
            p_product_id:  product.id,
            p_size:        size,
            p_location_id: kumasiId,
            p_delta:       qty,          // positive — stock IN
            p_type:        'restock',
            p_note:        note.trim() || null,
            p_unit_cost:   unitCostNum,
          })
        if (rpcErr) throw new Error(rpcErr.message)
        // Success: patch local stockLevels immediately so display reflects reality
        setStockLevels(prev => ({ ...prev, [size]: (prev[size] ?? 0) + qty }))
        // Clear input for this size to prevent double-submitting on retry
        setSizeQtys(prev => ({ ...prev, [size]: '' }))
        results.push({ size, success: true })
      } catch (err: any) {
        // Do NOT abort — continue to next size
        results.push({ size, success: false, error: err?.message ?? 'Unknown error' })
      }
    }

    setSizeResults(results)
    setSaving(false)

    // Only trigger onSuccess if every size succeeded
    if (results.every(r => r.success)) {
      setTimeout(() => { onSuccess() }, 1000)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-base">Restock Product</h2>
                <p className="text-xs text-gray-500 mt-0.5 max-w-[220px] truncate">{product.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">

            {/* Per-size quantity inputs */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Quantity per Size <span className="text-red-500">*</span>
              </label>
              {loadingSizes ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(size => (
                    <div key={size} className="flex flex-col">
                      <label className="text-xs font-medium text-gray-600 mb-1 text-center">
                        {size}
                      </label>
                      <p className="text-xs text-gray-400 text-center mb-1">
                        on-hand: {loadingSizes ? '…' : (stockLevels[size] ?? 0)}
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={sizeQtys[size] ?? ''}
                        onChange={e => setSizeQtys(prev => ({ ...prev, [size]: e.target.value }))}
                        placeholder="0"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  ))}
                </div>
              )}
              {totalUnits > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  Total units: <strong className="text-gray-800">{totalUnits}</strong>
                </p>
              )}
            </div>

            {/* Unit cost */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Unit Cost (GHS) <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">— shared across all sizes</span>
              </label>
              <input
                type="number" min="0.01" step="0.01" required
                value={unitCost}
                onChange={e => setUnitCost(e.target.value)}
                placeholder="e.g. 120.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Total cost banner */}
            {totalCost && (
              <div className="bg-primary-50 border border-primary-100 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-primary-700 font-medium">Total restock cost</span>
                <span className="text-sm font-bold text-primary-800">GHS {totalCost}</span>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. New supplier delivery"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Per-size results shown after the loop completes */}
            {sizeResults.length > 0 && (
              <div className="space-y-1">
                {sizeResults.map(r => (
                  <div
                    key={r.size}
                    className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${
                      r.success
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    <span className="font-bold shrink-0">
                      {r.success ? '✓' : '✗'} Size {r.size}
                    </span>
                    {!r.success && (
                      <span className="break-words">{r.error}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving || loadingSizes || !kumasiId}
                className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-75 bg-primary-500 hover:bg-primary-600"
              >
                {saving ? 'Saving…' : 'Confirm Restock'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RestockModal

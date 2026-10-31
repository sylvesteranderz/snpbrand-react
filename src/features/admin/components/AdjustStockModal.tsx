import React, { useState, useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

interface AdjustStockModalProps {
  product: Product
  onClose: () => void
  onSuccess: () => void
}

interface SizeRow {
  size:    string
  current: number   // quantity from stock_levels (single source of truth)
  target:  string   // what admin wants it to be (string for controlled input)
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ product, onClose, onSuccess }) => {
  const [rows, setRows]       = useState<SizeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')  // pre-submit validation only
  const [note, setNote]       = useState('')
  // TODO: location picker once hub UI exists
  const [kumasiId, setKumasiId] = useState<string | null>(null)
  // Per-size results shown after the submit loop completes
  const [sizeResults, setSizeResults] = useState<{ size: string; success: boolean; error?: string }[]>([])

  // Load authoritative sizes + current per-size stock from stock_levels
  useEffect(() => {
    const load = async () => {
      setLoading(true)

      // TODO: location picker once hub UI exists
      const { data: loc } = await supabase!
        .from('locations')
        .select('id')
        .eq('name', 'Kumasi')
        .single()
      if (loc?.id) setKumasiId(loc.id)

      // 1. Get the product's size list
      const { data: prod } = await supabase!
        .from('products')
        .select('sizes, size_stock')
        .eq('id', product.id)
        .single()

      let sizes: string[] = []
      if (prod?.sizes && Array.isArray(prod.sizes) && prod.sizes.length > 0) {
        sizes = prod.sizes
      } else if (prod?.size_stock && typeof prod.size_stock === 'object') {
        sizes = Object.keys(prod.size_stock)
      } else if (product.sizes && product.sizes.length > 0) {
        sizes = product.sizes
      }
      if (sizes.length === 0) sizes = ['General']

      // 2. Read current on-hand from stock_levels (single source of truth)
      const stockMap: Record<string, number> = {}
      if (loc?.id) {
        const { data: levels } = await supabase!
          .from('stock_levels')
          .select('size, quantity')
          .eq('product_id', product.id)
          .eq('location_id', loc.id)
        ;(levels ?? []).forEach((r: any) => { stockMap[r.size] = r.quantity })
      }

      setRows(
        sizes.map(size => ({
          size,
          current: stockMap[size] ?? 0,
          target:  String(stockMap[size] ?? 0),
        }))
      )
      setLoading(false)
    }
    load()
  }, [product.id, product.sizes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSizeResults([])

    // Only process sizes where target differs from current
    const adjustments = rows
      .map(r => ({ size: r.size, delta: (parseInt(r.target) || 0) - r.current }))
      .filter(a => a.delta !== 0)

    if (adjustments.length === 0) {
      setError('No changes detected — all targets match current stock.')
      return
    }

    // Validate no target is negative
    const negativeTarget = rows.find(r => (parseInt(r.target) || 0) < 0)
    if (negativeTarget) {
      setError(`Target for size ${negativeTarget.size} cannot be negative.`)
      return
    }

    if (!kumasiId) { setError('Could not resolve location. Please try again.'); return }

    setSaving(true)
    const results: { size: string; success: boolean; error?: string }[] = []

    for (const { size, delta } of adjustments) {
      try {
        const { error: rpcErr } = await supabase!
          .rpc('apply_stock_change', {
            p_product_id:  product.id,
            p_size:        size,
            p_location_id: kumasiId,
            p_delta:       delta,        // signed: positive = up, negative = down
            p_type:        'adjustment',
            p_note:        note.trim() || 'Manual stock adjustment',
          })
        if (rpcErr) throw new Error(rpcErr.message)

        // Success: update that size's entry in local state immediately
        setRows(prev =>
          prev.map(row =>
            row.size === size ? { ...row, current: row.current + delta } : row
          )
        )
        results.push({ size, success: true })
      } catch (err: any) {
        results.push({ size, success: false, error: err?.message || 'Failed to adjust stock' })
      }
    }

    setSizeResults(results)
    setSaving(false)

    if (results.every(r => r.success)) {
      setTimeout(() => { onSuccess() }, 1200)
    }
  }

  const hasChanges = rows.some(r => (parseInt(r.target) || 0) !== r.current)

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
              <div className="p-2 bg-amber-50 rounded-lg">
                <SlidersHorizontal className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-base">Adjust Stock</h2>
                <p className="text-xs text-gray-500 mt-0.5 max-w-[220px] truncate">{product.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">

            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Set the <strong>correct target quantity</strong> for each size. An adjustment entry will be logged automatically for any size that changes.
            </p>

            {/* Per-size rows */}
            <div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 mb-1 px-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Size</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Current</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Set to</span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {rows.map((r, i) => {
                    const target   = parseInt(r.target) || 0
                    const delta    = target - r.current
                    const changed  = delta !== 0

                    return (
                      <div
                        key={r.size}
                        className={`grid grid-cols-3 gap-x-3 items-center px-3 py-2 rounded-lg border ${
                          changed ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {/* Size label */}
                        <span className="text-sm font-semibold text-gray-800">{r.size}</span>

                        {/* Current stock */}
                        <span className="text-sm text-gray-600 text-center font-medium">{r.current}</span>

                        {/* Target input + delta pill */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={r.target}
                            onChange={e => setRows(prev =>
                              prev.map((row, idx) => idx === i ? { ...row, target: e.target.value } : row)
                            )}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                          />
                          {changed && (
                            <span className={`text-xs font-bold ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Correcting opening balance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

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
                type="submit" disabled={saving || loading || !kumasiId || !hasChanges}
                className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 bg-amber-500 hover:bg-amber-600"
              >
                {saving ? 'Saving…' : 'Apply Adjustment'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdjustStockModal

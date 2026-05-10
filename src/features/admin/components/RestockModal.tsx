import React, { useState } from 'react'
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
  const [qty, setQty]         = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [note, setNote]       = useState('')
  const [date, setDate]       = useState(today())
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const totalCost =
    qty && unitCost ? (parseFloat(qty) * parseFloat(unitCost)).toFixed(2) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const qtyNum      = parseInt(qty)
    const unitCostNum = parseFloat(unitCost)

    if (!qtyNum || qtyNum < 1)       { setError('Quantity must be at least 1'); return }
    if (!unitCostNum || unitCostNum <= 0) { setError('Unit cost must be greater than 0'); return }

    setSaving(true)
    try {
      const { error: dbErr } = await supabase!
        .from('inventory_transactions')
        .insert({
          product_id: product.id,
          type:       'restock',
          quantity:   qtyNum,
          unit_cost:  unitCostNum,
          note:       note.trim() || null,
          created_at: new Date(date).toISOString(),
        })
      if (dbErr) throw dbErr
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save restock. Try again.')
    } finally {
      setSaving(false)
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
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
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Qty + Unit cost side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="1" required
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Unit Cost (GHS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="0.01" step="0.01" required
                  value={unitCost}
                  onChange={e => setUnitCost(e.target.value)}
                  placeholder="e.g. 120.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Total cost banner */}
            {totalCost && (
              <div className="bg-primary-50 border border-primary-100 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-primary-700 font-medium">Total restock cost</span>
                <span className="text-sm font-bold text-primary-800">GHS {totalCost}</span>
              </div>
            )}

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

            <div className="flex gap-3 pt-1">
              <button
                type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
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

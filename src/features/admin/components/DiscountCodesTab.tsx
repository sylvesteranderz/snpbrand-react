import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Plus, X, RefreshCw, ToggleLeft, ToggleRight, Trash2, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/currency'

interface DiscountCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_value: number
  max_uses: number | null
  uses_count: number
  per_user_limit: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

const generateCode = () => {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return 'SNP' + Array.from(bytes, b => b.toString(36)).join('').toUpperCase().substring(0, 7)
}

const defaultForm = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  min_order_value: '',
  max_uses: '',
  per_user_limit: '1',
  expires_at: '',
}

const DiscountCodesTab = () => {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchCodes = async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data) setCodes(data)
    } catch (err: any) {
      console.error('Failed to load discount codes:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCodes() }, [])

  const handleToggleActive = async (id: string, current: boolean) => {
    if (!supabase) return
    const { error } = await supabase
      .from('discount_codes')
      .update({ is_active: !current })
      .eq('id', id)
    if (error) {
      console.error('Failed to toggle discount code:', error.message)
      alert('Failed to update code status. Please refresh and try again.')
      return
    }
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Delete this discount code?')) return
    await supabase.from('discount_codes').delete().eq('id', id)
    setCodes(prev => prev.filter(c => c.id !== id))
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.code.trim()) { setFormError('Code is required'); return }
    if (!form.value || Number(form.value) <= 0) { setFormError('Value must be greater than 0'); return }
    if (form.type === 'percentage' && Number(form.value) > 100) { setFormError('Percentage cannot exceed 100'); return }
    if (!supabase) return

    setIsSaving(true)
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        min_order_value: Number(form.min_order_value) || 0,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        per_user_limit: Number(form.per_user_limit) || 1,
        expires_at: form.expires_at || null,
        is_active: true,
      }
      const { error } = await supabase.from('discount_codes').insert([payload])
      if (error) {
        setFormError(error.message.includes('unique') ? 'This code already exists.' : error.message)
      } else {
        setForm(defaultForm)
        setShowForm(false)
        fetchCodes()
      }
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const stats = {
    total: codes.length,
    active: codes.filter(c => c.is_active).length,
    totalUses: codes.reduce((s, c) => s + c.uses_count, 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Codes', value: stats.total, color: 'text-gray-900' },
          { label: 'Active Codes', value: stats.active, color: 'text-green-600' },
          { label: 'Total Uses', value: stats.totalUses, color: 'text-primary-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-5 border flex flex-col">
            <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
            <span className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Discount Codes</h2>
            <p className="text-sm text-gray-500 mt-0.5">Create and manage promotional codes</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setFormError('') }}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Create Code
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading codes...
            </div>
          ) : codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No discount codes yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Create Code" to add your first one</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {codes.map(code => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">{code.code}</span>
                        <button onClick={() => handleCopy(code.code, code.id)} className="text-gray-400 hover:text-primary-500">
                          {copiedId === code.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.type === 'percentage' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {code.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {code.type === 'percentage' ? `${code.value}%` : formatPrice(code.value)}
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      {code.min_order_value > 0 ? formatPrice(code.min_order_value) : '—'}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="font-medium text-gray-900">{code.uses_count}</span>
                      {code.max_uses !== null && (
                        <span className="text-gray-400"> / {code.max_uses}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : <span className="text-gray-400">Never</span>}
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleToggleActive(code.id, code.is_active)} className="flex items-center gap-1.5 group">
                        {code.is_active
                          ? <ToggleRight className="w-6 h-6 text-green-500 group-hover:text-green-600" />
                          : <ToggleLeft className="w-6 h-6 text-gray-300 group-hover:text-gray-400" />}
                        <span className={`text-xs font-medium ${code.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleDelete(code.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Code Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Create Discount Code</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. SAVE20"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, code: generateCode() }))}
                      className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                    >
                      Auto-generate
                    </button>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <div className="flex gap-2">
                    {(['percentage', 'fixed'] as const).map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2 px-3 border-2 rounded-lg text-sm font-medium transition-colors capitalize ${form.type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {t === 'percentage' ? '% Percentage' : 'GH₵ Fixed Amount'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {form.type === 'percentage' ? 'Discount %' : 'Discount Amount (GH₵)'} *
                    </label>
                    <input
                      type="number" min="0.01" step="0.01"
                      value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder={form.type === 'percentage' ? '20' : '10.00'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (GH₵)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.min_order_value}
                      onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (leave blank for unlimited)</label>
                    <input
                      type="number" min="1"
                      value={form.max_uses}
                      onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uses Per User</label>
                    <input
                      type="number" min="1"
                      value={form.per_user_limit}
                      onChange={e => setForm(f => ({ ...f, per_user_limit: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {isSaving ? 'Creating...' : 'Create Code'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DiscountCodesTab

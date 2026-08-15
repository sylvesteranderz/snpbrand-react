import { useRef } from 'react'
import { ChevronDown, ChevronUp, RefreshCw, WifiOff } from 'lucide-react'
import { useManualOrder } from '../hooks/useManualOrder'
import { useProductCatalog, useProductVariants } from '../hooks/useProductCatalog'
import { ORDER_CHANNELS, OrderChannel } from '../config/orderConfig'

// ─── Small shared primitives ──────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </p>
  )
}

function StyledSelect({ value, onChange, disabled, children }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full min-h-[52px] rounded-xl border border-gray-300 bg-white px-4 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-[#DEAD6F] focus:border-transparent appearance-none disabled:opacity-50 disabled:bg-gray-50"
      >
        {children}
      </select>
      {/* Chevron icon */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  emoji: string
  label: string
  selected: boolean
  onToggle: () => void
}

function ProductCard({ emoji, label, selected, onToggle }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        min-h-[88px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-4
        transition-all duration-150 active:scale-95 select-none w-full
        ${selected
          ? 'border-[#DEAD6F] bg-[#DEAD6F]/10 shadow-sm'
          : 'border-gray-200 bg-white'
        }
      `}
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span className={`text-sm font-semibold ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
      {selected && (
        <span className="w-2 h-2 rounded-full bg-[#DEAD6F]" />
      )}
    </button>
  )
}

// ─── Product detail panel (type + size dropdowns) ─────────────────────────────

interface ProductDetailProps {
  emoji: string
  label: string
  category: string
  productId: string
  size: string
  onProductChange: (id: string, price: number) => void
  onSizeChange: (size: string) => void
}

function ProductDetail({ emoji, label, category, productId, size, onProductChange, onSizeChange }: ProductDetailProps) {
  const { products, loading: productsLoading } = useProductCatalog(category, true)
  const { variants, loading: variantsLoading } = useProductVariants(productId || null)

  return (
    <div className="space-y-4 bg-white rounded-2xl p-4 border border-[#DEAD6F]/40">
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-bold text-gray-800">{label}</span>
      </div>

      {/* Type dropdown */}
      <div>
        <Label required>Type</Label>
        <StyledSelect
          value={productId}
          onChange={e => {
            const selected = products.find(p => p.id === e.target.value)
            onProductChange(e.target.value, selected?.price ?? 0)
          }}
          disabled={productsLoading}
        >
          <option value="">
            {productsLoading ? 'Loading…' : `Select ${label.toLowerCase()} type…`}
          </option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} — GHC {p.price.toFixed(2)}
            </option>
          ))}
        </StyledSelect>
      </div>

      {/* Size dropdown — only appears once a type is chosen */}
      {productId && (
        <div>
          <Label required>Size</Label>
          <StyledSelect
            value={size}
            onChange={e => onSizeChange(e.target.value)}
            disabled={variantsLoading}
          >
            <option value="">
              {variantsLoading ? 'Loading sizes…' : 'Select size…'}
            </option>
            {variants.map(v => (
              <option key={v.size} value={v.size} disabled={v.quantity === 0}>
                {v.quantity === 0
                  ? `Size ${v.size} — out of stock`
                  : `Size ${v.size} — ${v.quantity} in stock`
                }
              </option>
            ))}
          </StyledSelect>
        </div>
      )}
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function NewOrderForm() {
  const {
    form, set,
    toggleSlippers, toggleShirt,
    setSlippersProduct, setShirtProduct,
    incrementQty, decrementQty,
    isCombo, totalPrice,
    suggestions, showSuggestions, setShowSuggestions, selectSuggestion,
    submitting, toast, submit,
    pending, syncNow, syncing,
  } = useManualOrder()

  const nameInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Offline pending banner ─────────────────────────────────────── */}
      {pending.length > 0 && (
        <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <span className="text-sm font-medium flex items-center gap-2">
            <WifiOff size={16} />
            {pending.length} order{pending.length > 1 ? 's' : ''} pending sync
          </span>
          <button
            onClick={() => syncNow()}
            disabled={syncing}
            className="flex items-center gap-1 text-sm font-semibold bg-white/20 rounded-lg px-3 py-1 min-h-[36px]"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        </div>
      )}

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 rounded-full bg-[#DEAD6F]" />
          <h1 className="text-xl font-bold text-gray-900 font-montserrat">New Order</h1>
        </div>
      </div>

      {/* ── Scrollable form body ────────────────────────────────────────── */}
      {/* pb-28 keeps content above the fixed LOG ORDER button */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 space-y-6">

        {/* 1 — Customer name */}
        <div className="relative">
          <Label required>Customer name</Label>
          <input
            ref={nameInputRef}
            type="text"
            value={form.customerName}
            onChange={e => set('customerName', e.target.value)}
            onFocus={() => form.customerName.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Start typing a name…"
            autoComplete="off"
            className="w-full min-h-[52px] rounded-xl border border-gray-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#DEAD6F] focus:border-transparent"
          />

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              {suggestions.map(s => (
                <button
                  key={s.customer_name}
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-3 min-h-[52px] hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{s.customer_name}</span>
                  {s.customer_phone && (
                    <span className="block text-xs text-gray-400 mt-0.5">{s.customer_phone}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2 — Phone */}
        <div>
          <Label>Phone number</Label>
          <input
            type="tel"
            inputMode="numeric"
            value={form.customerPhone}
            onChange={e => set('customerPhone', e.target.value)}
            placeholder="e.g. 0244 123 456"
            className="w-full min-h-[52px] rounded-xl border border-gray-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#DEAD6F] focus:border-transparent"
          />
        </div>

        {/* 3 — Delivery address */}
        <div>
          <Label required>Delivery address</Label>
          <input
            type="text"
            value={form.deliveryAddress}
            onChange={e => set('deliveryAddress', e.target.value)}
            placeholder="e.g. Legon, near Bani Hotel"
            className="w-full min-h-[52px] rounded-xl border border-gray-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#DEAD6F] focus:border-transparent"
          />
        </div>

        {/* 4 — Product cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label required>Product</Label>
            {isCombo && (
              <span className="text-xs font-bold uppercase tracking-wide bg-[#DEAD6F] text-black px-2.5 py-1 rounded-full">
                Combo ✓
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ProductCard
              emoji="👟"
              label="Slippers"
              selected={form.slippersSelected}
              onToggle={toggleSlippers}
            />
            <ProductCard
              emoji="👕"
              label="Shirt"
              selected={form.shirtSelected}
              onToggle={toggleShirt}
            />
          </div>
        </div>

        {/* 5 — Slippers detail (type + size) */}
        {form.slippersSelected && (
          <ProductDetail
            emoji="👟"
            label="Slippers"
            category="slippers"
            productId={form.slippersProductId}
            size={form.slippersSize}
            onProductChange={setSlippersProduct}
            onSizeChange={s => set('slippersSize', s)}
          />
        )}

        {/* 6 — Shirt detail (type + size) */}
        {form.shirtSelected && (
          <ProductDetail
            emoji="👕"
            label="Shirt"
            category="shirt"
            productId={form.shirtProductId}
            size={form.shirtSize}
            onProductChange={setShirtProduct}
            onSizeChange={s => set('shirtSize', s)}
          />
        )}

        {/* 7 — Order channel */}
        <div>
          <Label required>Order channel</Label>
          <div className="flex gap-2 flex-wrap">
            {ORDER_CHANNELS.map(ch => (
              <button
                key={ch}
                type="button"
                onClick={() => set('channel', ch as OrderChannel)}
                className={`
                  flex-1 min-w-[100px] min-h-[48px] px-4 py-2 rounded-xl font-medium text-sm
                  transition-all active:scale-95 select-none border
                  ${form.channel === ch
                    ? 'bg-[#DEAD6F] text-black border-[#DEAD6F] shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                  }
                `}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* 8 — Quantity */}
        <div>
          <Label>Quantity</Label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={decrementQty}
              disabled={form.quantity <= 1}
              className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gray-900 w-10 text-center tabular-nums">
              {form.quantity}
            </span>
            <button
              type="button"
              onClick={incrementQty}
              className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 active:scale-95 transition-all flex items-center justify-center"
            >
              +
            </button>
            {isCombo && (
              <span className="text-xs text-gray-400 ml-1">applies to both</span>
            )}
          </div>
        </div>

        {/* 9 — Price (read-only, auto-calculated) */}
        {(form.slippersSelected || form.shirtSelected) && (
          <div>
            <Label>Total price</Label>
            <div className="flex items-center gap-3 min-h-[52px] rounded-xl border border-gray-200 bg-gray-50 px-4">
              <span className="text-2xl font-bold text-gray-900">
                ₵{totalPrice.toFixed(2)}
              </span>
              {isCombo && (
                <span className="text-xs text-gray-400">
                  (₵{form.slippersProductPrice.toFixed(2)} + ₵{form.shirtProductPrice.toFixed(2)}) × {form.quantity}
                </span>
              )}
              {!isCombo && form.quantity > 1 && (
                <span className="text-xs text-gray-400">
                  ₵{(form.slippersSelected ? form.slippersProductPrice : form.shirtProductPrice).toFixed(2)} × {form.quantity}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 10 — Notes (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => set('notesOpen', !form.notesOpen)}
            className="flex items-center justify-between w-full min-h-[48px] px-4 py-3 rounded-xl bg-white border border-gray-200"
          >
            <span className="text-sm font-medium text-gray-700">
              Order notes
              {form.notes && <span className="ml-1 text-[#DEAD6F]">•</span>}
            </span>
            {form.notesOpen
              ? <ChevronUp size={18} className="text-gray-400" />
              : <ChevronDown size={18} className="text-gray-400" />
            }
          </button>

          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: form.notesOpen ? '200px' : '0px' }}
          >
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any special instructions…"
              rows={3}
              className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#DEAD6F] focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* 11 — Fixed LOG ORDER button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className={`
            w-full min-h-[56px] rounded-2xl text-lg font-bold tracking-wide transition-all active:scale-[0.98]
            ${submitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#DEAD6F] text-black shadow-md'
            }
          `}
        >
          {submitting ? 'Logging…' : 'LOG ORDER'}
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`
            fixed top-4 left-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium
            shadow-lg transition-all duration-300 text-center
            ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

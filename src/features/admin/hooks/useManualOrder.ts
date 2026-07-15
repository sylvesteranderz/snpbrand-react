import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { OrderChannel } from '../config/orderConfig'
import { usePendingOrders } from './usePendingOrders'

// ─── Form state ───────────────────────────────────────────────────────────────

export interface FormState {
  customerName: string
  customerPhone: string
  deliveryAddress: string

  // Slippers selection
  slippersSelected: boolean
  slippersProductId: string
  slippersSize: string
  slippersProductPrice: number

  // Shirt selection
  shirtSelected: boolean
  shirtProductId: string
  shirtSize: string
  shirtProductPrice: number

  quantity: number
  channel: OrderChannel | ''
  notes: string
  notesOpen: boolean
}

export interface AutocompleteSuggestion {
  customer_name: string
  customer_phone: string | null
}

export interface Toast {
  type: 'success' | 'error'
  message: string
}

const DEFAULT_FORM: FormState = {
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',

  slippersSelected: false,
  slippersProductId: '',
  slippersSize: '',
  slippersProductPrice: 0,

  shirtSelected: false,
  shirtProductId: '',
  shirtSize: '',
  shirtProductPrice: 0,

  quantity: 1,
  channel: '',
  notes: '',
  notesOpen: false,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `MAN-${ymd}-${rand}`
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useManualOrder() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const { addPending, pending, syncNow, syncing } = usePendingOrders()

  // Derived values
  const isCombo = form.slippersSelected && form.shirtSelected
  const totalPrice =
    ((form.slippersSelected ? form.slippersProductPrice : 0) +
      (form.shirtSelected ? form.shirtProductPrice : 0)) *
    form.quantity

  // Generic field setter
  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  // Product card toggles — resets downstream selections when deselecting
  const toggleSlippers = useCallback(() => {
    setForm(prev => ({
      ...prev,
      slippersSelected: !prev.slippersSelected,
      slippersProductId: '',
      slippersSize: '',
      slippersProductPrice: 0,
    }))
  }, [])

  const toggleShirt = useCallback(() => {
    setForm(prev => ({
      ...prev,
      shirtSelected: !prev.shirtSelected,
      shirtProductId: '',
      shirtSize: '',
      shirtProductPrice: 0,
    }))
  }, [])

  // Product type selection — also clears size whenever the type changes
  const setSlippersProduct = useCallback((id: string, price: number) => {
    setForm(prev => ({ ...prev, slippersProductId: id, slippersProductPrice: price, slippersSize: '' }))
  }, [])

  const setShirtProduct = useCallback((id: string, price: number) => {
    setForm(prev => ({ ...prev, shirtProductId: id, shirtProductPrice: price, shirtSize: '' }))
  }, [])

  // Quantity stepper
  const incrementQty = useCallback(() => setForm(prev => ({ ...prev, quantity: prev.quantity + 1 })), [])
  const decrementQty = useCallback(() => setForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) })), [])

  // Debounced autocomplete query
  useEffect(() => {
    const name = form.customerName
    clearTimeout(debounceRef.current)

    if (name.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      if (!supabase) return
      const { data } = await supabase
        .from('orders')
        .select('customer_name, customer_phone')
        .ilike('customer_name', `%${name}%`)
        .not('customer_name', 'is', null)
        .order('customer_name')
        .limit(10)

      if (!data) return

      const seen = new Set<string>()
      const unique = data
        .filter(row => {
          if (!row.customer_name || seen.has(row.customer_name)) return false
          seen.add(row.customer_name)
          return true
        })
        .slice(0, 5)

      setSuggestions(unique as AutocompleteSuggestion[])
      setShowSuggestions(unique.length > 0)
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [form.customerName])

  const selectSuggestion = useCallback(async (s: AutocompleteSuggestion) => {
    setForm(prev => ({ ...prev, customerName: s.customer_name, customerPhone: s.customer_phone ?? '' }))
    setShowSuggestions(false)

    // Fetch most-recent phone if the suggestion row had none
    if (!s.customer_phone && supabase) {
      const { data } = await supabase
        .from('orders')
        .select('customer_phone')
        .eq('customer_name', s.customer_name)
        .not('customer_phone', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data?.[0]?.customer_phone) {
        setForm(prev => ({ ...prev, customerPhone: data[0].customer_phone as string }))
      }
    }
  }, [])

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const submit = useCallback(async () => {
    const {
      customerName, customerPhone, deliveryAddress, channel,
      slippersSelected, slippersProductId, slippersSize, slippersProductPrice,
      shirtSelected, shirtProductId, shirtSize, shirtProductPrice,
      quantity, notes,
    } = form

    // Validation
    if (!customerName.trim())                   { showToast('error', 'Customer name is required');    return }
    if (!deliveryAddress.trim())                { showToast('error', 'Delivery address is required'); return }
    if (!slippersSelected && !shirtSelected)    { showToast('error', 'Select at least one product');  return }
    if (slippersSelected && !slippersProductId) { showToast('error', 'Select a slippers type');       return }
    if (slippersSelected && !slippersSize)      { showToast('error', 'Select a slippers size');       return }
    if (shirtSelected && !shirtProductId)       { showToast('error', 'Select a shirt type');          return }
    if (shirtSelected && !shirtSize)            { showToast('error', 'Select a shirt size');          return }
    if (!channel)                               { showToast('error', 'Select an order channel');      return }
    if (totalPrice <= 0)                        { showToast('error', 'Price must be greater than 0'); return }

    const orderNumber = generateOrderNumber()

    const items: Record<string, unknown>[] = []
    if (slippersSelected) items.push({ product_type: 'slippers', product_id: slippersProductId, size: slippersSize, quantity, price: slippersProductPrice })
    if (shirtSelected)    items.push({ product_type: 'shirt',    product_id: shirtProductId,    size: shirtSize,    quantity, price: shirtProductPrice })

    const productType = isCombo ? 'combo' : (slippersSelected ? 'slippers' : 'shirt')
    const primarySize = isCombo ? null    : (slippersSelected ? slippersSize : shirtSize)

    const payload = {
      order_number:     orderNumber,
      user_id:          null,
      total_amount:     totalPrice,
      status:           'pending',
      payment_method:   'pay_on_delivery',
      shipping_address: { address: deliveryAddress },
      items,
      customer_info:    { name: customerName, phone: customerPhone, address: deliveryAddress },
      customer_name:    customerName.trim(),
      customer_phone:   customerPhone.trim() || null,
      product_type:     productType,
      size:             primarySize,
      quantity,
      order_channel:    channel,
      notes:            notes.trim() || null,
      source:           'manual',
    }

    setSubmitting(true)

    if (!navigator.onLine) {
      addPending(payload as Record<string, unknown>)
      showToast('success', 'Saved offline — will sync when connected')
      setForm(DEFAULT_FORM)
      setSubmitting(false)
      return
    }

    if (!supabase) {
      showToast('error', 'Database not configured')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('orders').insert(payload)
    setSubmitting(false)

    if (error) {
      showToast('error', `Failed: ${error.message}`)
    } else {
      showToast('success', `✓ Order ${orderNumber} logged`)
      setForm(DEFAULT_FORM)
    }
  }, [form, totalPrice, isCombo, addPending, showToast])

  return {
    form, set,
    toggleSlippers, toggleShirt,
    setSlippersProduct, setShirtProduct,
    incrementQty, decrementQty,
    isCombo, totalPrice,
    suggestions, showSuggestions, setShowSuggestions, selectSuggestion,
    submitting, toast, submit,
    pending, syncNow, syncing,
  }
}

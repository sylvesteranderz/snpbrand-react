import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'snp_pending_orders'

export interface PendingOrder {
  id: string
  timestamp: string
  payload: Record<string, unknown>
}

function loadPending(): PendingOrder[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function savePending(orders: PendingOrder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export function usePendingOrders() {
  const [pending, setPending] = useState<PendingOrder[]>(loadPending)
  const [syncing, setSyncing] = useState(false)
  const syncingRef = useRef(false)

  const syncNow = useCallback(async (): Promise<number> => {
    if (!supabase || syncingRef.current) return 0
    const toSync = loadPending()
    if (toSync.length === 0) return 0

    syncingRef.current = true
    setSyncing(true)

    const failed: PendingOrder[] = []
    for (const order of toSync) {
      const { error } = await supabase.from('orders').insert(order.payload)
      if (error) failed.push(order)
    }

    savePending(failed)
    setPending(failed)
    syncingRef.current = false
    setSyncing(false)

    return toSync.length - failed.length
  }, [])

  // Sync on mount if online and there are pending orders
  useEffect(() => {
    if (navigator.onLine && loadPending().length > 0) {
      syncNow()
    }
  }, [syncNow])

  // Sync whenever the device comes back online
  useEffect(() => {
    window.addEventListener('online', syncNow)
    return () => window.removeEventListener('online', syncNow)
  }, [syncNow])

  const addPending = useCallback((payload: Record<string, unknown>) => {
    const order: PendingOrder = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      payload,
    }
    setPending(prev => {
      const next = [...prev, order]
      savePending(next)
      return next
    })
  }, [])

  return { pending, addPending, syncNow, syncing }
}

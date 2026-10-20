import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/currency'

const POLL_MS = 60_000

const PulseBar = () => {
  const [stats, setStats] = useState({
    revenueToday: 0,
    ordersToday: 0,
    pendingCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Fetch only what the bar shows: today's order totals and a pending count.
    // Previously this downloaded every order (~500 KB) every 30 seconds.
    const fetchStats = async () => {
      if (!supabase) return
      try {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const [today, pending] = await Promise.all([
          supabase.from('orders').select('total_amount').gte('created_at', todayStart.toISOString()),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ])
        if (!active) return
        if (today.error) throw today.error
        if (pending.error) throw pending.error

        const todayOrders = today.data || []
        setStats({
          revenueToday: todayOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
          ordersToday: todayOrders.length,
          pendingCount: pending.count || 0,
        })
      } catch (err) {
        console.error('Failed to fetch pulse bar stats:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    let interval: ReturnType<typeof setInterval> | undefined
    const start = () => {
      if (interval) return
      fetchStats()
      interval = setInterval(fetchStats, POLL_MS)
    }
    const stop = () => {
      if (interval) clearInterval(interval)
      interval = undefined
    }
    // Pause polling while the tab or phone screen is in the background
    const onVisibility = () => (document.visibilityState === 'visible' ? start() : stop())

    if (document.visibilityState === 'visible') start()
    else fetchStats()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      active = false
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-4 shadow-sm w-full transition-colors">
      <div className="container mx-auto flex items-center justify-center space-x-2 text-xs md:text-sm font-semibold text-gray-700">
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-pulse-pipeline absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        
        {loading ? (
          <span className="text-gray-400 font-normal">Loading pipeline...</span>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-bold">
            <span className="text-gray-950">
              Revenue Today: <span className="text-emerald-600">{formatPrice(stats.revenueToday)}</span>
            </span>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <span className="text-gray-950">
              Orders Today: <span className="text-blue-600">{stats.ordersToday}</span>
            </span>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <span className="text-gray-950">
              Pending Count: <span className="text-orange-600">{stats.pendingCount}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PulseBar

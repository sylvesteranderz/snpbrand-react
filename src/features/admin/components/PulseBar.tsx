import { useEffect, useState } from 'react'
import { OrderService } from '@/services/supabaseService'
import { formatPrice } from '@/utils/currency'

const PulseBar = () => {
  const [stats, setStats] = useState({
    revenueToday: 0,
    ordersToday: 0,
    pendingCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchStats = async () => {
      try {
        const orders = await OrderService.getAllOrders()
        if (!active) return

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const todayOrders = orders.filter((o: any) => new Date(o.created_at) >= todayStart)
        const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
        const pending = orders.filter((o: any) => o.status === 'pending').length

        setStats({
          revenueToday: todayRevenue,
          ordersToday: todayOrders.length,
          pendingCount: pending,
        })
      } catch (err) {
        console.error('Failed to fetch pulse bar stats:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000)

    return () => {
      active = false
      clearInterval(interval)
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

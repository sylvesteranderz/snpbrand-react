import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BarChart3,
  ShoppingCart,
  Package,
  LineChart,
  MoreHorizontal,
} from 'lucide-react'

// Icon swap notes:
// BarChart3   → Overview/Dashboard  — placeholder, swap to a house/grid icon if desired
// ShoppingCart → Orders             — good as-is
// Package     → Products            — good as-is
// LineChart   → Finance             — good as-is
// MoreHorizontal → More             — placeholder, swap to a hamburger/grid-2x2 if desired

type BottomTab = {
  id: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  href: string
  // If true, this tab is also "active" when any of these ?tab= values are set
  moreTabIds?: string[]
}

const BOTTOM_TABS: BottomTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    Icon: BarChart3,
    href: '/admin',
  },
  {
    id: 'orders',
    label: 'Orders',
    Icon: ShoppingCart,
    href: '/admin?tab=orders',
  },
  {
    id: 'products',
    label: 'Products',
    Icon: Package,
    href: '/admin?tab=products',
  },
  {
    id: 'finance',
    label: 'Finance',
    Icon: LineChart,
    href: '/admin/finance',
  },
  {
    id: 'more',
    label: 'More',
    Icon: MoreHorizontal,
    href: '/admin/more',
    // "More" covers these sub-sections that live inside AdminDashboard
    moreTabIds: ['inventory', 'users', 'analytics', 'discounts'],
  },
]

const AdminBottomTabBar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const isActive = (tab: BottomTab): boolean => {
    if (tab.id === 'finance') {
      return location.pathname === '/admin/finance'
    }
    if (tab.id === 'more') {
      return (
        location.pathname === '/admin/more' ||
        (location.pathname === '/admin' && (tab.moreTabIds ?? []).includes(currentTab))
      )
    }
    // Overview, Orders, Products — all live at /admin with ?tab=
    return (
      location.pathname === '/admin' &&
      (tab.id === 'overview'
        ? currentTab === 'overview' || currentTab === tab.id
        : currentTab === tab.id)
    )
  }

  const handlePress = (tab: BottomTab) => {
    if (tab.id === 'finance') {
      navigate('/admin/finance')
    } else if (tab.id === 'more') {
      navigate('/admin/more')
    } else if (tab.id === 'overview') {
      // Navigate to /admin with no tab param → overview
      navigate('/admin')
    } else {
      navigate(`/admin?tab=${tab.id}`)
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden bg-white border-t border-gray-200 z-40"
      aria-label="Admin navigation"
    >
      {BOTTOM_TABS.map((tab) => {
        const active = isActive(tab)
        return (
          <button
            key={tab.id}
            id={`admin-bottom-tab-${tab.id}`}
            onClick={() => handlePress(tab)}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${
              active ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.Icon
              className={`w-5 h-5 mb-0.5 ${active ? 'text-primary-600' : 'text-gray-400'}`}
            />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default AdminBottomTabBar

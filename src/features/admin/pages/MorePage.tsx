import { useNavigate } from 'react-router-dom'
import { Warehouse, Users, TrendingUp, Tag } from 'lucide-react'
import AdminBottomTabBar from '@/features/admin/components/AdminBottomTabBar'

// Icon swap notes:
// Warehouse   → Inventory  — good as-is
// Users       → Users      — good as-is
// TrendingUp  → Analytics  — placeholder, swap to BarChart2 or PieChart if desired
// Tag         → Discounts  — good as-is

type MoreLink = {
  id: string
  label: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
  tab: string
}

const MORE_LINKS: MoreLink[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'View and manage stock levels and ledger',
    Icon: Warehouse,
    tab: 'inventory',
  },
  {
    id: 'users',
    label: 'Users',
    description: 'Manage customer accounts',
    Icon: Users,
    tab: 'users',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Sales analytics and reports',
    Icon: TrendingUp,
    tab: 'analytics',
  },
  {
    id: 'discounts',
    label: 'Discounts',
    description: 'Manage discount codes and promotions',
    Icon: Tag,
    tab: 'discounts',
  },
]

const MorePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">More</h1>
        <p className="text-sm text-gray-500 mb-6">Additional admin sections</p>

        <ul className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 shadow-sm">
          {MORE_LINKS.map((link) => (
            <li key={link.id}>
              <button
                id={`more-link-${link.id}`}
                onClick={() => navigate(`/admin?tab=${link.tab}`)}
                className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <link.Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AdminBottomTabBar />
    </div>
  )
}

export default MorePage

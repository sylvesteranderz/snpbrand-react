import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Package, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders } = useAppContext();

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) return null;

  const pendingCount = orders.filter((order) => order.status !== 'delivered').length;

  const navItems = [
    {
      label: 'Orders',
      icon: ClipboardList,
      path: '/orders',
      badge: pendingCount,
    },
    {
      label: 'Stock',
      icon: Package,
      path: '/stock',
      badge: 0,
    },
    {
      label: 'Walk-in',
      icon: ShoppingBag,
      path: '/walkin',
      badge: 0,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] backdrop-blur-md flex items-center justify-around px-4 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/orders' && location.pathname === '/');
        const IconComponent = item.icon;

        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] py-1 text-center focus:outline-none transition-colors duration-200"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="relative">
              <IconComponent
                className={`w-6 h-6 stroke-[2] transition-transform duration-200 ${
                  isActive ? 'text-primary-500 scale-105' : 'text-gray-400'
                }`}
              />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium transition-colors duration-200 ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppProvider } from './hooks/useAppContext';
import { BottomNav } from './components/BottomNav';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { StockPage } from './pages/StockPage';
import { WalkInPage } from './pages/WalkInPage';

// Route Guard for Accra/Kumasi Hub Partner and Admin Page Access
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500 mt-4">Verifying session...</p>
      </div>
    );
  }

  if (!user || (role !== 'hub_partner' && role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Layout
const AppContent: React.FC = () => {
  const { loading, role, selectedLocation, setSelectedLocation } = useAuth();
  const location = useLocation();
  
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Location Switcher Pill (Admin Only, shown on all pages except login) */}
      {!loading && !isLoginPage && role === 'admin' && (
        <div className="w-full max-w-md mx-auto px-4 pt-4 pb-1">
          <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex h-[48px] items-center">
            <button
              type="button"
              onClick={() => setSelectedLocation('Kumasi')}
              className={`flex-1 rounded-lg text-sm font-bold transition-all min-h-[40px] flex items-center justify-center ${
                selectedLocation === 'Kumasi'
                  ? 'bg-primary-500 text-white shadow-sm font-extrabold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Kumasi Hub
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation('Accra')}
              className={`flex-1 rounded-lg text-sm font-bold transition-all min-h-[40px] flex items-center justify-center ${
                selectedLocation === 'Accra'
                  ? 'bg-primary-500 text-white shadow-sm font-extrabold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Accra Hub
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Main Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-24 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <StockPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/walkin"
            element={
              <ProtectedRoute>
                <WalkInPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirects */}
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </main>

      {/* Persistent Navigation Bar (Hidden on login page) */}
      {!loading && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

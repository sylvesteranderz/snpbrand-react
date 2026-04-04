import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuthSupabase'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (requireAdmin) {
    if (!isAuthenticated || user?.role !== 'admin') {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

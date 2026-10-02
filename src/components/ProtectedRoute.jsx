import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="card loading-skeleton-wrapper" aria-busy="true" aria-live="polite">
        <div className="skeleton-bone" style={{ width: '40%', height: '2rem', marginBottom: '1rem' }} />
        <div className="skeleton-bone" style={{ width: '100%', height: '4rem', marginBottom: '0.5rem' }} />
        <div className="skeleton-bone" style={{ width: '80%', height: '2rem' }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

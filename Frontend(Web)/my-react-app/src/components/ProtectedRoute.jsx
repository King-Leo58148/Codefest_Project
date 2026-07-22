import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/" replace />
  }
  return children || <Outlet />
}

export default ProtectedRoute

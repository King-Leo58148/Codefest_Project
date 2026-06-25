import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accesstoken') || localStorage.getItem('adminToken')

  if (!token) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute
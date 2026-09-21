import { Navigate, Outlet } from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

import LoadingScreen from './LoadingScreen'

function ProtectedRoute() {
  const {
    user,
    loading,
    authInitialized,
  } = useAuth()

  if (
    !authInitialized ||
    loading
  ) {
    return (
      <LoadingScreen
        message="Checking your session..."
      />
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message:
            'Please log in to access this page.',
        }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute
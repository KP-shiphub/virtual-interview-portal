import { Navigate, Outlet } from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

import LoadingScreen from './LoadingScreen'

function AdminRoute() {
  const {
    user,
    profile,
    loading,
    profileLoading,
    authInitialized,
  } = useAuth()

  if (
    !authInitialized ||
    loading ||
    profileLoading
  ) {
    return (
      <LoadingScreen
        message="Checking administrator access..."
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
            'Please log in to access the administrator dashboard.',
        }}
      />
    )
  }

  if (
    profile?.role !== 'admin'
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <Outlet />
}

export default AdminRoute
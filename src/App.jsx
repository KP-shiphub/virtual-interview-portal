import { Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import InterviewInstructions from './pages/InterviewInstructions'
import DeviceCheck from './pages/DeviceCheck'
import Interview from './pages/Interview'
import InterviewCompleted from './pages/InterviewCompleted'
import AdminDashboard from './pages/AdminDashboard'
import AdminInterview from './pages/AdminInterview'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* Participant protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/interview/instructions"
              element={
                <InterviewInstructions />
              }
            />

            <Route
              path="/interview/device-check"
              element={<DeviceCheck />}
            />

            <Route
              path="/interview"
              element={<Interview />}
            />

            <Route
              path="/interview/completed"
              element={
                <InterviewCompleted />
              }
            />
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/interview/:participantId"
              element={<AdminInterview />}
            />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
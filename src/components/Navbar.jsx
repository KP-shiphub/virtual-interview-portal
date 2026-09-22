import {
  NavLink,
  Link,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function Navbar() {
  const {
    user,
    profile,
    loading,
    logout,
  } = useAuth()

  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()

      navigate('/', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      )
    }
  }

  if (loading) {
    return (
      <header className="site-header">
        <div className="container navbar">
          <Link
            to="/"
            className="brand"
          >
            <span className="brand-text">
              StudyVue - Virtual Interview Portal
            </span>
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link
          to="/"
          className="brand"
        >
          <span className="brand-text">
            StudyVue - Virtual Interview Portal
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">
            Home
          </NavLink>

          {!user ? (
            <>
              <NavLink to="/login">
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="nav-button"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard">
                Dashboard
              </NavLink>

              <NavLink to="/profile">
                Profile
              </NavLink>

              {profile?.role === 'admin' && (
                <NavLink to="/admin">
                  Admin
                </NavLink>
              )}

              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
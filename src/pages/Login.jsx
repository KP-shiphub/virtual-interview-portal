import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const { user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [success, setSuccess] = useState(
    location.state?.message || ''
  )

  useEffect(() => {
    if (user) {
      navigate('/dashboard', {
        replace: true,
      })
    }
  }, [user, navigate])

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

    if (loginError) {
      setError(
        'Login failed. Please check your email and password.'
      )
      setLoading(false)
      return
    }

    navigate('/dashboard')

    setLoading(false)
  }

  return (
    <section className="auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-heading">
            <p className="eyebrow">
              WELCOME BACK
            </p>

            <h1>Sign in</h1>

            <p>
              Access your interview dashboard using
              your account credentials.
            </p>
          </div>

          {error && (
            <div className="form-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-message success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label
                htmlFor="loginEmail"
                className="form-label"
              >
                Email address
              </label>

              <input
                id="loginEmail"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="loginPassword"
                className="form-label"
              >
                Password
              </label>

              <input
                id="loginPassword"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
              />
            </div>

            <div className="form-link-row">
              <Link
                to="/reset-password"
                className="form-link"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Signing in...'
                : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
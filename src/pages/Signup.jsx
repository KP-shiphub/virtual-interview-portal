import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../supabaseClient'

function Signup() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must contain at least 6 characters.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        })

      if (signupError) {
        setError(signupError.message)
        return
      }

      if (data.session) {
        navigate('/dashboard', {
          replace: true,
        })

        return
      }

      setSuccess(
        'Account created successfully. Please check your email to continue.'
      )
    } catch (signupError) {
      setError(
        signupError.message ||
          'Something went wrong while creating your account.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-heading">
            <p className="eyebrow">
              CREATE YOUR ACCOUNT
            </p>

            <h1>Start your interview journey</h1>

            <p>
              Create an account to access your virtual
              interview dashboard.
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
                htmlFor="fullName"
                className="form-label"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="email"
                className="form-label"
              >
                Email address
              </label>

              <input
                id="email"
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
                htmlFor="password"
                className="form-label"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="confirmPassword"
                className="form-label"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Signup
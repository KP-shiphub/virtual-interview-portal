import { useState } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '../supabaseClient'

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo:
            `${window.location.origin}/reset-password`,
        }
      )

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(
      'If an account exists for this email, a password reset link has been sent.'
    )

    setLoading(false)
  }

  return (
    <section className="auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-heading">
            <p className="eyebrow">
              PASSWORD RECOVERY
            </p>

            <h1>Reset your password</h1>

            <p>
              Enter your account email and we will
              send instructions to reset your password.
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
                htmlFor="resetEmail"
                className="form-label"
              >
                Email address
              </label>

              <input
                id="resetEmail"
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

            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Sending...'
                : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            Remember your password?{' '}
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResetPassword
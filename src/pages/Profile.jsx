import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, profile } = useAuth()

  return (
    <section className="simple-page">
      <div className="container">
        <p className="eyebrow">
          ACCOUNT PROFILE
        </p>

        <h1>Your profile</h1>

        <div
          className="auth-card"
          style={{
            maxWidth: '650px',
            marginTop: '30px',
          }}
        >
          <div className="form-group">
            <span className="form-label">
              Full name
            </span>

            <p>{profile?.full_name || 'Not provided'}</p>
          </div>

          <div className="form-group">
            <span className="form-label">
              Email
            </span>

            <p>{user?.email}</p>
          </div>

          <div className="form-group">
            <span className="form-label">
              Account role
            </span>

            <p>{profile?.role || 'participant'}</p>
          </div>

          <div className="form-group">
            <span className="form-label">
              Account created
            </span>

            <p>
              {profile?.created_at
                ? new Date(
                    profile.created_at
                  ).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
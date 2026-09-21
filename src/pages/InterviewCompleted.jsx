import { Link, useLocation } from 'react-router-dom'

function InterviewCompleted() {
  const location = useLocation()

  const completedAt =
    location.state?.completedAt

  const questionCount =
    location.state?.questionCount || 20

  const formattedDate = completedAt
    ? new Date(
        completedAt
      ).toLocaleString()
    : new Date().toLocaleString()

  return (
    <section className="interview-complete-page">
      <div className="container interview-complete-container">
        <div className="completion-card">
          <div className="completion-icon">
            ✓
          </div>

          <p className="eyebrow">
            INTERVIEW SUBMITTED
          </p>

          <h1>
            Interview completed
          </h1>

          <p className="completion-description">
            Your interview responses have been
            successfully submitted and securely
            stored.
          </p>

          <div className="completion-details">
            <div>
              <span>Questions completed</span>

              <strong>
                {questionCount}/{questionCount}
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong>
                Completed
              </strong>
            </div>

            <div>
              <span>Submitted</span>

              <strong>
                {formattedDate}
              </strong>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="button button-primary"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

export default InterviewCompleted
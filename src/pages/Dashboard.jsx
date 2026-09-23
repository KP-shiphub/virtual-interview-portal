import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

import {
  getLatestInterview,
} from '../services/interviewService'

function Dashboard() {
  const {
    user,
    profile,
    authInitialized,
  } = useAuth()

  const [interview, setInterview] =
    useState(null)

  const [
    loadingInterview,
    setLoadingInterview,
  ] = useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let active = true

    async function loadInterview() {
      if (!user) {
        return
      }

      try {
        setLoadingInterview(true)
        setError('')

        const data =
          await getLatestInterview(
            user.id
          )

        if (active) {
          setInterview(data)
        }
      } catch (loadError) {
        console.error(
          'Dashboard interview error:',
          loadError
        )

        if (active) {
          setError(
            'Unable to load your interview status.'
          )
        }
      } finally {
        if (active) {
          setLoadingInterview(false)
        }
      }
    }

    loadInterview()

    return () => {
      active = false
    }
  }, [user])


  if (
    !authInitialized ||
    !user
  ) {
    return (
      <section className="dashboard-page">
        <div className="container dashboard-container">
          <div className="dashboard-loading">
            Loading your dashboard...
          </div>
        </div>
      </section>
    )
  }


  const interviewStatus =
    interview?.status ||
    'not_started'


  // Always keep the displayed progress
  // between 1 and 20.
  const rawQuestionNumber =
    Number(
      interview?.current_question_number
    ) || 1

  const currentQuestionNumber =
    Math.min(
      Math.max(
        rawQuestionNumber,
        1
      ),
      20
    )


  function getStatusLabel() {
    if (
      interviewStatus ===
      'completed'
    ) {
      return 'Completed'
    }

    if (
      interviewStatus ===
      'in_progress'
    ) {
      return 'In Progress'
    }

    if (
      interviewStatus ===
      'failed'
    ) {
      return 'Needs Attention'
    }

    return 'Not Started'
  }


  return (
    <section className="dashboard-page">
      <div className="container dashboard-container">

        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">
              PARTICIPANT DASHBOARD
            </p>

            <h1>
              Welcome,{' '}
              {profile?.full_name ||
                'Participant'}
            </h1>

            <p>
              Manage your virtual interview from
              one place.
            </p>
          </div>
        </div>


        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}


        <div className="dashboard-grid">

          <article className="dashboard-card dashboard-card-main">

            <div className="dashboard-card-top">

              <div>
                <span className="dashboard-label">
                  INTERVIEW
                </span>

                <h2>
                  {interviewStatus ===
                  'completed'
                    ? 'Interview completed'
                    : interviewStatus ===
                        'in_progress'
                      ? 'Continue your interview'
                      : 'Ready to begin?'}
                </h2>
              </div>

              <span
                className={`dashboard-status dashboard-status-${interviewStatus}`}
              >
                {getStatusLabel()}
              </span>

            </div>


            {loadingInterview ? (

              <div className="dashboard-loading">
                Checking interview status...
              </div>

            ) : (

              <>

                {interviewStatus ===
                  'completed' && (

                  <>
                    <p>
                      Your interview has been
                      successfully submitted. Your
                      responses are securely stored
                      for authorized review.
                    </p>

                    <div className="dashboard-complete-box">

                      <span className="complete-check">
                        ✓
                      </span>

                      <div>
                        <strong>
                          Interview submitted
                        </strong>

                        <span>
                          Completed on{' '}
                          {interview?.completed_at
                            ? new Date(
                                interview.completed_at
                              ).toLocaleString()
                            : '—'}
                        </span>
                      </div>

                    </div>


                    <div className="dashboard-result-note">

                      <strong>
                        Next step
                      </strong>

                      <p>
                        Your interview is now available
                        for authorized review. You do not
                        need to submit anything else.
                      </p>

                    </div>

                  </>
                )}


                {interviewStatus ===
                  'in_progress' && (

                  <>
                    <p>
                      You have an interview in
                      progress. Continue from the
                      current question.
                    </p>

                    <div className="dashboard-card-details">

                      <div>
                        <span>
                          Questions answered
                        </span>

                        <strong>
                          {Math.max(
                            currentQuestionNumber - 1,
                            0
                          )}
                          /20
                        </strong>
                      </div>


                      <div>
                        <span>
                          Current question
                        </span>

                        <strong>
                          {currentQuestionNumber}
                          /20
                        </strong>
                      </div>


                      <div>
                        <span>
                          Status
                        </span>

                        <strong>
                          In Progress
                        </strong>
                      </div>

                    </div>


                    <Link
                      to="/interview"
                      className="button button-primary"
                    >
                      Continue Interview
                    </Link>

                  </>
                )}


                {interviewStatus ===
                  'not_started' && (

                  <>
                    <p>
                      Your interview contains 20
                      questions. Each question gives
                      you preparation time before the
                      response is recorded.
                    </p>

                    <div className="dashboard-card-details">

                      <div>
                        <span>
                          Questions
                        </span>

                        <strong>
                          20
                        </strong>
                      </div>

                      <div>
                        <span>
                          Preparation
                        </span>

                        <strong>
                          30 sec
                        </strong>
                      </div>

                      <div>
                        <span>
                          Answer time
                        </span>

                        <strong>
                          2 min
                        </strong>
                      </div>

                    </div>


                    <Link
                      to="/interview/instructions"
                      className="button button-primary"
                    >
                      Start Interview
                    </Link>

                  </>
                )}


                {interviewStatus ===
                  'failed' && (

                  <>
                    <p>
                      There was a problem with your
                      previous interview session.
                      Please contact the administrator
                      before starting another attempt.
                    </p>
                  </>

                )}

              </>

            )}

          </article>


          <article className="dashboard-card">

            <span className="dashboard-label">
              ACCOUNT
            </span>

            <h2>
              Your profile
            </h2>

            <p>
              Review your account information and
              participant details.
            </p>

            <Link
              to="/profile"
              className="button button-secondary"
            >
              View Profile
            </Link>

          </article>

        </div>


        <div className="dashboard-account">
          Signed in as{' '}
          <strong>
            {user?.email}
          </strong>
        </div>

      </div>
    </section>
  )
}

export default Dashboard
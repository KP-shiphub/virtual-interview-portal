import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getAdminStatistics,
  getParticipants,
  getInterviews,
} from '../services/adminService'

function AdminDashboard() {
  const [statistics, setStatistics] =
    useState(null)

  const [participants, setParticipants] =
    useState([])

  const [interviews, setInterviews] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true)
        setError('')

        const [
          stats,
          participantData,
          interviewData,
        ] = await Promise.all([
          getAdminStatistics(),
          getParticipants(),
          getInterviews(),
        ])

        setStatistics(stats)
        setParticipants(
          participantData
        )
        setInterviews(
          interviewData
        )
      } catch (loadError) {
        console.error(
          'Admin dashboard error:',
          loadError
        )

        setError(
          loadError?.message ||
            'Unable to load administrator data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [])

  function getParticipantInterview(
    participantId
  ) {
    return interviews.find(
      (interview) =>
        interview.participant_id ===
        participantId
    )
  }

  function getInterviewStatus(
    participantId
  ) {
    const interview =
      getParticipantInterview(
        participantId
      )

    if (!interview) {
      return 'Not Started'
    }

    if (
      interview.status ===
      'completed'
    ) {
      return 'Completed'
    }

    if (
      interview.status ===
      'in_progress'
    ) {
      return 'In Progress'
    }

    return 'Failed'
  }

  if (loading) {
    return (
      <section className="admin-page">
        <div className="container admin-container">
          <div className="admin-loading">
            Loading administrator dashboard...
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <div className="container admin-container">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>Interview Dashboard</h1>

            <p>
              Review participants and submitted
              interview sessions.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}

        {statistics && (
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <span>
                PARTICIPANTS
              </span>

              <strong>
                {statistics.totalParticipants}
              </strong>
            </div>

            <div className="admin-stat-card">
              <span>
                INTERVIEWS
              </span>

              <strong>
                {statistics.totalInterviews}
              </strong>
            </div>

            <div className="admin-stat-card">
              <span>
                COMPLETED
              </span>

              <strong>
                {statistics.completedInterviews}
              </strong>
            </div>

            <div className="admin-stat-card">
              <span>
                IN PROGRESS
              </span>

              <strong>
                {statistics.pendingInterviews}
              </strong>
            </div>
          </div>
        )}

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <span className="admin-section-label">
                PARTICIPANTS
              </span>

              <h2>
                Registered participants
              </h2>
            </div>

            <span className="admin-count">
              {participants.length}
            </span>
          </div>

          {participants.length === 0 ? (
<div className="admin-empty">
  <strong>
    No participants yet
  </strong>

  <p>
    Registered participants will appear here
    once they create an account.
  </p>
</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map(
                    (participant) => {
                      const interview =
                        getParticipantInterview(
                          participant.id
                        )

                      return (
                        <tr
                          key={
                            participant.id
                          }
                        >
                          <td>
                            <strong>
                              {participant.full_name ||
                                'Unnamed participant'}
                            </strong>
                          </td>

                          <td>
                            {participant.email}
                          </td>

                          <td>
                            <span
                              className={`admin-status admin-status-${interview?.status || 'not_started'}`}
                            >
                              {getInterviewStatus(
                                participant.id
                              )}
                            </span>
                          </td>

                          <td>
                            {participant.created_at
                              ? new Date(
                                  participant.created_at
                                ).toLocaleDateString()
                              : '—'}
                          </td>

                          <td>
                            <Link
                              to={`/admin/interview/${participant.id}`}
                              className="admin-view-button"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
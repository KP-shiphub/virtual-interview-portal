import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  createRecordingUrl,
  getInterviewAnswers,
  getParticipant,
  getParticipantInterview,
} from '../services/adminService'

function AdminInterview() {
  const { participantId } =
    useParams()

  const navigate = useNavigate()

  const [participant, setParticipant] =
    useState(null)

  const [interview, setInterview] =
    useState(null)

  const [answers, setAnswers] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

 const [videoUrl, setVideoUrl] =
  useState('')

const [videoObjectUrl, setVideoObjectUrl] =
  useState('')

  const [
    selectedQuestion,
    setSelectedQuestion,
  ] = useState(null)

  const [
    videoLoading,
    setVideoLoading,
  ] = useState(false)


  useEffect(() => {
  return () => {
    if (videoObjectUrl) {
      URL.revokeObjectURL(
        videoObjectUrl
      )
    }
  }
}, [videoObjectUrl])
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const participantData =
          await getParticipant(
            participantId
          )

        setParticipant(
          participantData
        )

        const interviewData =
          await getParticipantInterview(
            participantId
          )

        setInterview(
          interviewData
        )

        if (interviewData) {
          const answerData =
            await getInterviewAnswers(
              interviewData.id
            )

          setAnswers(answerData)
        }
      } catch (loadError) {
        console.error(
          'Admin interview error:',
          loadError
        )

        setError(
          loadError?.message ||
            'Unable to load interview details.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [participantId])

async function handleWatchRecording(
  answer
) {
  try {
    setVideoLoading(true)
    setError('')

    setVideoUrl('')

    if (videoObjectUrl) {
      URL.revokeObjectURL(
        videoObjectUrl
      )

      setVideoObjectUrl('')
    }

    setSelectedQuestion(null)

    if (!answer?.video_path) {
      throw new Error(
        'No recording was saved for this question.'
      )
    }

    console.log(
      'Opening recording:',
      answer.video_path
    )

    const signedUrl =
      await createRecordingUrl(
        answer.video_path
      )

    console.log(
      'Signed URL created successfully.'
    )

    const response =
      await fetch(signedUrl)

    if (!response.ok) {
      throw new Error(
        `Unable to download recording. Server returned ${response.status}.`
      )
    }

    const blob =
      await response.blob()

    if (!blob.size) {
      throw new Error(
        'The recording file is empty.'
      )
    }

    console.log(
      'Recording downloaded:',
      blob.type,
      blob.size,
      'bytes'
    )

    const objectUrl =
      URL.createObjectURL(blob)

    setVideoUrl(signedUrl)
    setVideoObjectUrl(objectUrl)
    setSelectedQuestion(answer)
  } catch (videoError) {
    console.error(
      'Video access error:',
      videoError
    )

    setVideoUrl('')
    setVideoObjectUrl('')

    setError(
      videoError?.message ||
        'Unable to open the recording.'
    )
  } finally {
    setVideoLoading(false)
  }
}

  function closeVideo() {
    setVideoUrl('')
    setSelectedQuestion(null)
  }

  if (loading) {
    return (
      <section className="admin-page">
        <div className="container admin-container">
          <div className="admin-loading">
            Loading interview details...
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <div className="container admin-container">
        <div className="admin-back-row">
          <button
            type="button"
            className="admin-back-button"
            onClick={() =>
              navigate('/admin')
            }
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}

        <div className="admin-heading">
          <div>
            <p className="eyebrow">
              INTERVIEW REVIEW
            </p>

            <h1>
              {participant?.full_name ||
                'Participant'}
            </h1>

            <p>
              {participant?.email}
            </p>
          </div>

          {interview && (
            <span
              className={`admin-status admin-status-${interview.status}`}
            >
              {interview.status ===
              'completed'
                ? 'Completed'
                : interview.status ===
                    'in_progress'
                  ? 'In Progress'
                  : interview.status}
            </span>
          )}
        </div>

        <div className="admin-detail-grid">
          <div className="admin-detail-card">
            <span className="admin-section-label">
              PARTICIPANT
            </span>

            <h2>Participant information</h2>

            <div className="admin-detail-list">
              <div>
                <span>Name</span>
                <strong>
                  {participant?.full_name ||
                    '—'}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {participant?.email ||
                    '—'}
                </strong>
              </div>

              <div>
                <span>Registered</span>
                <strong>
                  {participant?.created_at
                    ? new Date(
                        participant.created_at
                      ).toLocaleString()
                    : '—'}
                </strong>
              </div>
            </div>
          </div>

          <div className="admin-detail-card">
            <span className="admin-section-label">
              INTERVIEW
            </span>

            <h2>Interview information</h2>

            <div className="admin-detail-list">
              <div>
                <span>Status</span>
                <strong>
                  {interview?.status ||
                    'Not Started'}
                </strong>
              </div>

              <div>
                <span>Started</span>
              <strong>
  {interview?.started_at
    ? new Date(
        interview.started_at
      ).toLocaleString()
    : 'Not started'}
</strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>
  {interview?.completed_at
    ? new Date(
        interview.completed_at
      ).toLocaleString()
    : 'Not completed'}
</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <span className="admin-section-label">
                RESPONSES
              </span>

              <h2>
                Interview questions
              </h2>
            </div>

            <span className="admin-count">
              {answers.length}/20
            </span>
          </div>

          {answers.length === 0 ? (
            <div className="admin-empty">
              No recorded answers are available.
            </div>
          ) : (
            <div className="admin-answers">
              {answers.map((answer) => (
                <div
                  className="admin-answer-row"
                  key={answer.id}
                >
                  <div className="admin-answer-number">
                    {String(
                      answer.questions
                        ?.question_number ||
                        0
                    ).padStart(
                      2,
                      '0'
                    )}
                  </div>

                  <div className="admin-answer-content">
                    <span>
                      Question{' '}
                      {answer.questions
                        ?.question_number}
                    </span>

                    <h3>
                      {answer.questions
                        ?.question_text ||
                        'Question unavailable'}
                    </h3>
                  </div>

                  <div className="admin-answer-action">
                    {answer.video_path ? (
                      <button
                        type="button"
                        className="admin-watch-button"
                        onClick={() =>
                          handleWatchRecording(
                            answer
                          )
                        }
                        disabled={
                          videoLoading
                        }
                      >
                        {videoLoading
                          ? 'Opening...'
                          : 'Watch Recording'}
                      </button>
                    ) : (
                      <span className="admin-no-video">
                        No recording
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {videoUrl && (
          <div className="admin-video-section">
            <div className="admin-video-header">
              <div>
                <span className="admin-section-label">
                  RECORDING
                </span>

                <h2>
  Question{' '}
  {
    selectedQuestion
      ?.questions
      ?.question_number
  }
</h2>

<p className="admin-video-question">
  {
    selectedQuestion
      ?.questions
      ?.question_text
  }
</p>
              </div>

              <button
                type="button"
                className="admin-close-button"
                onClick={
                  closeVideo
                }
              >
                Close
              </button>
            </div>

           <div className="admin-video-player">
  <video
    key={videoObjectUrl}
    src={videoObjectUrl}
    controls
    playsInline
    preload="metadata"
    onLoadedMetadata={() => {
      console.log(
        'Video metadata loaded successfully.'
      )
    }}
    onError={(event) => {
      console.error(
        'Browser video playback error:',
        event.currentTarget.error
      )

      setError(
        'The recording was downloaded, but the browser could not decode or play the video.'
      )
    }}
  />
</div>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminInterview
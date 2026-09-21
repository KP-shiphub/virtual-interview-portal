import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function InterviewInstructions() {
  const navigate = useNavigate()

  const [agreed, setAgreed] = useState(false)

  function handleContinue() {
    if (!agreed) {
      return
    }

    navigate('/interview/device-check')
  }

  return (
    <section className="interview-page">
      <div className="container interview-container">
        <div className="interview-page-heading">
          <p className="eyebrow">
            BEFORE YOU BEGIN
          </p>

          <h1>Interview instructions</h1>

          <p>
            Please read the following instructions carefully
            before starting your virtual interview.
          </p>
        </div>

        <div className="instructions-card">
          <div className="instruction-overview">
            <div className="instruction-stat">
              <span>Questions</span>
              <strong>20</strong>
            </div>

            <div className="instruction-stat">
              <span>Preparation</span>
              <strong>30 sec</strong>
            </div>

            <div className="instruction-stat">
              <span>Answer time</span>
              <strong>2 min</strong>
            </div>
          </div>

          <div className="instructions-list">
            <div className="instruction-item">
              <span className="instruction-number">
                01
              </span>

              <div>
                <h3>Camera must remain enabled</h3>

                <p>
                  Keep your face visible and remain in
                  front of the camera throughout the
                  interview.
                </p>
              </div>
            </div>

            <div className="instruction-item">
              <span className="instruction-number">
                02
              </span>

              <div>
                <h3>Microphone must remain enabled</h3>

                <p>
                  Make sure your microphone is working
                  and speak clearly during your answers.
                </p>
              </div>
            </div>

            <div className="instruction-item">
              <span className="instruction-number">
                03
              </span>

              <div>
                <h3>Prepare before each question</h3>

                <p>
                  You will receive preparation time before
                  recording begins.
                </p>
              </div>
            </div>

            <div className="instruction-item">
              <span className="instruction-number">
                04
              </span>

              <div>
                <h3>Answers will be recorded</h3>

                <p>
                  Your camera and microphone will be
                  recorded while you answer each question.
                </p>
              </div>
            </div>

            <div className="instruction-item">
              <span className="instruction-number">
                05
              </span>

              <div>
                <h3>Complete the interview in one session</h3>

                <p>
                  Do not refresh the browser, close the
                  interview tab, or navigate away while
                  completing the interview.
                </p>
              </div>
            </div>

            <div className="instruction-item">
              <span className="instruction-number">
                06
              </span>

              <div>
                <h3>Use a stable internet connection</h3>

                <p>
                  A reliable connection is recommended so
                  your recordings can be uploaded successfully.
                </p>
              </div>
            </div>
          </div>

          <div className="instructions-warning">
            <strong>Before starting</strong>

            <p>
              Make sure you are in a quiet location, your
              device is sufficiently charged, and your
              camera and microphone are available.
            </p>
          </div>

          <label className="agreement-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) =>
                setAgreed(event.target.checked)
              }
            />

            <span>
              I have read and understood the interview
              instructions.
            </span>
          </label>

          <div className="instructions-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Back
            </button>

            <button
              type="button"
              className="button button-primary"
              disabled={!agreed}
              onClick={handleContinue}
            >
              Continue to Device Check
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InterviewInstructions
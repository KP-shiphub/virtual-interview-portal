import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

import {
  completeInterview,
  getInterviewQuestions,
  getOrCreateInterview,
  saveInterviewAnswer,
  updateInterviewProgress,
  uploadInterviewRecording,
} from '../services/interviewService'


function getSupportedRecorderOptions() {
  if (typeof MediaRecorder === 'undefined') {
    return null
  }

  const supportedTypes = [
    {
      mimeType: 'video/webm;codecs=vp9,opus',
      extension: 'webm',
    },
    {
      mimeType: 'video/webm;codecs=vp8,opus',
      extension: 'webm',
    },
    {
      mimeType: 'video/webm',
      extension: 'webm',
    },
    {
      mimeType: 'video/mp4',
      extension: 'mp4',
    },
  ]

  for (const type of supportedTypes) {
    if (MediaRecorder.isTypeSupported(type.mimeType)) {
      return type
    }
  }

  return null
}


function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds)

  const minutes = Math.floor(safeSeconds / 60)

  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`
}


function Interview() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const lastRecordingRef = useRef(null)

  const timerRef = useRef(null)

  const recordingStartTimeRef = useRef(null)

  const questionsRef = useRef([])
  const interviewRef = useRef(null)

  const currentQuestionIndexRef = useRef(0)

  const phaseRef = useRef('loading')


  const [questions, setQuestions] = useState([])

  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(0)

  const [phase, setPhase] = useState('loading')

  const [
    preparationRemaining,
    setPreparationRemaining,
  ] = useState(30)

  const [
    answerRemaining,
    setAnswerRemaining,
  ] = useState(120)

  const [currentQuestion, setCurrentQuestion] =
    useState(null)

  const [interview, setInterview] = useState(null)

  const [loadingMessage, setLoadingMessage] = useState(
    'Preparing your interview...'
  )

  const [error, setError] = useState('')

  const [uploadError, setUploadError] = useState('')

  const [isUploading, setIsUploading] = useState(false)

  const [deviceReady, setDeviceReady] = useState(false)

  const [recordingMimeType, setRecordingMimeType] =
    useState('')


  const updatePhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }, [])


  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])


  const cleanupMediaStream = useCallback(() => {
    if (!streamRef.current) {
      return
    }

    streamRef.current
      .getTracks()
      .forEach((track) => {
        track.stop()
      })

    streamRef.current = null
  }, [])


  const attachStreamToVideo = useCallback(() => {
    if (
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current
    }
  }, [])


  useEffect(() => {
    if (
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current

      videoRef.current
        .play()
        .catch((playError) => {
          console.warn(
            'Video autoplay was prevented:',
            playError
          )
        })
    }
  }, [phase, deviceReady])


  async function requestCameraAndMicrophone() {
    if (!navigator.mediaDevices) {
      throw new Error(
        'Your browser does not support camera and microphone access.'
      )
    }

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

    streamRef.current = stream

    attachStreamToVideo()

    setDeviceReady(true)

    return stream
  }


  const saveRecording = useCallback(
    async (
      blob,
      question,
      recordingStartedAt,
      recorderContentType
    ) => {
      lastRecordingRef.current = {
        blob,
        question,
        recordingStartedAt,
        recorderContentType,
      }

      if (!user) {
        throw new Error(
          'You are no longer signed in.'
        )
      }

      if (!interviewRef.current) {
        throw new Error(
          'Interview information is missing.'
        )
      }

      const interviewId =
        interviewRef.current.id

      setIsUploading(true)
      setUploadError('')

      updatePhase('uploading')

      try {
        setLoadingMessage(
          `Uploading answer ${
            question.question_number
          } of 20...`
        )

const interviewQuestionNumber =
  currentQuestionIndexRef.current + 1

const uploadResult =
  await uploadInterviewRecording({
    participantId: user.id,
    interviewId,
    questionNumber:
      interviewQuestionNumber,
    blob,
    contentType:
      recorderContentType,
  })

        const completedAt =
          new Date().toISOString()

        await saveInterviewAnswer({
          interviewId,
          questionId: question.id,
          participantId: user.id,
          videoPath: uploadResult.path,
          startedAt: recordingStartedAt,
          completedAt,
        })


        const isLastQuestion =
          currentQuestionIndexRef.current ===
          questionsRef.current.length - 1


        if (isLastQuestion) {
          setLoadingMessage(
            'Finalizing your interview...'
          )

          await completeInterview(
            interviewId
          )

          cleanupTimer()
          cleanupMediaStream()

          navigate(
            '/interview/completed',
            {
              replace: true,
              state: {
                completedAt,
                questionCount:
                  questionsRef.current.length,
              },
            }
          )

          return
        }


        const nextQuestionIndex =
          currentQuestionIndexRef.current + 1

        currentQuestionIndexRef.current =
          nextQuestionIndex

        setCurrentQuestionIndex(
          nextQuestionIndex
        )


        const nextQuestion =
          questionsRef.current[
            nextQuestionIndex
          ]

        setCurrentQuestion(
          nextQuestion
        )


await updateInterviewProgress(
  interviewId,
  nextQuestionIndex + 1
)

        setPreparationRemaining(
          nextQuestion.preparation_time
        )

        setAnswerRemaining(
          nextQuestion.answer_time
        )

        setLoadingMessage('')

        updatePhase('preparing')
      } catch (saveError) {
        console.error(
          'Recording save error:',
          saveError
        )

        setUploadError(
          saveError?.message ||
            'The recording could not be saved. Please retry.'
        )

        updatePhase('upload-error')
      } finally {
        setIsUploading(false)
      }
    },
    [
      cleanupMediaStream,
      cleanupTimer,
      navigate,
      updatePhase,
      user,
    ]
  )


  const stopRecording = useCallback(() => {
    cleanupTimer()

    const recorder = recorderRef.current

    if (
      !recorder ||
      recorder.state === 'inactive'
    ) {
      return
    }

    recorder.stop()
  }, [cleanupTimer])


  const startRecording = useCallback(
    (question) => {
      if (!streamRef.current) {
        setError(
          'Camera and microphone are no longer available.'
        )

        updatePhase('error')

        return
      }


      const recorderOptions =
        getSupportedRecorderOptions()


      if (!recorderOptions) {
        setError(
          'This browser cannot record webcam video in a supported format.'
        )

        updatePhase('error')

        return
      }


      try {
        chunksRef.current = []

        const recorder =
          new MediaRecorder(
            streamRef.current,
            {
              mimeType:
                recorderOptions.mimeType,
            }
          )

        recorderRef.current = recorder

        setRecordingMimeType(
          recorderOptions.mimeType
        )


        const recordingStartedAt =
          new Date().toISOString()

        recordingStartTimeRef.current =
          recordingStartedAt


        recorder.ondataavailable =
          (event) => {
            if (
              event.data &&
              event.data.size > 0
            ) {
              chunksRef.current.push(
                event.data
              )
            }
          }


        recorder.onerror = (event) => {
          console.error(
            'MediaRecorder error:',
            event.error
          )

          setError(
            'A recording error occurred. Please try again.'
          )

          updatePhase('error')
        }


        recorder.onstop = async () => {
          const blob = new Blob(
            chunksRef.current,
            {
              type: recorderOptions.mimeType,
            }
          )

          chunksRef.current = []
          recorderRef.current = null


          if (blob.size === 0) {
            setError(
              'The recording was empty. Please try again.'
            )

            updatePhase('error')

            return
          }


          await saveRecording(
            blob,
            question,
            recordingStartedAt,
            recorderOptions.mimeType
          )
        }


        recorder.start(1000)

        setAnswerRemaining(
          question.answer_time
        )

        setError('')

        updatePhase('recording')
      } catch (recordingError) {
        console.error(
          'Unable to start recording:',
          recordingError
        )

        setError(
          recordingError?.message ||
            'Unable to start recording.'
        )

        updatePhase('error')
      }
    },
    [saveRecording, updatePhase]
  )


  /*
   * ============================================================
   * INITIALIZE INTERVIEW
   *
   * interviewService.js is responsible for selecting the
   * questions.
   *
   * The service should return exactly 20 questions from the
   * 50-question question bank.
   *
   * Interview.jsx does NOT randomly select another 20.
   * ============================================================
   */

  const initializeInterview =
    useCallback(async () => {
      if (!user) {
        return
      }


      try {
        updatePhase('loading')

        setLoadingMessage(
          'Loading your interview questions...'
        )


        /*
         * getInterviewQuestions()
         *
         * The updated interviewService.js should:
         *
         * 1. Read the 50 questions.
         * 2. Select 20 questions.
         * 3. Return those 20 questions here.
         */
        setLoadingMessage(
  'Preparing your interview session...'
)

const loadedInterview =
  await getOrCreateInterview(
    user.id
  )

interviewRef.current =
  loadedInterview

setInterview(
  loadedInterview
)

setLoadingMessage(
  'Loading your interview questions...'
)

const loadedQuestions =
  await getInterviewQuestions(
    loadedInterview.id
  )

if (loadedQuestions.length !== 20) {
  throw new Error(
    `The interview requires exactly 20 questions. Found ${loadedQuestions.length}.`
  )
}

questionsRef.current =
  loadedQuestions

setQuestions(
  loadedQuestions
)


        interviewRef.current =
          loadedInterview

        setInterview(
          loadedInterview
        )


        /*
         * Resume from the saved question number if
         * the interview was already started.
         */
        const savedQuestionNumber =
          Number(
            loadedInterview.current_question_number
          ) || 1


        const safeQuestionIndex =
          Math.min(
            Math.max(
              savedQuestionNumber - 1,
              0
            ),
            loadedQuestions.length - 1
          )


        currentQuestionIndexRef.current =
          safeQuestionIndex

        setCurrentQuestionIndex(
          safeQuestionIndex
        )


        const question =
          loadedQuestions[
            safeQuestionIndex
          ]


        setCurrentQuestion(question)


        if (
          savedQuestionNumber > 1
        ) {
          setLoadingMessage(
            `Resuming your interview from Question ${savedQuestionNumber}...`
          )
        }


        setPreparationRemaining(
          question.preparation_time
        )

        setAnswerRemaining(
          question.answer_time
        )


        setLoadingMessage(
          'Requesting camera and microphone access...'
        )


        await requestCameraAndMicrophone()


        setLoadingMessage('')

        updatePhase('preparing')
      } catch (initializationError) {
        console.error(
          'Interview initialization error:',
          initializationError
        )


        if (
          initializationError?.code ===
          'INTERVIEW_ALREADY_COMPLETED'
        ) {
          navigate(
            '/dashboard',
            {
              replace: true,
            }
          )

          return
        }


        setError(
          initializationError?.message ||
            'Unable to start the interview.'
        )

        updatePhase('error')
      }
    }, [
      navigate,
      updatePhase,
      user,
    ])


  useEffect(() => {
    initializeInterview()

    return () => {
      cleanupTimer()

      if (
        recorderRef.current &&
        recorderRef.current.state !==
          'inactive'
      ) {
        recorderRef.current.stop()
      }

      cleanupMediaStream()
    }
  }, [
    cleanupMediaStream,
    cleanupTimer,
    initializeInterview,
  ])


  useEffect(() => {
    const stream =
      streamRef.current

    if (!stream) {
      return
    }


    const videoTrack =
      stream.getVideoTracks()[0]

    const audioTrack =
      stream.getAudioTracks()[0]


    function handleVideoEnded() {
      setError(
        'Your camera connection was lost. Please reconnect the camera and try again.'
      )

      updatePhase('error')
    }


    function handleAudioEnded() {
      setError(
        'Your microphone connection was lost. Please reconnect the microphone and try again.'
      )

      updatePhase('error')
    }


    videoTrack?.addEventListener(
      'ended',
      handleVideoEnded
    )

    audioTrack?.addEventListener(
      'ended',
      handleAudioEnded
    )


    return () => {
      videoTrack?.removeEventListener(
        'ended',
        handleVideoEnded
      )

      audioTrack?.removeEventListener(
        'ended',
        handleAudioEnded
      )
    }
  }, [
    deviceReady,
    updatePhase,
  ])


  useEffect(() => {
    if (
      phase !== 'preparing' ||
      !currentQuestion
    ) {
      return
    }


    cleanupTimer()


    setPreparationRemaining(
      currentQuestion.preparation_time
    )


    let remaining =
      currentQuestion.preparation_time


    timerRef.current =
      setInterval(() => {
        remaining -= 1

        setPreparationRemaining(
          Math.max(remaining, 0)
        )


        if (remaining <= 0) {
          cleanupTimer()

          startRecording(
            currentQuestion
          )
        }
      }, 1000)


    return cleanupTimer
  }, [
    cleanupTimer,
    currentQuestion,
    phase,
    startRecording,
  ])


  useEffect(() => {
    if (
      phase !== 'recording' ||
      !currentQuestion
    ) {
      return
    }


    cleanupTimer()


    let remaining =
      currentQuestion.answer_time


    setAnswerRemaining(
      remaining
    )


    timerRef.current =
      setInterval(() => {
        remaining -= 1

        setAnswerRemaining(
          Math.max(remaining, 0)
        )


        if (remaining <= 0) {
          cleanupTimer()

          stopRecording()
        }
      }, 1000)


    return cleanupTimer
  }, [
    cleanupTimer,
    currentQuestion,
    phase,
    stopRecording,
  ])


  useEffect(() => {
    function preventAccidentalLeave(
      event
    ) {
      const unsafePhases = [
        'preparing',
        'recording',
        'uploading',
        'upload-error',
      ]


      if (
        unsafePhases.includes(phase)
      ) {
        event.preventDefault()
        event.returnValue = ''
      }
    }


    window.addEventListener(
      'beforeunload',
      preventAccidentalLeave
    )


    return () => {
      window.removeEventListener(
        'beforeunload',
        preventAccidentalLeave
      )
    }
  }, [phase])


  async function handleRetryUpload() {
    const previousRecording =
      lastRecordingRef.current


    if (!previousRecording) {
      window.location.reload()

      return
    }


    await saveRecording(
      previousRecording.blob,
      previousRecording.question,
      previousRecording.recordingStartedAt,
      previousRecording.recorderContentType
    )
  }


  function handleFinishAnswer() {
    if (phase === 'recording') {
      stopRecording()
    }
  }


  const progress =
    currentQuestion
      ? (
          ((currentQuestionIndex + 1) /
            questions.length) *
          100
        )
      : 0


  if (phase === 'loading') {
    return (
      <section className="interview-page">
        <div className="container interview-container">
          <div className="interview-loading-card">
            <div className="loading-indicator">
              ...
            </div>

            <h1>
              Preparing your interview
            </h1>

            <p>
              {loadingMessage}
            </p>
          </div>
        </div>
      </section>
    )
  }


  if (phase === 'error') {
    return (
      <section className="interview-page">
        <div className="container interview-container">
          <div className="interview-error-card">
            <p className="eyebrow">
              INTERVIEW ERROR
            </p>

            <h1>
              We couldn't start the interview
            </h1>

            <p>
              {error}
            </p>

            <div className="interview-error-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  navigate('/dashboard')
                }
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }


  if (!currentQuestion) {
    return null
  }


  return (
    <section className="interview-workspace">
      <div className="interview-topbar">
        <div className="container interview-topbar-inner">
          <div className="interview-brand">
            <span className="brand-mark">
              VI
            </span>

            <strong>
              Virtual Interview
            </strong>
          </div>

          <div className="interview-progress-text">
            Question{' '}
            {currentQuestionIndex + 1}{' '}
            of {questions.length}
          </div>
        </div>


        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>


      <div className="container interview-main">
        <div className="interview-video-card">
          <div className="interview-video-header">
            <div>
              <span className="interview-label">
                {phase === 'preparing'
                  ? 'PREPARATION'
                  : phase === 'recording'
                    ? 'RECORDING'
                    : phase === 'uploading'
                      ? 'SAVING RESPONSE'
                      : 'INTERVIEW'}
              </span>

              <h2>
                Question{' '}
                {currentQuestion.question_number}
              </h2>
            </div>


            {phase === 'recording' && (
              <span className="recording-indicator">
                <span />
                Recording
              </span>
            )}
          </div>


          <div className="interview-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />


            {!deviceReady && (
              <div className="video-overlay">
                Camera unavailable
              </div>
            )}


            {phase === 'preparing' && (
              <div className="question-overlay preparation-overlay">
                <div className="timer-label">
                  PREPARATION TIME
                </div>

                <div className="large-timer">
                  {formatTime(
                    preparationRemaining
                  )}
                </div>

                <p>
                  Read the question and prepare
                  your answer.
                </p>
              </div>
            )}


            {phase === 'recording' && (
              <div className="question-overlay recording-overlay">
                <div className="timer-label">
                  ANSWER TIME REMAINING
                </div>

                <div className="large-timer">
                  {formatTime(
                    answerRemaining
                  )}
                </div>
              </div>
            )}


            {phase === 'uploading' && (
              <div className="question-overlay">
                <div className="loading-indicator">
                  ...
                </div>

                <strong>
                  Saving your answer
                </strong>

                <p>
                  Please wait while your recording
                  is uploaded.
                </p>
              </div>
            )}


            {phase === 'upload-error' && (
              <div className="question-overlay">
                <strong>
                  Upload failed
                </strong>

                <p>
                  Your recording could not be
                  saved.
                </p>
              </div>
            )}
          </div>


          <div className="question-content">
            <span>
              Question{' '}
              {currentQuestion.question_number}
            </span>

            <h1>
              {currentQuestion.question_text}
            </h1>
          </div>
        </div>


        <aside className="interview-sidebar">
          <div className="sidebar-card">
            <span className="sidebar-label">
              CURRENT STATUS
            </span>

            <div className="sidebar-status">
              {phase === 'preparing' && (
                <>
                  <span className="status-dot status-preparing" />
                  Preparing
                </>
              )}

              {phase === 'recording' && (
                <>
                  <span className="status-dot status-recording" />
                  Recording
                </>
              )}

              {phase === 'uploading' && (
                <>
                  <span className="status-dot status-uploading" />
                  Uploading
                </>
              )}
            </div>

            <p>
              {phase === 'preparing'
                ? 'Use this time to organize your answer.'
                : phase === 'recording'
                  ? 'Speak clearly and maintain your focus.'
                  : phase === 'uploading'
                    ? 'Do not close this page.'
                    : 'Interview in progress.'}
            </p>
          </div>


          <div className="sidebar-card">
            <span className="sidebar-label">
              INTERVIEW PROGRESS
            </span>

            <div className="sidebar-progress-number">
              {currentQuestionIndex + 1}

              <span>
                / {questions.length}
              </span>
            </div>

            <div className="sidebar-mini-progress">
              <div
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>


          {phase === 'recording' && (
            <button
              type="button"
              className="button button-secondary finish-answer-button"
              onClick={
                handleFinishAnswer
              }
            >
              Finish Answer Early
            </button>
          )}


          {phase === 'upload-error' && (
            <div className="sidebar-card upload-error-card">
              <span className="sidebar-label">
                UPLOAD ERROR
              </span>

              <p>
                {uploadError}
              </p>

              <button
                type="button"
                className="button button-primary"
                onClick={
                  handleRetryUpload
                }
                disabled={isUploading}
              >
                Retry
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}


export default Interview
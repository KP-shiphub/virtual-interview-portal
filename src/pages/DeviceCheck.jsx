import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DeviceStatus from '../components/DeviceStatus'

function DeviceCheck() {
  const navigate = useNavigate()

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraStatus, setCameraStatus] =
    useState('checking')

  const [microphoneStatus, setMicrophoneStatus] =
    useState('checking')

  const [error, setError] = useState('')

  const [checking, setChecking] = useState(false)

  async function startDeviceCheck() {
    setError('')
    setChecking(true)

    setCameraStatus('checking')
    setMicrophoneStatus('checking')

    try {
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

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const videoTracks =
        stream.getVideoTracks()

      const audioTracks =
        stream.getAudioTracks()

      if (videoTracks.length > 0) {
        setCameraStatus('ready')
      } else {
        setCameraStatus('unavailable')
      }

      if (audioTracks.length > 0) {
        setMicrophoneStatus('ready')
      } else {
        setMicrophoneStatus('unavailable')
      }
    } catch (deviceError) {
      console.error(
        'Device access error:',
        deviceError
      )

      const errorName = deviceError?.name

      if (
        errorName === 'NotAllowedError' ||
        errorName === 'PermissionDeniedError'
      ) {
        setCameraStatus('denied')
        setMicrophoneStatus('denied')

        setError(
          'Camera or microphone permission was denied. Please allow access in your browser settings and try again.'
        )
      } else if (
        errorName === 'NotFoundError'
      ) {
        setCameraStatus('unavailable')
        setMicrophoneStatus('unavailable')

        setError(
          'No camera or microphone was detected. Please connect the required devices and try again.'
        )
      } else if (
        errorName === 'NotReadableError'
      ) {
        setCameraStatus('unavailable')
        setMicrophoneStatus('unavailable')

        setError(
          'Your camera or microphone may already be in use by another application.'
        )
      } else {
        setCameraStatus('unavailable')
        setMicrophoneStatus('unavailable')

        setError(
          deviceError?.message ||
            'Unable to access your camera and microphone.'
        )
      }
    } finally {
      setChecking(false)
    }
  }

  function cleanupStream() {
    if (!streamRef.current) {
      return
    }

    streamRef.current
      .getTracks()
      .forEach((track) => {
        track.stop()
      })

    streamRef.current = null
  }

  useEffect(() => {
    return () => {
      cleanupStream()
    }
  }, [])

  function handleContinue() {
    if (
      cameraStatus !== 'ready' ||
      microphoneStatus !== 'ready'
    ) {
      return
    }

    cleanupStream()

    navigate('/interview')
  }

  const devicesReady =
    cameraStatus === 'ready' &&
    microphoneStatus === 'ready'

  return (
    <section className="interview-page">
      <div className="container interview-container">
        <div className="interview-page-heading">
          <p className="eyebrow">
            DEVICE CHECK
          </p>

          <h1>Check your camera and microphone</h1>

          <p>
            We need access to your camera and microphone
            before the interview begins.
          </p>
        </div>

        <div className="device-check-grid">
          <div className="device-preview-card">
            <div className="device-preview-header">
              <div>
                <strong>Camera preview</strong>

                <span>
                  Your camera will be used during the
                  interview.
                </span>
              </div>
            </div>

            <div className="video-preview">
              {cameraStatus === 'ready' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="video-placeholder">
                  <div className="video-placeholder-icon">
                    CAM
                  </div>

                  <p>
                    Camera preview will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="device-control-card">
            <div className="device-control-heading">
              <p className="eyebrow">
                DEVICE STATUS
              </p>

              <h2>Check your equipment</h2>

              <p>
                Allow browser access when requested.
              </p>
            </div>

            <div className="device-status-list">
              <DeviceStatus
                type="camera"
                status={cameraStatus}
                message={
                  cameraStatus === 'ready'
                    ? 'Camera is working correctly.'
                    : undefined
                }
              />

              <DeviceStatus
                type="microphone"
                status={microphoneStatus}
                message={
                  microphoneStatus === 'ready'
                    ? 'Microphone is available.'
                    : undefined
                }
              />
            </div>

            {error && (
              <div className="form-message error">
                {error}
              </div>
            )}

            <button
              type="button"
              className="button button-primary device-check-button"
              onClick={startDeviceCheck}
              disabled={checking}
            >
              {checking
                ? 'Checking devices...'
                : devicesReady
                  ? 'Check Again'
                  : 'Enable Camera & Microphone'}
            </button>

            <button
              type="button"
              className="button button-secondary device-check-button"
              disabled={!devicesReady}
              onClick={handleContinue}
            >
              Continue to Interview
            </button>

            <button
              type="button"
              className="device-back-button"
              onClick={() =>
                navigate('/interview/instructions')
              }
            >
              Back to Instructions
            </button>
          </div>
        </div>

        <div className="device-note">
          <strong>Privacy note</strong>

          <p>
            Your browser controls camera and microphone
            permissions. The interview recording will only
            begin when the actual interview starts.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DeviceCheck
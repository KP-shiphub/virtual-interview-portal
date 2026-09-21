function DeviceStatus({
  type,
  status,
  message,
}) {
  const label =
    type === 'camera'
      ? 'Camera'
      : 'Microphone'

  const statusText = {
    checking: 'Checking...',
    ready: 'Ready',
    unavailable: 'Unavailable',
    denied: 'Permission denied',
  }

  return (
    <div className="device-status">
      <div className="device-status-left">
        <div className="device-status-icon">
          {type === 'camera' ? 'CAM' : 'MIC'}
        </div>

        <div>
          <strong>{label}</strong>

          <p>
            {message ||
              statusText[status] ||
              'Unknown status'}
          </p>
        </div>
      </div>

      <span
        className={`device-status-badge ${status}`}
      >
        {statusText[status] || 'Unknown'}
      </span>
    </div>
  )
}

export default DeviceStatus
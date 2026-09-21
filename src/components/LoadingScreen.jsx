function LoadingScreen({
  message = 'Loading...',
}) {
  return (
    <div className="global-loading">
      <div className="global-loading-card">
        <div className="loading-spinner" />

        <strong>{message}</strong>

        <span>
          Please wait a moment.
        </span>
      </div>
    </div>
  )
}

export default LoadingScreen
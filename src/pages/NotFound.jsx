import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="simple-page not-found-page">
      <div className="container not-found-container">
        <span className="not-found-code">
          404
        </span>

        <h1>
          This page doesn't exist
        </h1>

        <p>
          The page you are looking for may have
          moved or may no longer be available.
        </p>

        <Link
          to="/"
          className="button button-primary"
        >
          Return Home
        </Link>
      </div>
    </section>
  )
}

export default NotFound
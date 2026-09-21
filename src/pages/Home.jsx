import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <p className="eyebrow">VIRTUAL INTERVIEW PORTAL</p>

            <h1>Your interview. Your opportunity.</h1>

            <p className="hero-description">
              Prepare for your academic or professional journey with a
              structured virtual interview experience designed to help you
              present yourself confidently.
            </p>

            <div className="hero-actions">
              <Link to="/signup" className="button button-primary">
                Start Interview
              </Link>

              <Link to="/login" className="button button-secondary">
                Sign In
              </Link>
            </div>

            <div className="hero-meta">
              <span>20 structured questions</span>
              <span>Secure interview recording</span>
              <span>Browser-based experience</span>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span className="status-dot"></span>
              Interview Ready
            </div>

            <div className="interview-preview">
              <div className="camera-placeholder">
                <div className="camera-icon">●</div>
                <p>Camera preview</p>
                <span>Your interview space</span>
              </div>

              <div className="preview-question">
                <span>Sample question</span>
                <strong>Tell us about yourself.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">WHY USE THE PLATFORM</p>
            <h2>Built for a focused interview experience</h2>
            <p>
              Everything is organized in one place so participants can focus
              on giving their best responses.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-number">01</span>
              <h3>Structured</h3>
              <p>
                A consistent question-by-question interview process keeps the
                experience organized.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-number">02</span>
              <h3>Recorded</h3>
              <p>
                Interview answers can be securely recorded and stored for
                authorized review.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-number">03</span>
              <h3>Accessible</h3>
              <p>
                The interview runs directly in a modern browser without
                requiring special software.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-number">04</span>
              <h3>Professional</h3>
              <p>
                A clear, distraction-free interface makes the process feel
                like a real interview environment.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container process-section">
          <div className="section-heading">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>From preparation to submission</h2>
          </div>

          <div className="process-grid">
            <div className="process-step">
              <span>01</span>
              <h3>Create your account</h3>
              <p>Register and complete your basic participant profile.</p>
            </div>

            <div className="process-step">
              <span>02</span>
              <h3>Check your devices</h3>
              <p>
                Test your camera and microphone before beginning the interview.
              </p>
            </div>

            <div className="process-step">
              <span>03</span>
              <h3>Answer the questions</h3>
              <p>
                Prepare and respond to each interview question within the
                allocated time.
              </p>
            </div>

            <div className="process-step">
              <span>04</span>
              <h3>Submit your interview</h3>
              <p>
                Your completed responses are securely submitted for review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-box">
          <div>
            <p className="eyebrow">READY WHEN YOU ARE</p>
            <h2>Give every answer your best.</h2>
            <p>
              Create your account and prepare for your virtual interview.
            </p>
          </div>

          <Link to="/signup" className="button button-light">
            Create Account
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <strong>Virtual Interview</strong>
            <p>A structured interview platform for students and applicants.</p>
          </div>

          <p>© 2026 Virtual Interview Portal</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
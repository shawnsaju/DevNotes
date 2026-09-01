import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function RegisterPage({ addToast }) {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      // Show inline error
      setError(err.message);
      // If duplicate (409), also show a friendly toast suggesting to sign in
      if (err.status === 409) {
        const msg = err.message.toLowerCase().includes('email')
          ? 'An account with this email already exists. Try signing in.'
          : err.message;
        if (addToast) addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];
  const strengthClass = ['', 'weak', 'good', 'strong'][strength];

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img className="auth-logo-img" src={logo} alt="DevNotes Logo" />
          <span className="auth-logo-text">DevNotes</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start your personal notes workspace</p>

        {error && (
          <div className="auth-error" role="alert">
            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              className="auth-input"
              type="text"
              placeholder=""
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="auth-input"
              type="email"
              placeholder=""
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="reg-password"
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(p => !p)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <div className="pw-strength">
                <div className={`pw-strength-bar ${strengthClass}`} />
                <span className={`pw-strength-label ${strengthClass}`}>{strengthLabel}</span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              className={`auth-input ${confirm && confirm !== password ? 'input-error' : ''}`}
              type={showPw ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

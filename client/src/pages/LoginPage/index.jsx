// ============================================
// LoginPage - Landing-Page Style Auth
// ============================================
// Top hero banner with value prop + features,
// form card below. Inspired by Pramp/Interviewing.io.
// Reference: useState, useContext, useNavigate - reference-react.md
// Reference: React Icons - reference-react.md
// ============================================

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { register, emailLogin } from '../../services/authService.js';
import {
  BsCameraVideo,
  BsMicFill,
  BsFileEarmarkTextFill,
  BsCodeSlash,
  BsBarChartFill,
  BsShieldCheck,
  BsPeopleFill,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

function LoginPage() {
  // Form state - Reference: useState hook - reference-react.md
  // Separate visible modes for user sign-in, public registration, and admin sign-in.
  // Admin accounts are provisioned by the server; they cannot be self-created here.
  const [authMode, setAuthMode] = useState('user-login');
  const isSignUp = authMode === 'signup';
  const isAdminSignIn = authMode === 'admin-login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle form submission - Reference: async/await - reference-javascript.md
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await register(name, email, password);
        toast.success('Account created successfully!');
      } else {
        result = await emailLogin(email, password);
        const accountRole = result.user?.role || 'user';
        if (isAdminSignIn && accountRole !== 'admin') {
          const roleError = new Error('This account does not have administrator access. Use User Sign In or contact your platform administrator.');
          roleError.isRoleMismatch = true;
          throw roleError;
        }
        if (!isAdminSignIn && accountRole === 'admin') {
          toast.success('Administrator account verified. Opening Admin Dashboard…');
        } else {
          toast.success(isAdminSignIn ? 'Administrator access verified.' : 'Welcome back!');
        }
      }

      login(result.token, result.user);
      navigate(result.user?.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ---- Top Nav Bar ---- */}
      <nav className="login-nav">
        <div className="login-nav-brand">
          <BsCameraVideo className="login-nav-icon" />
          <span className="login-nav-name">AI Mock Interview</span>
        </div>
      </nav>

      {/* ---- Hero Banner (Dark) ---- */}
      <div className="login-hero">
        <h1 className="login-hero-heading">
          Ace Your Next <span className="login-hero-accent">Technical Interview</span>
        </h1>
        <p className="login-hero-tagline">
          Practice with an AI interviewer that speaks, listens, and gives you
          real-time feedback on your performance.
        </p>

        {/* Feature pills */}
        <div className="login-hero-features">
          <div className="login-hero-pill">
            <BsMicFill className="login-pill-icon" />
            <span className="login-pill-text">Voice Interviews</span>
          </div>
          <div className="login-hero-pill">
            <BsFileEarmarkTextFill className="login-pill-icon" />
            <span className="login-pill-text">Resume Analysis</span>
          </div>
          <div className="login-hero-pill">
            <BsCodeSlash className="login-pill-icon" />
            <span className="login-pill-text">Live Coding</span>
          </div>
          <div className="login-hero-pill">
            <BsBarChartFill className="login-pill-icon" />
            <span className="login-pill-text">AI Scoring</span>
          </div>
        </div>
      </div>

      {/* ---- Form Card (overlaps hero bottom) ---- */}
      <div className="login-form-wrapper">
        <div className="login-card">
          {/* Tab Switcher */}
          <div className="login-tabs" role="tablist" aria-label="Choose account access">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'user-login'}
              className={`login-tab ${authMode === 'user-login' ? 'login-tab-active' : ''}`}
              onClick={() => setAuthMode('user-login')}
            >
              User Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignUp}
              className={`login-tab ${isSignUp ? 'login-tab-active' : ''}`}
              onClick={() => setAuthMode('signup')}
            >
              Create Account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isAdminSignIn}
              className={`login-tab login-tab-admin ${isAdminSignIn ? 'login-tab-active' : ''}`}
              onClick={() => setAuthMode('admin-login')}
            >
              <BsShieldCheck className="login-admin-tab-icon" /> Admin Sign In
            </button>
          </div>

          {isAdminSignIn && (
            <div className="login-mode-message login-admin-message" role="status">
              <BsShieldCheck aria-hidden="true" />
              <div>
                <strong>Administrator access</strong>
                <span>Sign in with the admin account created by your server administrator. Admin accounts cannot be created from public registration.</span>
              </div>
            </div>
          )}

          {isSignUp && (
            <div className="login-mode-message" role="status">
              <BsPeopleFill aria-hidden="true" />
              <div>
                <strong>Create a user account</strong>
                <span>Public registration creates a regular user account. Administrator access is provisioned separately by the server.</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="login-field">
                <label htmlFor="name" className="login-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="login-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">Password</label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={`login-submit ${loading ? 'login-submit-disabled' : ''}`}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : isSignUp
                ? 'Create User Account'
                : isAdminSignIn
                ? 'Sign In as Admin'
                : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Trust Indicators Below Card */}
        <div className="login-trust">
          <div className="login-trust-item">
            <BsShieldCheck className="login-trust-icon" />
            <span className="login-trust-text">Secure & Private</span>
          </div>
          <div className="login-trust-item">
            <BsPeopleFill className="login-trust-icon" />
            <span className="login-trust-text">Join 10,000+ users</span>
          </div>
          <div className="login-trust-item">
            <BsBarChartFill className="login-trust-icon" />
            <span className="login-trust-text">5 Score Categories</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

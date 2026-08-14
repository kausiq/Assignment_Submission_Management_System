import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/axios';
import Alert from '../../components/Alert';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@school.test', password: 'Admin@123' },
  { role: 'Teacher', email: 'teacher@school.test', password: 'Teacher@123' },
  { role: 'Student', email: 'student@school.test', password: 'Student@123' }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const redirectTo = location.state?.from?.pathname || `/${user.role}`;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink-800">Ledger</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate">
            Assignment &amp; Submission Register
          </p>
        </div>

        <div className="card p-7">
          <Alert variant="error">{error}</Alert>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.test"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="card mt-4 p-5">
          <p className="label mb-2">Demo credentials</p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-ink-50"
                type="button"
              >
                <span className="font-medium text-ink-700">{acc.role}</span>
                <span className="font-mono text-slate">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

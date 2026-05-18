import { useState } from 'react';
import { useAuth } from '../AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const { user, loading, login, signup, logout } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'login') {
      const result = await login(email, password);
      if (!result.success) setError(result.error);
    } else {
      if (!name) {
        setError('Name is required for signup');
        return;
      }
      const result = await signup(name, email, password);
      if (!result.success) setError(result.error);
    }
  };

  if (loading) return <div className="auth-page"><p>Loading session…</p></div>;

  return (
    <div className="auth-page">
      <h2>{user ? 'Your Account' : mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      {user ? (
        <div className="auth-summary">
          <p>Welcome, <strong>{user.name}</strong>!</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button onClick={() => logout()}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <label>
              Name
              <input value={name} onChange={e => setName(e.target.value)} />
            </label>
          )}
          <label>
            Email
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
          <button type="button" className="auth-mode-toggle" onClick={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login'); }}>
            {mode === 'login' ? 'Create an account' : 'Already have an account? Login'}
          </button>
        </form>
      )}
    </div>
  );
}

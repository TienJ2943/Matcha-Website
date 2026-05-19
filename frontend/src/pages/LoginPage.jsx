import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const user = await login(formData);
      navigate(user.role === 'admin' ? '/admin/carts' : '/products');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel narrow">
      <h1>Login</h1>
      <p>Login to save your shopping cart and place orders.</p>
      {error && <p className="error-message">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          required
        />
        <button className="button" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p>New customer? <Link to="/register">Create an account</Link></p>
    </section>
  );
}

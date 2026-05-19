import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/products');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel narrow">
      <h1>Create Account</h1>
      <p>Register as a user to create a database-backed shopping cart.</p>
      {error && <p className="error-message">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <input
          placeholder="Full name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password, minimum 6 characters"
          value={formData.password}
          onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          required
        />
        <button className="button" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
      </form>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </section>
  );
}

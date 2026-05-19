import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { cart, total } = useCart();

  if (!user) {
    return (
      <section className="panel narrow">
        <h1>User Profile</h1>
        <p>Please login to view your profile.</p>
        <Link className="button" to="/login">Login</Link>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>User Profile</h1>
      <div className="profile-grid">
        <div>
          <h2>Account</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
        <div>
          <h2>Current Cart</h2>
          <p><strong>Items:</strong> {cart.reduce((count, item) => count + item.quantity, 0)}</p>
          <p><strong>Total:</strong> ${total.toFixed(2)}</p>
          <Link className="button" to="/cart">Open Cart</Link>
        </div>
      </div>
    </section>
  );
}

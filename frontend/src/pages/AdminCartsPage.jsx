import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../AuthContext';

export default function AdminCartsPage() {
  const { user } = useAuth();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCarts() {
      if (!user || user.role !== 'admin') {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/api/admin/shopping-carts');
        setCarts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCarts();
  }, [user]);

  if (!user) {
    return (
      <section className="panel narrow">
        <h1>Admin Carts</h1>
        <p>Please login as admin to view all users' shopping carts.</p>
        <Link className="button" to="/login">Login</Link>
      </section>
    );
  }

  if (user.role !== 'admin') {
    return (
      <section className="panel narrow">
        <h1>Admin Carts</h1>
        <p>You need an admin account to access this page.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>All Users' Shopping Carts</h1>
          <p>Admin-only view of every cart stored in the shopping_cart collection.</p>
        </div>
      </div>

      {loading && <p>Loading carts...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!loading && carts.length === 0 && <p>No carts found.</p>}

      <div className="admin-cart-list">
        {carts.map((cart) => (
          <article className="panel" key={cart._id}>
            <h2>{cart.user?.name || 'Unknown User'}</h2>
            <p><strong>Email:</strong> {cart.user?.email}</p>
            <p><strong>Total:</strong> ${Number(cart.total || 0).toFixed(2)}</p>
            {cart.items.length === 0 ? (
              <p>Cart is empty.</p>
            ) : (
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item._id}>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.product?.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

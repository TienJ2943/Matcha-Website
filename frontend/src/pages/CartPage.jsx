import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, total, loading, updateQuantity, removeFromCart, clearCart, checkout } = useCart();
  const navigate = useNavigate();

  async function handleCheckout() {
    try {
      await checkout();
      alert('Order placed successfully!');
      navigate('/profile');
    } catch (err) {
      alert(err.message);
    }
  }

  if (!user) {
    return (
      <section className="panel narrow">
        <h1>Your Cart</h1>
        <p>Please login to create and manage your shopping cart.</p>
        <Link className="button" to="/login">Login</Link>
      </section>
    );
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Your Cart</h1>
          <p>Your cart is saved to the database under your user account.</p>
        </div>
        {cart.length > 0 && <button className="button secondary" onClick={clearCart}>Clear Cart</button>}
      </div>

      {loading && <p>Loading cart...</p>}

      {!loading && cart.length === 0 ? (
        <div className="panel">
          <p>Your cart is empty.</p>
          <Link className="button" to="/products">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-list">
          {cart.map((item) => (
            <article className="cart-item" key={item.product._id}>
              <div>
                <h3>{item.product.name}</h3>
                <p>{item.product.price}</p>
              </div>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
              </div>
            </article>
          ))}

          <div className="cart-summary">
            <h2>Total: ${total.toFixed(2)}</h2>
            <button className="button" onClick={handleCheckout}>Place Order</button>
          </div>
        </div>
      )}
    </section>
  );
}

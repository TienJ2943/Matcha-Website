import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import './App.css';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">Neo got your Mac-cha</Link>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/cart">Cart ({cartCount})</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin/carts">Admin Carts</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin/products">Admin Products</NavLink>}
        {user ? (
          <>
            <NavLink to="/profile">{user.name}</NavLink>
            <button className="link-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

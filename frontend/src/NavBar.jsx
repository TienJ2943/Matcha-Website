import { Link } from "react-router-dom";
import { useAuth } from './AuthContext';
import './App.css';

export default function NavBar() {
    const { user } = useAuth();
    return (
        <div className="site-header">
            <h1 className="site-title">Neo got your Mac-cha</h1>
            <nav className="navbar">
                <ul>
                    <li><Link to='/'>Home</Link></li>
                    <li><Link to='/about'>About</Link></li>
                    <li><Link to='/products'>Products</Link></li>
                    <li><Link to='/cart'>Cart</Link></li>
                    <li><Link to='/auth'>{user ? user.name : 'Login'}</Link></li>
                    <li><Link to='/admin'>Admin</Link></li>
                </ul>
        </nav>
        </div>
    );
}
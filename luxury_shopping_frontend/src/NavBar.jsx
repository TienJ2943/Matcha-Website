import { Link } from "react-router-dom";
import './App.css';

export default function NavBar() {
    return (
        <nav className="navbar">
            
            <ul>
                <li><Link to='/'>Home</Link></li>
                <li><Link to='/about'>About</Link></li>
                <li><Link to='/products'>Products</Link></li>
                <li><Link to='/cart'>Cart</Link></li>
            </ul>
           
        </nav>
    );
}
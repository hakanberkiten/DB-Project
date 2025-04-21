import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/">Products</Link>
            <Link to="/cart">Cart</Link>
            {!user && <Link to="/signup">Sign Up</Link>}
            {!user && <Link to="/login">Login</Link>}
            {user && <Link to="/profile">Profile</Link>}
            {user && (
                <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
                    Logout
                </button>
            )}
            {user && <span style={{ float: 'right', marginLeft: '15px' }}>Hello, {user.username}</span>}
        </nav>
    );
};

export default Navbar;

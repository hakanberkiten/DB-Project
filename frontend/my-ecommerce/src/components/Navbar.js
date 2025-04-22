// src/components/Navbar.js
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
            <div className="navbar-left">
                <Link to="/products">Products</Link>
                <Link to="/cart">Cart</Link>
            </div>

            <div className="navbar-center">
                {/* boş bırakılabilir veya logo eklenebilir */}
            </div>

            <div className="navbar-right">
                {!user && <Link to="/signup">Sign Up</Link>}
                {!user && <Link to="/login">Login</Link>}
                {user && <Link to="/profile">Profile</Link>}
                {user && (
                    <>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        <span className="greeting">Hello, {user.username}</span>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

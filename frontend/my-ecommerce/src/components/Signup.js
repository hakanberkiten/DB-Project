import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'Customer'  // default role
    });

    const [message, setMessage] = useState('');

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/signup', formData);
            setMessage(res.data.message);
        } catch (err) {
            const errMsg = err.response?.data?.error || 'An error occurred during registration';
            setMessage(errMsg);
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="signup-form">
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="tel" name="phone" placeholder="Phone" onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

                <select name="role" onChange={handleChange}>
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                </select>

                <button type="submit">Sign Up</button>
            </form>
            {message && <p className="signup-message">{message}</p>}
        </div>
    );
};

export default Signup;

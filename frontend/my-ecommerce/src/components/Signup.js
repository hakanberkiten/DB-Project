import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: ''
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
        <div style={{ padding: '2rem' }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required /><br />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required /><br />
                <input type="tel" name="phone" placeholder="Phone" onChange={handleChange} /><br />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required /><br />
                <button type="submit">Sign Up</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Signup;

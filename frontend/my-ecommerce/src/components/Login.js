import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', formData);
            const user = res.data;

            localStorage.setItem('user', JSON.stringify(user));
            setMessage("Login successful, redirecting...");

            // Mağazaya yönlendir
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            const errMsg = err.response?.data?.error || 'Login error';
            setMessage(errMsg);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required /><br />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required /><br />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;

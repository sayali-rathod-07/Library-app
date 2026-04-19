import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Library, Lock, Mail } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { login, user, changePassword } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@libflow.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(email, password)) {
            navigate('/');
        } else {
            setError('Invalid credentials. Try admin@libflow.com / admin123');
        }
    };

    const handleReset = (e) => {
        e.preventDefault();
        if (email === 'admin@libflow.com') {
            changePassword(newPassword);
            setIsResetMode(false);
            setError('Password changed successfully! Please login.');
        } else {
            setError('Invalid email for reset.');
        }
    };

    if (isResetMode) {
        return (
            <div className="login-page">
                <div className="login-card glass-card">
                    <div className="login-header">
                        <Library className="logo-icon" />
                        <h1>Reset Password</h1>
                        <p>Enter your email and new password</p>
                    </div>
                    <form onSubmit={handleReset}>
                        {error && <div className="error-msg">{error}</div>}
                        <div className="form-group">
                            <label><Mail size={16} /> Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Lock size={16} /> New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary login-btn">Update Password</button>
                        <button type="button" className="back-btn" onClick={() => setIsResetMode(false)}>Back to Login</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card glass-card">
                <div className="login-header">
                    <Library className="logo-icon" />
                    <h1>LibFlow</h1>
                    <p>Sign in to manage your library</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-msg">{error}</div>}
                    <div className="form-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="forgot-link">
                        <button type="button" onClick={() => setIsResetMode(true)}>Forgot Password?</button>
                    </div>
                    <button type="submit" className="btn-primary login-btn">Sign In</button>
                </form>

                <div className="login-footer">
                    <p>Demo Credentials:</p>
                    <code>admin@libflow.com / admin123</code>
                </div>
            </div>
        </div>
    );
};

export default Login;

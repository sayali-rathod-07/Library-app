import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login, signup } = useAuth();
    const { showNotification } = useNotification();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLogin) {
            const result = login(email, password);
            if (result.success) {
                showNotification('Welcome back to LibFlow!', 'success');
            } else {
                showNotification(result.message, 'error');
            }
        } else {
            const result = signup(name, email, password);
            if (result.success) {
                showNotification('Account created! You can now log in.', 'success');
                setIsLogin(true);
            } else {
                showNotification(result.message, 'error');
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-container glass-card">
                <div className="login-header">
                    <div className="logo-icon">
                        <LogIn size={32} />
                    </div>
                    <h1>{isLogin ? 'Welcome Back' : 'Join LibFlow'}</h1>
                    <p>{isLogin ? 'Manage your library with ease' : 'Create your librarian account'}</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label><User size={16} /> Full Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            required
                            type="email"
                            placeholder="librarian@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Password</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            className="toggle-btn"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

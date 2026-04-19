import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // We store the logged-in user's details here. If null, the user is redirected to login.
    const [user, setUser] = useState(null);

    // For this demo, we use a simple mock password that can be changed by the admin.
    const [adminPassword, setAdminPassword] = useState('admin123');

    // The login function checks the credentials and sets up the admin's profile
    const login = (email, password) => {
        if (email === 'admin@libflow.com' && password === adminPassword) {
            setUser({
                email,
                name: 'Admin User',
                phone: '+91 98765 43210',
                role: 'Senior Librarian'
            });
            return true;
        }
        return false;
    };

    const logout = () => setUser(null);

    const updateUser = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
    };

    const changePassword = (newPassword) => {
        setAdminPassword(newPassword);
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

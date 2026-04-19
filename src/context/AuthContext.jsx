import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('lib_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('lib_all_users');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('lib_all_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('lib_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('lib_current_user');
        }
    }, [user]);

    const signup = (name, email, password) => {
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'User already exists with this email.' };
        }

        const newUser = {
            id: `u${Date.now()}`,
            name,
            email,
            password, // In a real app, this would be hashed
            role: 'Librarian',
            phone: ''
        };

        setUsers(prev => [...prev, newUser]);
        return { success: true };
    };

    const login = (email, password) => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return { success: true };
        }
        return { success: false, message: 'Invalid email or password.' };
    };

    const logout = () => {
        setUser(null);
    };

    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

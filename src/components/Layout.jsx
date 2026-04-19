import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Clock, LogOut, Library, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const { logout, user, updateUser } = useAuth();
    const { searchQuery, setSearchQuery, resetData } = useLibrary();
    const [showProfile, setShowProfile] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editData, setEditData] = React.useState({ name: '', phone: '', email: '' });

    React.useEffect(() => {
        if (user) {
            setEditData({ name: user.name, phone: user.phone, email: user.email });
        }
    }, [user]);

    const handleSave = () => {
        updateUser(editData);
        setIsEditing(false);
    };

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/books', icon: <BookOpen size={20} />, label: 'Books' },
        { path: '/issues', icon: <Clock size={20} />, label: 'Issued Books' },
        { path: '/students', icon: <Users size={20} />, label: 'Students' },
    ];

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Library className="logo-icon" />
                    <h1>LibFlow</h1>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={logout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <header className="top-bar">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search books, students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="user-profile-container">
                        <div className="user-profile" onClick={() => setShowProfile(!showProfile)}>
                            <div className="avatar">{user?.name?.substring(0, 2).toUpperCase()}</div>
                            <span>{user?.name}</span>
                        </div>
                        {showProfile && (
                            <div className="profile-dropdown glass-card">
                                <div className="dropdown-header">
                                    <div className="large-avatar">{user?.name?.substring(0, 2).toUpperCase()}</div>
                                    <div className="user-info">
                                        {isEditing ? (
                                            <input
                                                className="edit-input name-input"
                                                value={editData.name}
                                                onChange={e => setEditData({ ...editData, name: e.target.value })}
                                            />
                                        ) : (
                                            <h4>{user?.name}</h4>
                                        )}
                                        <p>{user?.role}</p>
                                    </div>
                                </div>
                                <div className="dropdown-body">
                                    <div className="info-row">
                                        <span className="label">Email</span>
                                        {isEditing ? (
                                            <input
                                                className="edit-input"
                                                type="email"
                                                value={editData.email}
                                                onChange={e => setEditData({ ...editData, email: e.target.value })}
                                            />
                                        ) : (
                                            <span className="value">{user?.email}</span>
                                        )}
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phone</span>
                                        {isEditing ? (
                                            <input
                                                className="edit-input"
                                                value={editData.phone}
                                                onChange={e => setEditData({ ...editData, phone: e.target.value })}
                                            />
                                        ) : (
                                            <span className="value">{user?.phone}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="dropdown-actions">
                                    {isEditing ? (
                                        <button className="save-btn" onClick={handleSave}>Save Changes</button>
                                    ) : (
                                        <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                    )}
                                    <button className="reset-btn" onClick={resetData} title="Clear all local data and reset to default">
                                        <RefreshCw size={16} /> Reset System
                                    </button>
                                    <button className="dropdown-logout" onClick={logout}>
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

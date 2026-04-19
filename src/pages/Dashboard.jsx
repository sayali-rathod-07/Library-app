import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { Book, Users, Clock, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { books, issues, getDueSoon, students } = useLibrary();
    const { user } = useAuth();

    // Calculate a friendly greeting based on the current time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const totalBooks = books.reduce((acc, b) => acc + b.total, 0);
    const issuedBooks = issues.filter(i => i.status === 'issued').length;
    const overdueBooks = issues.filter(i => i.status === 'issued' && new Date(i.returnDate) < new Date()).length;

    const dueSoon = getDueSoon();

    const stats = [
        { label: 'Total Books', value: totalBooks, icon: <Book />, color: 'blue' },
        { label: 'Issued Books', value: issuedBooks, icon: <Clock />, color: 'purple' },
        { label: 'Overdue', value: overdueBooks, icon: <AlertCircle />, color: 'red' },
        { label: 'Total Students', value: students.length, icon: <Users />, color: 'green' },
    ];

    return (
        <div className="dashboard">
            <header className="page-header">
                <h1>{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
                <p>Here's a quick look at what's happening in your library today.</p>
            </header>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <section className="due-soon-section glass-card">
                    <div className="section-header">
                        <h2>Upcoming Returns</h2>
                    </div>
                    <div className="due-list">
                        {dueSoon.length > 0 ? (
                            dueSoon.map((issue) => {
                                const student = students.find(s => s.id === issue.studentId);
                                const book = books.find(b => b.id === issue.bookId);
                                const isOverdue = new Date(issue.returnDate) < new Date();

                                return (
                                    <div key={issue.id} className={`due-item ${isOverdue ? 'overdue' : ''}`}>
                                        <div className="book-thumb">
                                            <img
                                                src={book?.thumbnail}
                                                alt={book?.title}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/128x192?text=No+Cover';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        </div>
                                        <div className="due-info">
                                            <h4>{book?.title}</h4>
                                            <p>{student?.name} ({student?.rollNo})</p>
                                        </div>
                                        <div className="due-date">
                                            <span className="label">Due Date</span>
                                            <span className="date">{issue.returnDate}</span>
                                        </div>
                                        <div className={`status-badge ${isOverdue ? 'overdue' : 'pending'}`}>
                                            {isOverdue ? 'Overdue' : 'Pending'}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="empty-state">No books currently issued.</p>
                        )}
                    </div>
                </section>

                <section className="recent-activity glass-card">
                    <div className="section-header">
                        <h2>Inventory Status</h2>
                    </div>
                    <div className="inventory-list">
                        {books.map(book => (
                            <div key={book.id} className="inventory-item">
                                <div className="inventory-info">
                                    <h4>{book.title}</h4>
                                    <p>{book.author}</p>
                                </div>
                                <div className="inventory-stats">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${(book.available / book.total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span>{book.available} / {book.total} available</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;

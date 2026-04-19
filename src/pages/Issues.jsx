import { useLibrary } from '../context/LibraryContext';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, AlertCircle, Clock, MessageCircle } from 'lucide-react';
import './Issues.css';

const Issues = () => {
    const { issues, books, students, returnBook, searchQuery } = useLibrary();
    const { showNotification } = useNotification();

    const sendWhatsApp = (student, book, issue) => {
        // Clean phone number: remove all non-numeric characters
        let cleanPhone = student.phone.replace(/\D/g, '');

        // If it's a 10-digit number, assume India (+91)
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }

        const today = new Date();
        const dueDate = new Date(issue.returnDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dayMessage = '';
        if (diffDays > 0) {
            dayMessage = `You have ${diffDays} day(s) remaining to return the book.`;
        } else if (diffDays === 0) {
            dayMessage = `Today is the last day to return the book!`;
        } else {
            dayMessage = `The book is already ${Math.abs(diffDays)} day(s) overdue!`;
        }

        const message = `*Library Reminder* 📚\n\nHello ${student.name},\n\nThis is a friendly reminder to return the book "*${book.title}*" on or before the due date: *${issue.returnDate}*.\n\n${dayMessage}\n\n⚠️ *Alarm:* Please ensure the book is returned on time. A penalty of *₹10 per day* will be applicable for late returns.\n\nThank you!`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const filteredIssues = issues.filter(issue => {
        const book = books.find(b => b.id === issue.bookId);
        const student = students.find(s => s.id === issue.studentId);
        const query = searchQuery.toLowerCase();
        return (
            book?.title.toLowerCase().includes(query) ||
            student?.name.toLowerCase().includes(query) ||
            student?.rollNo.toLowerCase().includes(query)
        );
    });

    // Sort issues: Active ones first, then by due date (most urgent at the top)
    const sortedIssues = [...filteredIssues].sort((a, b) => {
        if (a.status === 'returned' && b.status === 'issued') return 1;
        if (a.status === 'issued' && b.status === 'returned') return -1;
        return new Date(a.returnDate) - new Date(b.returnDate);
    });

    return (
        <div className="issues-page">
            <header className="page-header">
                <h1>Issued Books Tracking</h1>
                <p>Keep track of who has what. We've sorted these by urgency for you.</p>
            </header>

            <div className="issues-table-container glass-card">
                {sortedIssues.length === 0 ? (
                    <div className="empty-state-container">
                        <Clock size={48} />
                        <h3>No books issued yet</h3>
                        <p>When you issue a book to a student, it will appear here for tracking.</p>
                    </div>
                ) : (
                    <table className="issues-table">
                        <thead>
                            <tr>
                                <th>Book Details</th>
                                <th>Student Info</th>
                                <th>Issue Date</th>
                                <th>Return Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedIssues.map((issue) => {
                                const book = books.find(b => b.id === issue.bookId);
                                const student = students.find(s => s.id === issue.studentId);
                                const isOverdue = issue.status === 'issued' && new Date(issue.returnDate) < new Date();

                                return (
                                    <tr key={issue.id} className={isOverdue ? 'row-overdue' : ''}>
                                        <td>
                                            <div className="book-cell">
                                                <img
                                                    src={book?.thumbnail}
                                                    alt=""
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/128x192?text=No+Cover';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                <div>
                                                    <div className="book-title">{book?.title}</div>
                                                    <div className="book-isbn">{book?.isbn}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="student-cell">
                                                <div className="student-name-row">
                                                    <div className="student-name">{student?.name}</div>
                                                    {issue.status === 'issued' && (
                                                        <button
                                                            className="wa-btn"
                                                            onClick={() => sendWhatsApp(student, book, issue)}
                                                            title="Send WhatsApp Reminder"
                                                        >
                                                            <MessageCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="student-meta">Roll: {student?.rollNo} | Div: {student?.division}</div>
                                                <div className="student-phone">{student?.phone}</div>
                                                <div className="student-email-small">{student?.email}</div>
                                            </div>
                                        </td>
                                        <td>{issue.issueDate}</td>
                                        <td>
                                            <div className={`date-cell ${isOverdue ? 'text-error' : ''}`}>
                                                {issue.returnDate}
                                                {isOverdue && <AlertCircle size={14} />}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${issue.status}`}>
                                                {issue.status === 'issued' ? (isOverdue ? 'Overdue' : 'Active') : 'Returned'}
                                            </span>
                                        </td>
                                        <td>
                                            {issue.status === 'issued' && (
                                                <button
                                                    className="return-btn"
                                                    onClick={() => {
                                                        returnBook(issue.id);
                                                        showNotification(`Book "${book?.title}" returned successfully!`, 'success');
                                                    }}
                                                >
                                                    <CheckCircle size={16} /> Mark Returned
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Issues;

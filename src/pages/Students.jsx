import { useLibrary } from '../context/LibraryContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Hash, Layers, Phone, MessageCircle, Edit2, Check, X, Trash2 } from 'lucide-react';
import './Students.css';

const StudentCard = ({ student, issues, books, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...student });
    const { showNotification } = useNotification();

    const studentIssues = issues.filter(i => i.studentId === student.id);
    const activeIssues = studentIssues.filter(i => i.status === 'issued');

    const handleSave = () => {
        onUpdate(student.id, editData);
        setIsEditing(false);
        showNotification(`Details for ${editData.name} updated successfully!`, 'success');
    };

    const sendWhatsApp = (student) => {
        let cleanPhone = student.phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const studentIssues = issues.filter(i => i.studentId === student.id && i.status === 'issued');

        let bookDetails = '';
        if (studentIssues.length > 0) {
            bookDetails = '\n\n*Your Current Books:*';
            studentIssues.forEach(issue => {
                const book = books.find(b => b.id === issue.bookId);
                const today = new Date();
                const dueDate = new Date(issue.returnDate);
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                const dayStatus = diffDays > 0 ? `${diffDays} days left` : (diffDays === 0 ? 'Due Today!' : `${Math.abs(diffDays)} days overdue`);
                bookDetails += `\n- *${book?.title}* (Due: ${issue.returnDate} | ${dayStatus})`;
            });
        }

        const message = `*Library Greeting* 👋\n\nHello ${student.name},\n\nThis is from the LibFlow Library. We just wanted to check in with you.${bookDetails}\n\n⚠️ *Alarm:* Please return books on time. A penalty of *₹10/day* applies for late returns.\n\nThank you!`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className={`student-card glass-card ${isEditing ? 'editing' : ''}`}>
            <div className="student-header">
                <div className="student-avatar">
                    {editData.name.charAt(0)}
                </div>
                <div className="student-title">
                    {isEditing ? (
                        <input
                            className="edit-input name-input"
                            value={editData.name}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                        />
                    ) : (
                        <h3>{student.name}</h3>
                    )}
                    {isEditing ? (
                        <input
                            className="edit-input email-input"
                            value={editData.email}
                            onChange={e => setEditData({ ...editData, email: e.target.value })}
                        />
                    ) : (
                        <p className="student-email-text">{student.email}</p>
                    )}
                </div>
                <div className="card-actions">
                    {isEditing ? (
                        <>
                            <button className="action-btn save" onClick={handleSave}><Check size={18} /></button>
                            <button className="action-btn cancel" onClick={() => { setIsEditing(false); setEditData({ ...student }); }}><X size={18} /></button>
                        </>
                    ) : (
                        <>
                            <button className="action-btn edit" onClick={() => setIsEditing(true)}><Edit2 size={18} /></button>
                            <button className="action-btn delete" onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${student.name}? This will also remove all their book records.`)) {
                                    onDelete(student.id);
                                    showNotification(`${student.name} and their records have been deleted.`, 'info');
                                }
                            }}><Trash2 size={18} /></button>
                        </>
                    )}
                </div>
            </div>

            <div className="student-details">
                <div className="detail-item">
                    <Hash size={16} />
                    {isEditing ? (
                        <input
                            className="edit-input-small"
                            value={editData.rollNo}
                            onChange={e => setEditData({ ...editData, rollNo: e.target.value })}
                        />
                    ) : (
                        <span>Roll No: {student.rollNo}</span>
                    )}
                </div>
                <div className="detail-item">
                    <Layers size={16} />
                    {isEditing ? (
                        <input
                            className="edit-input-small"
                            value={editData.division}
                            onChange={e => setEditData({ ...editData, division: e.target.value })}
                        />
                    ) : (
                        <span>Division: {student.division}</span>
                    )}
                </div>
                <div className="detail-item contact-item">
                    <Phone size={16} />
                    {isEditing ? (
                        <input
                            className="edit-input-small"
                            value={editData.phone}
                            onChange={e => setEditData({ ...editData, phone: e.target.value })}
                        />
                    ) : (
                        <span>{student.phone || 'No Phone Provided'}</span>
                    )}
                    {!isEditing && student.phone && (
                        <button
                            className="wa-btn-small"
                            onClick={() => sendWhatsApp(student)}
                            title="Message on WhatsApp"
                        >
                            <MessageCircle size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="student-stats">
                <div className="stat">
                    <span className="stat-value">{studentIssues.length}</span>
                    <span className="stat-label">Total Borrowed</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{activeIssues.length}</span>
                    <span className="stat-label">Currently Holding</span>
                </div>
            </div>

            {activeIssues.length > 0 && (
                <div className="active-books">
                    <h4>Currently Issued</h4>
                    <ul>
                        {activeIssues.map(issue => {
                            const book = books.find(b => b.id === issue.bookId);
                            return <li key={issue.id}>{book?.title}</li>;
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

const Students = () => {
    const { students, issues, books, searchQuery, updateStudent, deleteStudent } = useLibrary();

    // We filter the students first based on the search query
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.division.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Now we sort them by urgency: Overdue > Due Soon > Active > No Active Issues
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        const getPriority = (studentId) => {
            const studentIssues = issues.filter(i => i.studentId === studentId && i.status === 'issued');
            if (studentIssues.length === 0) return 0;

            const today = new Date();
            let score = 1; // Base score for having an active issue

            studentIssues.forEach(issue => {
                const dueDate = new Date(issue.returnDate);
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                if (diffDays < 0) score = Math.max(score, 3); // Overdue
                else if (diffDays <= 2) score = Math.max(score, 2); // Due very soon
            });

            return score;
        };

        return getPriority(b.id) - getPriority(a.id);
    });

    return (
        <div className="students-page">
            <header className="page-header">
                <h1>Student Directory</h1>
                <p>Sorted by return urgency: Overdue and upcoming returns appear first.</p>
            </header>

            <div className="students-grid">
                {sortedStudents.map((student) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        issues={issues}
                        books={books}
                        onUpdate={updateStudent}
                        onDelete={deleteStudent}
                    />
                ))}
            </div>
        </div>
    );
};

export default Students;

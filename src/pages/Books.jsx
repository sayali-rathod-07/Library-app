import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import { Search, Plus, Book as BookIcon, Loader } from 'lucide-react';
import './Books.css';

const Books = () => {
    // We pull in our library data and the issue function from our global context
    const { books, issueBook, searchQuery, setBooks } = useLibrary();
    const { showNotification } = useNotification();

    // Local state for handling the search and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // The observer helps us detect when the user has scrolled to the bottom
    const observer = useRef();

    // This form state holds the details of the student we're currently issuing a book to
    const [studentForm, setStudentForm] = useState({
        name: '',
        rollNo: '',
        division: '',
        phone: '',
        email: '',
        days: 7
    });

    // This clever bit of code detects when the very last book on the page is visible,
    // which tells us it's time to load more books!
    const lastBookElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchMoreBooks = async (query, startIndex) => {
        setLoading(true);
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=20`);
            const data = await res.json();

            if (!data.items || data.items.length === 0) {
                setHasMore(false);
                return;
            }

            const formatted = data.items.map(item => ({
                id: item.id,
                title: item.volumeInfo.title,
                author: item.volumeInfo.authors?.[0] || 'Unknown',
                thumbnail: (item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover').replace('http://', 'https://'),
                isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || 'N/A',
                total: 5,
                available: 5
            }));

            if (searchTerm) {
                setSearchResults(prev => [...prev, ...formatted]);
            } else {
                setBooks(prev => {
                    const combined = [...prev, ...formatted];
                    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                    return unique;
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (page === 0) return;
        const query = searchTerm || 'indian+authors+famous+books';
        fetchMoreBooks(query, page * 20);
    }, [page]);

    const filteredBooks = (searchResults.length > 0 ? searchResults : books).filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const searchBooks = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        setSearchResults([]);
        setPage(0);
        setHasMore(true);
        fetchMoreBooks(searchTerm, 0);
    };

    const handleIssue = (e) => {
        e.preventDefault();
        issueBook(
            {
                name: studentForm.name,
                rollNo: studentForm.rollNo,
                division: studentForm.division,
                phone: studentForm.phone,
                email: studentForm.email
            },
            selectedBook.id,
            studentForm.days
        );
        setShowIssueModal(false);
        setStudentForm({ name: '', rollNo: '', division: '', phone: '', email: '', days: 7 });

        // Interactive feedback
        showNotification(`Book "${selectedBook.title}" issued successfully to ${studentForm.name}!`, 'success');
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#818cf8', '#4f46e5']
        });
    };

    return (
        <div className="books-page">
            <header className="page-header">
                <h1>Book Inventory</h1>
                <div className="header-actions">
                    <form className="search-form" onSubmit={searchBooks}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search Google Books API..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? <Loader className="spin" size={18} /> : 'Search'}
                        </button>
                    </form>
                </div>
            </header>

            <div className="books-grid">
                {filteredBooks.map((book, index) => {
                    if (filteredBooks.length === index + 1) {
                        return (
                            <div ref={lastBookElementRef} key={book.id} className="book-card glass-card">
                                <BookContent book={book} onIssue={() => { setSelectedBook(book); setShowIssueModal(true); }} />
                            </div>
                        );
                    } else {
                        return (
                            <div key={book.id} className="book-card glass-card">
                                <BookContent book={book} onIssue={() => { setSelectedBook(book); setShowIssueModal(true); }} />
                            </div>
                        );
                    }
                })}
            </div>

            {loading && (
                <div className="loading-more">
                    <Loader className="spin" size={32} />
                    <p>Loading more books...</p>
                </div>
            )}

            {!hasMore && <p className="end-message">You've reached the end of the library.</p>}

            {showIssueModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <h2>Issue Book</h2>
                        <p>Issuing: <strong>{selectedBook?.title}</strong></p>
                        <form onSubmit={handleIssue}>
                            <div className="form-group">
                                <label>Student Name</label>
                                <input
                                    required
                                    type="text"
                                    value={studentForm.name}
                                    onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Roll Number</label>
                                    <input
                                        required
                                        type="text"
                                        value={studentForm.rollNo}
                                        onChange={e => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Division</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. A, B"
                                        value={studentForm.division}
                                        onChange={e => setStudentForm({ ...studentForm, division: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="e.g. student@example.com"
                                    value={studentForm.email}
                                    onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={studentForm.phone}
                                    onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Issue Duration (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={studentForm.days}
                                    onChange={e => setStudentForm({ ...studentForm, days: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Confirm Issue</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const BookContent = ({ book, onIssue }) => (
    <>
        <div className="book-cover">
            <img
                src={book.thumbnail}
                alt={book.title}
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128x192?text=No+Cover';
                    e.target.onerror = null; // Prevent infinite loop
                }}
            />
        </div>
        <div className="book-details">
            <h3>{book.title}</h3>
            <p className="author">{book.author}</p>
            <div className="book-meta">
                <span>ISBN: {book.isbn}</span>
                <span className={`stock ${book.available > 0 ? 'in-stock' : 'out-stock'}`}>
                    {book.available} / {book.total} Available
                </span>
            </div>
            <button
                className="issue-btn"
                disabled={book.available === 0}
                onClick={onIssue}
            >
                <Plus size={16} /> Issue Book
            </button>
        </div>
    </>
);

export default Books;

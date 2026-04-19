import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import { Search, Plus, Book as BookIcon, Loader, Info, X as CloseIcon, Calendar, BookOpen as PagesIcon, Tag, Trash2 } from 'lucide-react';
import './Books.css';

const Books = () => {
    // We pull in our library data and the issue function from our global context
    const { books, issueBook, addBook, deleteBook, searchQuery, setBooks } = useLibrary();
    const { showNotification } = useNotification();

    // Local state for handling the search and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
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

    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        categories: ['Fiction'],
        publishedDate: '',
        pageCount: '',
        isbn: '',
        description: '',
        total: 10,
        thumbnail: ''
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

            const formatted = data.items.map(item => {
                const info = item.volumeInfo;
                const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || 'https://via.placeholder.com/128x192?text=No+Cover';
                const highResThumb = thumb.replace('zoom=1', 'zoom=2').replace('http://', 'https://');

                return {
                    id: item.id,
                    title: info.title,
                    author: info.authors?.[0] || 'Unknown',
                    thumbnail: highResThumb,
                    isbn: info.industryIdentifiers?.[0]?.identifier || 'N/A',
                    description: info.description || 'No description available.',
                    categories: info.categories || ['General'],
                    pageCount: info.pageCount || 'N/A',
                    publishedDate: info.publishedDate || 'Unknown',
                    total: 5,
                    available: 5
                };
            });

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                showNotification('Image is too large. Please select an image under 1MB.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setBookForm({ ...bookForm, thumbnail: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleManualAdd = (e) => {
        e.preventDefault();
        addBook(bookForm);
        setShowAddModal(false);
        setBookForm({
            title: '',
            author: '',
            categories: ['Fiction'],
            publishedDate: '',
            pageCount: '',
            isbn: '',
            description: '',
            total: 10,
            thumbnail: ''
        });
        showNotification(`Book "${bookForm.title}" added to inventory!`, 'success');
    };

    return (
        <div className="books-page">
            <header className="page-header">
                <h1>Book Inventory</h1>
                <div className="header-actions">
                    <button className="add-book-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} /> Add New Book
                    </button>
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
                    const handlers = {
                        onIssue: () => { setSelectedBook(book); setShowIssueModal(true); },
                        onViewDetails: () => { setSelectedBook(book); setShowDetailsModal(true); },
                        onDelete: () => {
                            if (window.confirm(`Are you sure you want to delete "${book.title}"? This will also remove all issue records for this book.`)) {
                                deleteBook(book.id);
                                showNotification(`"${book.title}" has been removed from inventory.`, 'info');
                            }
                        }
                    };

                    if (filteredBooks.length === index + 1) {
                        return (
                            <div ref={lastBookElementRef} key={book.id} className="book-card glass-card">
                                <BookContent book={book} {...handlers} />
                            </div>
                        );
                    } else {
                        return (
                            <div key={book.id} className="book-card glass-card">
                                <BookContent book={book} {...handlers} />
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

            {showDetailsModal && selectedBook && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content details-modal glass-card" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowDetailsModal(false)}>
                            <CloseIcon size={24} />
                        </button>

                        <div className="details-grid">
                            <div className="details-cover">
                                <img
                                    src={selectedBook.thumbnail}
                                    alt={selectedBook.title}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/128x192?text=No+Cover';
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                            <div className="details-info">
                                <h1>{selectedBook.title}</h1>
                                <p className="details-author">by {selectedBook.author}</p>

                                <div className="details-tags">
                                    {selectedBook.categories?.map(cat => (
                                        <span key={cat} className="tag"><Tag size={14} /> {cat}</span>
                                    ))}
                                </div>

                                <div className="details-meta-grid">
                                    <div className="meta-box">
                                        <Calendar size={18} />
                                        <div>
                                            <label>Published</label>
                                            <span>{selectedBook.publishedDate}</span>
                                        </div>
                                    </div>
                                    <div className="meta-box">
                                        <PagesIcon size={18} />
                                        <div>
                                            <label>Pages</label>
                                            <span>{selectedBook.pageCount}</span>
                                        </div>
                                    </div>
                                    <div className="meta-box">
                                        <BookIcon size={18} />
                                        <div>
                                            <label>ISBN</label>
                                            <span>{selectedBook.isbn}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="details-description">
                                    <h3>Description</h3>
                                    <p>{selectedBook.description}</p>
                                </div>

                                <button
                                    className="btn-primary full-width"
                                    disabled={selectedBook.available === 0}
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setShowIssueModal(true);
                                    }}
                                >
                                    <Plus size={18} /> Issue This Book
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Book to Inventory</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><CloseIcon size={20} /></button>
                        </div>
                        <form className="issue-form" onSubmit={handleManualAdd}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Book Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter book title"
                                        value={bookForm.title}
                                        onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter author name"
                                        value={bookForm.author}
                                        onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category / Tag</label>
                                    <select
                                        value={bookForm.categories[0]}
                                        onChange={e => setBookForm({ ...bookForm, categories: [e.target.value] })}
                                    >
                                        <option value="Fiction">Fiction</option>
                                        <option value="Non-Fiction">Non-Fiction</option>
                                        <option value="History">History</option>
                                        <option value="Science">Science</option>
                                        <option value="Philosophy">Philosophy</option>
                                        <option value="Mythology">Mythology</option>
                                        <option value="Biography">Biography</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Publish Date</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2024"
                                        value={bookForm.publishedDate}
                                        onChange={e => setBookForm({ ...bookForm, publishedDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Page Count</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 350"
                                        value={bookForm.pageCount}
                                        onChange={e => setBookForm({ ...bookForm, pageCount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ISBN Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter ISBN"
                                        value={bookForm.isbn}
                                        onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Total Copies</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={bookForm.total}
                                        onChange={e => setBookForm({ ...bookForm, total: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Book Cover Image</label>
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            id="book-cover-upload"
                                            className="file-input"
                                        />
                                        <label htmlFor="book-cover-upload" className="file-label">
                                            {bookForm.thumbnail ? 'Change Image' : 'Choose Image from Device'}
                                        </label>
                                        {bookForm.thumbnail && (
                                            <div className="image-preview">
                                                <img src={bookForm.thumbnail} alt="Preview" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    placeholder="Enter book description..."
                                    value={bookForm.description}
                                    onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add to Inventory</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const BookContent = ({ book, onIssue, onViewDetails, onDelete }) => (
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
            <div className="book-actions">
                <button
                    className="issue-btn"
                    disabled={book.available === 0}
                    onClick={onIssue}
                >
                    <Plus size={16} /> Issue
                </button>
                <button className="info-btn" onClick={onViewDetails}>
                    <Info size={16} /> Details
                </button>
                <button className="delete-btn-small" onClick={onDelete}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    </>
);

export default Books;

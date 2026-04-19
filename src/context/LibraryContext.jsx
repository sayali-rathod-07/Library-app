import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, format, isBefore, parseISO } from 'date-fns';
import { useAuth } from './AuthContext';

const LibraryContext = createContext();

export const useLibrary = () => useContext(LibraryContext);

export const LibraryProvider = ({ children }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // Helper to get user-specific storage key
    const getStorageKey = (key) => user ? `lib_${user.id}_${key}` : null;

    const [books, setBooks] = useState([]);
    const [students, setStudents] = useState([]);
    const [issues, setIssues] = useState([]);

    // Load data when user changes
    useEffect(() => {
        if (!user) {
            setBooks([]);
            setStudents([]);
            setIssues([]);
            return;
        }

        const savedBooks = localStorage.getItem(getStorageKey('books'));
        const savedStudents = localStorage.getItem(getStorageKey('students'));
        const savedIssues = localStorage.getItem(getStorageKey('issues'));

        const parsedBooks = savedBooks ? JSON.parse(savedBooks) : [];
        const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
        const parsedIssues = savedIssues ? JSON.parse(savedIssues) : [];

        // If new user has no books, load an empty array and let the API fetch Indian books
        if (parsedBooks.length === 0) {
            setBooks([]);
            setStudents([]);
            setIssues([]);
        } else {
            setBooks(parsedBooks);
            setStudents(parsedStudents);
            setIssues(parsedIssues);
        }
    }, [user?.id]);

    // Save data when it changes
    useEffect(() => {
        if (!user) return;
        localStorage.setItem(getStorageKey('books'), JSON.stringify(books));
        localStorage.setItem(getStorageKey('students'), JSON.stringify(students));
        localStorage.setItem(getStorageKey('issues'), JSON.stringify(issues));
    }, [books, students, issues, user?.id]);

    // Fetch more books from API
    useEffect(() => {
        if (!user) return;

        // One-time cleanup to switch to Indian-only books
        const cleanupKey = getStorageKey('indian_only_v1');
        if (!localStorage.getItem(cleanupKey)) {
            setBooks([]);
            localStorage.setItem(cleanupKey, 'true');
            return;
        }

        if (books.length > 0) return;

        const fetchInitialBooks = async () => {
            try {
                const queries = [
                    'indian+literature+classics',
                    'contemporary+indian+fiction',
                    'famous+indian+authors',
                    'indian+history+books',
                    'indian+mythology+books',
                    'indian+philosophy+books'
                ];

                let allBooks = [];
                for (const q of queries) {
                    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=20`);
                    const data = await res.json();
                    const formatted = data.items?.map(item => {
                        const info = item.volumeInfo;
                        const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || 'https://via.placeholder.com/128x192?text=No+Cover';
                        const highResThumb = thumb.replace('zoom=1', 'zoom=2').replace('http://', 'https://');

                        return {
                            id: item.id,
                            title: info.title,
                            author: info.authors?.[0] || 'Unknown Author',
                            thumbnail: highResThumb,
                            isbn: info.industryIdentifiers?.[0]?.identifier || 'N/A',
                            description: info.description || 'No description available.',
                            categories: info.categories || ['General'],
                            pageCount: info.pageCount || 'N/A',
                            publishedDate: info.publishedDate || 'Unknown',
                            total: 10,
                            available: 10
                        };
                    }) || [];
                    allBooks = [...allBooks, ...formatted];
                }
                setBooks(prev => {
                    const combined = [...prev, ...allBooks];
                    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                    return unique.slice(0, 60);
                });
            } catch (err) {
                console.error("Failed to fetch initial books:", err);
            }
        };
        fetchInitialBooks();
    }, [user?.id, books.length]);

    const issueBook = (studentData, bookId, days = 7) => {
        const studentId = `s${Date.now()}`;
        const newStudent = { ...studentData, id: studentId };

        const newIssue = {
            id: `i${Date.now()}`,
            studentId,
            bookId,
            issueDate: format(new Date(), 'yyyy-MM-dd'),
            returnDate: format(addDays(new Date(), days), 'yyyy-MM-dd'),
            status: 'issued'
        };

        setStudents(prev => [...prev, newStudent]);
        setIssues(prev => [...prev, newIssue]);
        setBooks(prev => prev.map(b => b.id === bookId ? { ...b, available: b.available - 1 } : b));
    };

    const returnBook = (issueId) => {
        const issue = issues.find(i => i.id === issueId);
        if (!issue) return;
        setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: 'returned' } : i));
        setBooks(prev => prev.map(b => b.id === issue.bookId ? { ...b, available: b.available + 1 } : b));
    };

    const updateStudent = (studentId, updatedData) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updatedData } : s));
    };

    const deleteStudent = (studentId) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setIssues(prev => prev.filter(i => i.studentId !== studentId));
    };

    const getDueSoon = () => {
        return issues
            .filter(i => i.status === 'issued')
            .sort((a, b) => parseISO(a.returnDate) - parseISO(b.returnDate));
    };

    const resetData = () => {
        if (!user) return;
        localStorage.removeItem(getStorageKey('books'));
        localStorage.removeItem(getStorageKey('students'));
        localStorage.removeItem(getStorageKey('issues'));
        window.location.reload();
    };

    const value = {
        books,
        students,
        issues,
        issueBook,
        returnBook,
        updateStudent,
        deleteStudent,
        getDueSoon,
        resetData,
        setBooks,
        searchQuery,
        setSearchQuery
    };

    return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

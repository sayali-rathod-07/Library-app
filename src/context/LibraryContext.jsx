import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, format, isBefore, parseISO } from 'date-fns';

const LibraryContext = createContext();

export const useLibrary = () => useContext(LibraryContext);

export const LibraryProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [books, setBooks] = useState(() => {
        const saved = localStorage.getItem('lib_books');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const fetchInitialBooks = async () => {
            if (books.length > 0) return;

            try {
                // Fetch from multiple queries to get a diverse set of 50+ books
                const queries = [
                    'indian+authors+famous+books',
                    'indian+literature+classics',
                    'famous+indian+novels'
                ];

                let allBooks = [];
                for (const q of queries) {
                    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=20`);
                    const data = await res.json();
                    const formatted = data.items?.map(item => ({
                        id: item.id,
                        title: item.volumeInfo.title,
                        author: item.volumeInfo.authors?.[0] || 'Unknown Author',
                        thumbnail: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover',
                        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || 'N/A',
                        total: Math.floor(Math.random() * 10) + 5,
                        available: Math.floor(Math.random() * 5) + 2
                    })) || [];
                    allBooks = [...allBooks, ...formatted];
                }

                // Remove duplicates by ID
                const uniqueBooks = Array.from(new Map(allBooks.map(item => [item.id, item])).values());
                setBooks(uniqueBooks.slice(0, 60)); // Get around 60 books
            } catch (err) {
                console.error("Failed to fetch initial books:", err);
            }
        };

        fetchInitialBooks();
    }, []);

    // --- STUDENT MANAGEMENT ---
    // We keep track of all students who have ever borrowed a book
    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('lib_students');
        return saved ? JSON.parse(saved) : [
            { id: 's1', name: 'Aarav Sharma', rollNo: '101', division: 'A', phone: '9876543210', email: 'aarav@example.com' },
            { id: 's2', name: 'Isha Patel', rollNo: '102', division: 'B', phone: '9123456789', email: 'isha@example.com' },
            { id: 's3', name: 'Rohan Gupta', rollNo: '103', division: 'A', phone: '9988776655', email: 'rohan@example.com' },
        ];
    });

    // --- ISSUE TRACKING ---
    // This is the core of our library system, tracking which student has which book
    const [issues, setIssues] = useState(() => {
        const saved = localStorage.getItem('lib_issues');
        return saved ? JSON.parse(saved) : [
            {
                id: 'i1',
                studentId: 's1',
                bookId: '3',
                issueDate: format(new Date(), 'yyyy-MM-dd'),
                returnDate: format(addDays(new Date(), -1), 'yyyy-MM-dd'), // This one is overdue!
                status: 'issued'
            },
            {
                id: 'i2',
                studentId: 's2',
                bookId: '1',
                issueDate: format(new Date(), 'yyyy-MM-dd'),
                returnDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'), // Due in a week
                status: 'issued'
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('lib_books', JSON.stringify(books));
        localStorage.setItem('lib_students', JSON.stringify(students));
        localStorage.setItem('lib_issues', JSON.stringify(issues));
    }, [books, students, issues]);

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

    const getDueSoon = () => {
        return issues
            .filter(i => i.status === 'issued')
            .sort((a, b) => parseISO(a.returnDate) - parseISO(b.returnDate));
    };

    const value = {
        books,
        students,
        issues,
        issueBook,
        returnBook,
        updateStudent,
        getDueSoon,
        setBooks,
        searchQuery,
        setSearchQuery
    };

    return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

# LibFlow - Library Book Issue Dashboard

LibFlow is a production-level React application designed for librarians to efficiently manage book issues, track student records, and monitor inventory in real-time.

## 🧠 Problem Statement
Librarians often struggle with manual tracking of book issues, leading to overdue returns, lost books, and inventory confusion. LibFlow provides a streamlined, digital solution to track book availability, student records, and automated due-date monitoring, ensuring efficient library management.

### Who is the user?
School or college librarians who need a simple yet powerful interface to manage daily book transactions.

### Why does this problem matter?
Manual record-keeping is prone to errors. LibFlow automates the tracking of due dates and availability, reducing administrative overhead and improving the student experience.

## ✨ Features
- **Real-time Dashboard**: Overview of total books, active issues, and overdue returns.
- **Google Books API Integration**: Search and fetch rich book metadata (covers, authors, ISBN) instantly.
- **Smart Issue System**: Add students and issue books with custom return dates.
- **Due-Date Monitoring**: A dedicated view for upcoming returns, sorted by urgency.
- **Inventory Management**: Track availability of every book in the library.
- **Student Directory**: Detailed records of students, their roll numbers, divisions, and borrowing history.
- **Responsive Design**: Fully functional on both desktop and mobile devices.

## 🛠 Tech Stack
- **Frontend**: React (Functional Components, Hooks, Context API)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Date Handling**: Date-fns
- **Styling**: Vanilla CSS (Custom Design System)
- **Backend**: Firebase (Auth + Firestore ready)
- **API**: Google Books API

## 🚀 Setup Instructions
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Add your Firebase config in `src/services/firebase.js`.
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure
- `/src/components`: Reusable UI components (Layout, Modals).
- `/src/pages`: Main application views (Dashboard, Books, Issues, Students).
- `/src/context`: Global state management using Context API.
- `/src/services`: Firebase and API service configurations.
- `/src/styles`: Global CSS and component-specific styles.

Demo video drive link -> https://drive.google.com/file/d/1AT4FcB4UlQ3oU2E9FjsX-l2xa4tsVTpl/view?usp=sharing

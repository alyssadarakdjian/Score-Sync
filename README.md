# **Score Sync**

##  Project Overview

**Score Sync** is a full-stack academic management platform built with the **MERN** stack.  
It allows teachers and administrators to manage students, grades, reports, and communications through a modern and responsive web interface.

### **Tech Stack**
- **MongoDB** – Database storage for users, students, grades, and course data  
- **Express.js** – Backend server handling API routes  
- **React.js** – Frontend UI framework  
- **Node.js** – Server runtime environment  
- **Tailwind CSS** – Utility-first CSS framework for styling  
- **TanStack Query (React Query)** – Data fetching and caching  
- **Lucide React** – Icon library  
- **Recharts** – Data visualization for analytics  

---

## **Prerequisites**

Ensure you have the following installed:
- **Node.js** (v18 or newer)
- **npm** (comes with Node.js)
- **MongoDB Atlas** account or local instance

---

UI & Libraries Setup

Install the following frontend dependencies:
npm install -D tailwindcss-cli
npx tailwindcss-cli init -p

npm install lucide-react framer-motion
npm install react-router-dom
npm install clsx
npm install @tanstack/react-query
npm install recharts

--

## **Folder Structure**


SCORE-SYNC/
├── backend/
│   ├── models/
│   │   ├── Teacher.js              # Schema for teachers
│   │   └── User.js                 # Schema for user authentication
│   ├── routes/
│   │   └── auth.js                 # Authentication routes (login/register)
│   ├── .env                        # Environment variables (Mongo URI, Port)
│   ├── package.json
│   ├── package-lock.json
│   └── server.js                   # Backend entry point (Express + MongoDB)
│
└── frontend/
├── public/                     # Public assets
│   └── index.html
│
├── src/
│   ├── api/
│   │   └── base44Client.js     # Handles API requests to backend
│   │
│   ├── Components/
│   │   ├── courses/
│   │   │   ├── CourseDialog.js
│   │   │   └── CourseTable.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── CourseOverview.js
│   │   │   ├── RecentGrades.js
│   │   │   ├── StatsCard.js
│   │   │   └── TopPerformers.js
│   │   │
│   │   ├── grades/
│   │   │   ├── GradeDialog.js
│   │   │   └── GradeTable.js
│   │   │
│   │   ├── students/
│   │   │   ├── StudentDialog.js
│   │   │   └── StudentTable.js
│   │   │
│   │   └── ui/
│   │       ├── sidebar/        # Sidebar navigation component
│   │       ├── avatar.js
│   │       ├── badge.js
│   │       ├── button.js
│   │       ├── card.js
│   │       ├── dialog.js
│   │       ├── input.js
│   │       ├── label.js
│   │       ├── select.js
│   │       ├── skeleton.js
│   │       ├── table.js
│   │       ├── textarea.js
│   │       └── Layout.js
│   │
│   ├── Pages/
│   │   ├── Calendar.js
│   │   ├── Courses.js
│   │   ├── Dashboard.js
│   │   ├── Grades.js
│   │   ├── Messages.js
│   │   ├── Reports.js
│   │   └── Students.js
│   │
│   ├── App.js                  # React Router setup + Layout integration
│   ├── App.css                 # Global styles
│   ├── Home.js                 # Landing / login redirect
│   ├── AdminLogin.js           # Admin authentication page
│   ├── index.js                # Entry point for React DOM render
│   ├── index.css               # Tailwind base imports
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   ├── utils.js                # Utility functions
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md





---

## **Database Connection**

The backend connects to **MongoDB Atlas** using `mongoose.connect()` inside `server.js`.  
Connection details are stored in `.env`:




---

## **Project Setup**

### **Backend Setup**
npm install
npm run dev

Expected output:
✅ MongoDB connected
🚀 Server running on http://127.0.0.1:5050



### **Frontend Setup**
npm install
npm start

Expected output:
Compiled successfully!
Local: http://localhost:3000



---

Features

Frontend
Dashboard – Overview of system metrics
Students Management – Add, edit, delete, and search students
Grades Management – Track, calculate, and visualize grades
Reports Page – Data analytics with charts (Recharts)
Messages – Communication between users (UI integrated)
Custom UI Components – Cards, Buttons, Badges, Inputs, Selects, Dialogs
Responsive Design – Built with Tailwind and modern component structure

Backend

RESTful API with Express.js
Authentication routes (Login / Register)
CRUD routes for Students, Grades, and Courses
MongoDB schema-based models with Mongoose
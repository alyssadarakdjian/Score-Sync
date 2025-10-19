Project Overview

This project is built using the MERN stack:
	•	MongoDB – for database storage
	•	Express.js – for backend server and routing
	•	React – for the frontend UI
	•	Node.js – for server runtime environment



Prerequisites
	•	Node.js (v18 or newer)
	•	npm (comes with Node.js)




Project Setup

Folder structure:
SCORE-SYNC/
├── backend/
│   ├── models/
│   │   └── User.js          # Mongoose schema for users
│   ├── routes/
│   │   └── auth.js          # Handles /api/auth/login and /api/auth/register
│   ├── server.js            # Main backend entry point
│   ├── .env                 # Environment variables (MongoDB URI, Port)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.js           # React frontend logic
    │   ├── App.css          # Styling for the login/register UI
    ├── package.json



Database Connection
	•	The backend connects to MongoDB Atlas using mongoose.connect() inside server.js.
	•	Connection details are stored in .env:

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ScoreSync
PORT=5050




Running the Project

	•	The backend and frontend have been configured to start in unison.
		Upon "cd" into /score-sync, the npm start command can be run to star
		both the front and backend.
		-If errors are returned, attempt to run "npm install" in the /score-sync
		folder.
		
    • BACKEND TERMINAL
        Make sure you are in the 'backend' directory of the project and run:
        npm run dev

        You should see:
        ✅ MongoDB connected
        🚀 Server running on http://127.0.0.1:5050

    • FRONTEND TERMINAL
        Make sure you are in the 'frontend' directory of the project and run:
        npm start

        You should see:
        A browser pop-up with the login page

## Project Overview
This project is part of an academic assignment and demonstrates a React-based application structure. 
The main focus is on learning component-based design, routing, and state management using modern React tools.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Technologies Used
- React  
- React Router  
- React Query  
- TailwindCSS  
- Node.js (API)  

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Folder Structure
Below is an overview of the project’s folder structure to help developers understand how both the backend and frontend are organized.

SCORE-SYNC/
├── backend/
│   ├── models/
│   │   ├── User.js                # Schema for user authentication
│   │   └── Teacher.js             # Schema for teachers
│   ├── routes/
│   │   └── auth.js                # Login/register route handlers
│   ├── server.js                  # Express + MongoDB backend server
│   ├── .env                       # Environment variables (Mongo URI, Port)
│   ├── package.json               # Backend dependencies and scripts
│   └── package-lock.json          # Backend lockfile
│
└─ frontend/
    ├── public/                    # Static public assets
    │   └── index.html
    │
    ├── src/
    │   ├── api/
    │   │   └── base44Client.js    # Axios API handler
    │   │
    │   ├── Components/
    │   │   ├── courses/
    │   │   ├── dashboard/
    │   │   ├── grades/
    │   │   ├── students/
    │   │   └── ui/                # Core reusable UI components
    │   │
    │   ├── Pages/                 # Main routed pages
    │   │   ├── Calendar.js
    │   │   ├── Courses.js
    │   │   ├── Dashboard.js
    │   │   ├── Grades.js
    │   │   ├── Messages.js
    │   │   ├── Reports.js
    │   │   └── Students.js
    │   │
    │   ├── App.js                 # Root React component + router
    │   ├── Home.js                # Landing/login redirect
    │   ├── AdminLogin.js          # Admin login page
    │   ├── utils.js               # Helper functions
    │   ├── App.css                # Global styling
    │   ├── index.js               # ReactDOM entry point
    │   ├── index.css              # Tailwind base imports
    │   ├── reportWebVitals.js     # Performance metrics
    │   └── setupTests.js          # Jest test setup
    │
    ├── package.json               # Frontend dependencies
    └── package-lock.json          # Frontend lockfile
    
### Notes
- Backend manages authentication and database operations.
- Frontend is built with React Router, React Query, and custom UI elements.
- Each folder represents a self-contained feature area for maintainability.


    


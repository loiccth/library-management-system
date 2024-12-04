# Introduction
This project aims to computerize the library system for Université des Mascareignes which still uses the old-fashioned way of lending books to students by keeping physical records.

The project is divided into three parts namely the frontend, backend, and machine learning to recommend books to students.
The technology stack used for this project is commonly known as MERN which stands for MongoDB, Express, React, and Node.

## Frontend
The application allows users to browse, reserve, and renew books, while also providing a comprehensive admin dashboard for the librarian to manage books (add, update, and delete), user activity, and analytics. The system is designed with a user-friendly interface to facilitate easy navigation for users and powerful tools for administrators to monitor and analyze system data which can be exported to a CSV file. The project is built using modern web technologies such as React, Material-UI, Chart.js, and more, ensuring a responsive and dynamic experience.

### Key Features:
1. Student Interface:
    - **Browse Books**: Users can search and browse books in the library, with options to filter by category, author, and title. Book details such as title, author, genre, and availability are displayed clearly.
    - **Reserve Books**: Users can reserve books that are available or on loan. Upon reservation, users are notified with a confirmation message by SMS and email.
    - **Renew Books**: Users can renew books they have borrowed, with a simple renewal process available through their account and a confirmation message will be sent.
    - **Responsive Design**: Built with Material-UI and styled with Emotion for a sleek and responsive user experience across devices, from desktops to mobile phones.
    - **User Authentication**: Secure login functionality with session management, allowing users to access their profiles and view borrowed books and reserves.
    - **Auto reminder**: Cron jobs are run to send reminders to users when their due dates are near.

2. Admin Dashboard:
    - **Manage Books**: Admins can add, update, or remove books from the library system. Each book entry includes metadata like title, author, category, thumbnail, and a small description which are pulled from the internet through an API by only providing the book's ISBN. Adding books in bulk by uploading a CSV containing their ISBN and quantities was implemented to improve efficiency.
    - **User Management**: Admins can view and manage user accounts, track borrowed books, and handle overdue items or fines.
    - **Analytics Dashboard**: The admin panel includes a real-time analytics section built using **Chart.js** and **react-chartjs-2**, providing insights into users borrowing patterns.
    - **Book Reservation Management**: Admins can see reserved and borrowed books and mark books as high demand which reduces the borrow time and the number of times it can be renewed.

3. Multi-Language Support:
    - **i18next** and **react-i18next** are integrated to provide multi-language support, making the system accessible to international students.
    - **i18next-browser-languagedetector** automatically detects and sets the user’s language preference based on their browser settings.

4. Real-Time Updates & Notifications:
    - **Axios** is used for making API requests to fetch book data, update user reservations, and manage book renewals in real-time.
    - Users receive notifications (via **Material-UI Snackbar**) when a book is successfully reserved, renewed, or when there are any issues with their reservations.

5. Security:
    - **Google reCAPTCHA** is integrated to prevent spam or unauthorized access during login and reservation processes.
    - **dompurify** is used to sanitize inputs from users, preventing malicious content or attacks such as XSS.
    - **React Hook Form** for form validation and smooth user experience.
    - Sensitive information is securely handled with the help of **js-cookie** for JWT token management.
  
## Backend
The backend is a RESTful API built with Express, MongoDB, and Node.js. It is designed to manage user authentication, data fetching and updating, file handling, notifications, and scheduled tasks for the frontend application.

### Key Features:
1. User Authentication and Authorization:
    - The API uses **JWT (JSON Web Tokens)** for secure user authentication and authorization. After a user logs in, a JWT is generated and returned, allowing them to access protected resources by passing the token in the request headers.
    - **bcrypt** is used to securely hash passwords before storing them in MongoDB, ensuring sensitive data is never saved in plain text.
    - Multifactor authentication codes are sent to the users and failed login attempts are stored in the database with their IP address and type of device/browser used.
  
2. Data Validation:
   - The API ensures incoming data is validated using **yup**, a schema-based validation library. This ensures that all API requests contain the correct data types and formats before being processed, reducing the risk of errors.
  
3. MongoDB Integration:
   - The API uses **MongoDB** with the **mongoose ODM (Object Data Modeling)** library to store data. MongoDB offers a flexible and scalable NoSQL database solution, while Mongoose simplifies data modeling, validation, and interaction with the database.
  
4. Email and SMS Notifications:
   - The API integrates with **Nodemailer** to send email notifications for actions like account creation, password resets, and other important updates by using the SMTP server from **Mailgun**.
   - Twilio is used to send **SMS** notifications, enabling real-time communication with users for alerts such as login attempts, password changes, or events like the due date is approaching.

5. Scheduled Tasks:
   - Cron jobs are used to schedule background tasks. For example, notifying users every day when they have overdue books.
  
## Recommender
This part of the project is developed using Python, lightfm, Numpy, and Flask. The main objective of this is to recommend similar books based on what books the users borrowed before using the category, author, and course the user is studying to build the matrix. Unfortunately, due to a lack of data, this part of the application couldn't be fully tested.

# Enhancements:
- Use TypeScript instead of plain JavaScript to detect type-related errors at compile time.
- Reduce data drilling in React to prevent unnecessary re-renders and remove tightly coupled components.
- Reduce the amount of **useEffect** hook to increase maintainability and readability.
- Remove dependency on **Axios** and use integrated **fetch** function instead.

# Getting started
```bash
git clone git@github.com:loiccth/library-system.git
cd library-system
npm install
cd backend
npm install
```

## Configuration
Open backend folder and rename .env.example to .env  
Configure your settings

## Run dev server

Install development dependencies
Run dev server using Concurrently

```bash
npm run dev
```

## Requirements
1. NodeJS
2. MongoDB Server
3. SMTP Server
4. Twilio API

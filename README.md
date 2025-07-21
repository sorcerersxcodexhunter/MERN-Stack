# MERN Job Portal Project

A full-stack job portal application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Frontend (React.js)

### Backend (Node.js/Express.js)

## Project Structure

```
├── backend/
│   ├── controller/          # API controllers
│   ├── middlewares/         # Authentication & file upload middlewares
│   ├── model/              # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── uploads/            # File uploads
│   ├── utils/              # Utilities (DB, Cloudinary, etc.)
│   └── validation/         # Input validation
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── redux/          # State management
│   │   ├── services/       # API services
│   │   └── utils/          # Helper functions
│   └── ...
└── README.md
```

## Installation & Setup

### Prerequisites

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Technologies Used

### Frontend

### Backend

## API Endpoints

### Authentication

### Jobs

### Applications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
=======
# Training
Engineersmind Training Program 
>>>>>>> a3616e8c91f12c62f58e0c948bc0286e0aba7b53
# MERN Job Portal Project

A full-stack job portal application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Frontend (React.js)
- User authentication (Login/Signup)
- Job browsing and searching
- Job applications
- Bookmark jobs
- Admin dashboard
- Responsive design with Bootstrap
- Chat bot integration

### Backend (Node.js/Express.js)
- RESTful API
- User authentication and authorization
- Job management
- Application management
- File upload (resumes, profile pictures)
- Admin panel
- Message system
- Job scraping functionality

## Project Structure

```
├── backend/
│   ├── controller/          # API controllers
│   ├── middlewares/         # Authentication & file upload middlewares
│   ├── model/              # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── uploads/            # File uploads
│   ├── utils/              # Utilities (DB, Cloudinary, etc.)
│   └── validation/         # Input validation
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── redux/          # State management
│   │   ├── services/       # API services
│   │   └── utils/          # Helper functions
│   └── ...
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Technologies Used

### Frontend
- React.js
- Redux Toolkit
- React Router
- Bootstrap
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer
- Cloudinary
- bcryptjs

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job (Admin)
- `PUT /api/jobs/:id` - Update job (Admin)
- `DELETE /api/jobs/:id` - Delete job (Admin)

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Apply for job
- `PUT /api/applications/:id` - Update application status (Admin)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

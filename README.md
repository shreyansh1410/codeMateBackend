# CodeMate - Find Your Coding Partner

CodeMate is a platform designed to help developers find coding partners and collaborate on projects. It features real-time chat, user profiles, and a matching system to connect developers with similar interests and skills.

## Features

- 🔐 User Authentication and Authorization
- 👤 User Profiles and Matching System
- 💬 Real-time Chat using Socket.IO
- 📧 Email Notifications using AWS SES
- 🔄 Automated Tasks using Node Cron
- 🔒 Secure Password Hashing with Bcrypt
- 🍪 JWT-based Authentication
- 🌐 CORS-enabled API
- 📱 Responsive Design

## Tech Stack

- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: AWS SES
- **Password Hashing**: Bcrypt
- **API Security**: CORS, Cookie Parser
- **Development Tools**: TypeScript, Nodemon

## Detailed Technical Overview

### Core Architecture
- **Runtime Environment**: Node.js (v16+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: AWS SES (Simple Email Service)
- **Task Scheduling**: Node Cron
- **Security**: Bcrypt for password hashing, CORS, Cookie Parser

### Key Components and Features

#### User Management System
- Comprehensive user schema with validation
- Fields include: firstName, lastName, emailId, age, gender, skills, bio, photoURL
- Built-in password hashing and comparison methods
- JWT token generation for authentication
- Email validation and uniqueness constraints
- Age restrictions (18-150 years)
- Skills limit (max 10 skills, 30 chars each)
- Bio length limit (200 chars)

#### Real-time Chat System
- Secure room creation using SHA-256 hashing
- Event handlers for:
  - `joinChat`: Manages chat room joining with request validation
  - `disconnect`: Handles user disconnection
  - `sendMessage`: Manages message sending and persistence
- Chat persistence in MongoDB
- Request-based chat access control
- CORS configuration for multiple origins

#### Request System
- Handles user connection requests
- Status tracking (accepted/rejected)
- Validation before chat access
- MongoDB-based persistence

#### Email Service
- AWS SES integration for email notifications
- Environment-based configuration
- Secure credential management

#### Automated Tasks
- Node Cron implementation for scheduled tasks
- Located in `src/utils/cronjobs.ts`

### Security Features

#### Authentication & Authorization
- JWT-based authentication
- Secure password hashing with Bcrypt
- Token-based session management
- Protected routes with middleware

#### Data Security
- Input validation on all models
- Password field exclusion from queries
- Secure room ID generation for chats
- CORS protection with specific origins

#### API Security
- Rate limiting
- Request validation
- Error handling middleware
- Secure cookie handling

### Database Design

#### Collections
- Users
- Chats
- Requests
- Messages

#### Indexing
- Email uniqueness index
- Name search optimization
- Gender-based filtering index

### API Structure

#### Route Organization
- Authentication routes (`/auth`)
- Profile routes (`/profile`)
- Request routes (`/request`)
- User routes (`/user`)
- Chat routes (`/chat`)

#### Middleware
- Authentication middleware
- Error handling middleware
- Request validation
- CORS handling

### Development Features

#### Development Tools
- TypeScript for type safety
- Nodemon for development
- Environment-based configuration
- Build process with TypeScript compilation

#### Code Organization
```
src/
├── app.ts              # Application entry point
├── routes/            # API route definitions
├── models/            # Database models
├── controllers/       # Business logic
├── middleware/        # Custom middleware
├── utils/            # Utility functions
└── types/            # TypeScript definitions
```

### Performance Optimizations
- Database indexing
- Efficient query design
- Socket.IO room management
- Caching considerations
- Error handling and logging

## Prerequisites

- Node.js >= 16.0.0
- MongoDB
- AWS Account (for email services)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/codemate.git
cd codemate
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication Routes
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user
- POST `/auth/logout` - Logout user
- GET `/auth/me` - Get current user profile

### Profile Routes
- GET `/profile` - Get user profile
- PUT `/profile` - Update user profile
- GET `/profile/:id` - Get specific user profile

### Request Routes
- POST `/request` - Create a new request
- GET `/request` - Get all requests
- PUT `/request/:id` - Update request status

### User Routes
- GET `/user` - Get all users
- GET `/user/:id` - Get specific user
- PUT `/user/:id` - Update user information

### Chat Routes
- GET `/chat` - Get chat history
- POST `/chat` - Send a message
- GET `/chat/:id` - Get specific chat

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Author

Shreyansh Shukla

## Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- Socket.IO team for real-time capabilities
- AWS team for email services

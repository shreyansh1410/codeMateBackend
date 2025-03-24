# CodeMate Backend

A TypeScript-based backend for CodeMate, a platform to find coding partners.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codematee
   JWT_SECRET=your_jwt_secret_key_here
   ```

## Development

To run the development server:

```bash
npm run dev
```

## Production

To build and run the production server:

```bash
npm run build
npm start
```

## API Endpoints

- `GET /`: Welcome message
- More endpoints coming soon...

## Technologies Used

- TypeScript
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

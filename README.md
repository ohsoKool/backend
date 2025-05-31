# Exercises Platform Backend

A RESTful API backend for managing coding exercises, user progress tracking, and authentication using Node.js, Express, Prisma, and JWT.

---

## Features

- User registration and login with secure password hashing (bcrypt)
- JWT-based authentication with access and refresh tokens
- CRUD APIs for exercises: fetch all exercises or a single exercise with details
- User progress tracking:
  - Save code progress per exercise
  - Mark exercises as completed
  - Track last visited exercise for resume functionality
- Secure routes protected by JWT verification
- CORS configured to allow frontend integration
- Cookie-based token storage with httpOnly and secure flags

---

## Tech Stack

- **Node.js** with **Express.js** for server and routing
- **Prisma ORM** for database access (PostgreSQL/MySQL/SQLite)
- **bcrypt** for password hashing
- **jsonwebtoken (JWT)** for authentication tokens
- **cookie-parser** for parsing cookies
- **dotenv** for environment variable management
- **cors** for Cross-Origin Resource Sharing

---

## Getting Started

### Installation

1. Clone the repo

```bash
git clone https://github.com/ohsoKool/backend
cd backend
```

2. After cloning the repository, install the project dependencies using your preferred package manager (npm or yarn). This will set up all required packages.

3. ```bash
   npm install
   npx prisma generate
   ```

4. The project requires environment variables to run properly. Create a `.env` file in the root directory similar to the .env.sample file

5. Once dependencies are installed and the environment variables are configured, start the server using `npm run dev`. The backend will establish a connection with the database through Prisma ORM and serve your API endpoints.

### Team Members

- G.Rishikesh
- Sai Sathwik

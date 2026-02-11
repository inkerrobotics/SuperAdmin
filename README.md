# Super Admin Login System

Secure multi-tenant platform with role-based authentication.

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
copy .env.example .env
```

4. Update `.env` with your database credentials and JWT secret.

5. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

6. Create a Super Admin user (using Prisma Studio or seed script):
```bash
npx prisma studio
```

Create a user with:
- Email: admin@example.com
- Password: (hash using bcrypt with salt rounds 10)
- Role: SUPER_ADMIN

Or use this Node.js script to hash password:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('yourpassword', 10).then(hash => console.log(hash));
```

7. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with expiration
- HTTP-only cookies for token storage
- Role-based access control
- CORS protection
- Input validation

## API Endpoints

- `POST /api/auth/super-admin/login` - Super Admin login
- `POST /api/auth/logout` - Logout

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Prisma
- Database: PostgreSQL
- Authentication: JWT, bcrypt

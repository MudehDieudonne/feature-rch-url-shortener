# URL Shortener Backend

Secure and scalable URL shortening API built with Node.js and PostgreSQL.

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Auth**: JWT
- **Documentation**: Swagger/OpenAPI

## 📖 API Documentation

Once the server is running, visit:
`http://localhost:5000/api-docs`

## ⚙️ Setup

1. `npm install`
2. Create `.env` based on `sample.env` if not present.
3. Set `DATABASE_URL` and `JWT_SECRET`.
4. `npx prisma db push` to sync schema.
5. `npm run dev` for development.

## 🚀 Key Features

- **Strict Validation**: All endpoints validated with Zod.
- **Redirection**: Fast 302 redirects from `/s/:shortCode`.
- **Analytics**: Tracks clicks for every shortened URL.
- **Expirations**: Set TTL for links that automatically "expire".
- **Logging**: Winston-based logging for all request activities.

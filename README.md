# Soca Backend API

REST API for a spare parts and appliances e-commerce platform, built with Node.js + Express and MySQL.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![ESM](https://img.shields.io/badge/ESM-Modules-yellow?style=flat)

---

## Tech Stack

- **Runtime** — Node.js (ESM)
- **Framework** — Express.js
- **Database** — MySQL 2 (connection pool)
- **Email** — Nodemailer
- **File Upload** — Multer
- **Logging** — Winston + express-winston
- **Security** — Helmet, express-rate-limit, CORS
- **Linting** — ESLint + Prettier

---

## Architecture

The project follows a modular, layered architecture with clear separation of concerns:

```
backend/
├── app.js                        # Express app setup
├── server.js                     # Server entry point
└── src/
    ├── config/
    │   ├── index.js              # Centralized config from env variables
    │   ├── database.js           # MySQL connection pool
    │   ├── mailer.js             # Nodemailer transporter
    │   └── logger.js             # Winston logger
    ├── errors/
    │   └── AppError.js           # Custom error class
    ├── middlewares/
    │   ├── asyncHandler.js       # Async wrapper (eliminates try/catch boilerplate)
    │   ├── errorHandler.js       # Centralized error handler
    │   └── upload.js             # Multer configuration
    ├── constants/
    │   └── sort.js               # SQL sort mapping
    ├── utils/
    │   ├── articleHelpers.js     # Image URL builder
    │   └── csv.js                # CSV generator
    └── modules/
        ├── articles/             # Repository → Service → Controller → Routes
        ├── categories/
        ├── manufacturers/
        └── mail/                 # Templates → Service → Controller → Routes
```

Each module follows the same pattern:

| Layer | Responsibility |
|-------|---------------|
| `repository.js` | Raw SQL queries, returns plain DB rows |
| `service.js` | Business logic, data transformations |
| `controller.js` | HTTP layer — parses request, calls service, sends response |
| `routes.js` | Route mounting + middleware |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database

### Installation

```bash
git clone <repo-url>
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
DB_CONNECTION_LIMIT=10

# Email (SMTP)
EMAIL_USER=your@email.com
EMAIL_PASS=your_password
MAIL_HOST=mail.example.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_RECIPIENT=recipient@email.com

# App
PORT=3001
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=200
```

### Running the Server

```bash
# Production
npm start

# Development (watch mode)
npm run dev
```

---

## API Endpoints

All routes are prefixed with `/api-v2`.

### Articles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/articles` | All articles with pagination (`?page`, `?limit`, `?search`, `?sort`, `?partner`) |
| `GET` | `/articles/category` | Articles by category (`?kategorija`, `?page`, `?limit`, `?sort`) |
| `GET` | `/articles/category/group` | Articles by category and group (`?kategorija`, `?grupa`) |
| `GET` | `/articles/invalid-image` | Articles with invalid image references |
| `GET` | `/article/:naziv` | Single article by slug |
| `GET` | `/article?id=` | Single article by ID |

**Sort options:** `relevance` (default) · `price-asc` · `price-desc` · `name-asc` · `name-desc`

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | All categories with their groups |

### Manufacturers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/manufacturers` | All manufacturers |

### Mail

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sendEmail` | Generic contact email |
| `POST` | `/reportFault` | Fault report submission (multipart: `image`, `pdf`) |
| `POST` | `/sendCartEmail` | Order email with CSV attachment |
| `POST` | `/sendInquiry` | Product inquiry |

---

## Error Handling

All errors are handled centrally through the `errorHandler` middleware.

- **`AppError(message, statusCode)`** — operational errors (404, 400, etc.) → returns `{ message }` with the appropriate status code
- **Unexpected errors** → logged via Winston, returns `500 Internal Server Error`
- **`asyncHandler`** wrapper propagates async errors to Express without manual try/catch in every controller

---

## Scripts

```bash
npm start      # node server.js
npm run dev    # node --watch server.js
npm run lint   # eslint . --fix
npm run format # prettier --write
```

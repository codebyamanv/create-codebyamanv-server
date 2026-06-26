# create-codebyamanv-server

A CLI scaffolding tool that generates a production-ready Express + MongoDB backend in seconds.

```bash
npm create codebyamanv-server@latest
```

> No global install needed. Just run the command above, enter a project name, and you're ready to go.

---

## What you get

A fully structured Node.js backend with authentication, session management, file uploads, and all the production hardening already wired up — so you can skip the boilerplate and start building features.

### Included packages

| Package | Purpose |
|---|---|
| `express` v5 | HTTP server |
| `mongoose` | MongoDB ODM |
| `bcrypt` | Password hashing (cost factor 12) |
| `zod` v4 | Request validation |
| `helmet` | Security headers |
| `cors` | Cross-origin resource sharing |
| `express-rate-limit` | Rate limiting |
| `morgan` | HTTP request logging |
| `cookie-parser` | Cookie parsing |
| `multer` | File / avatar uploads |
| `ua-parser-js` | Device & browser detection |
| `geoip-lite` | IP geolocation |
| `dotenv` | Environment variable loading |

### What's pre-built

- **User auth** — register, login, logout with secure session tokens
- **Session management** — per-device sessions, max-session enforcement, TTL auto-expiry via MongoDB index
- **Role-based access control** — `user` / `admin` roles, middleware-enforced
- **Avatar upload** — image-only, 5 MB cap, old file auto-deleted on update
- **Global error handler** — Mongoose errors, Multer errors, and custom `ErrorResponse` all normalised
- **Structured API responses** — consistent `{ success, statusCode, message, data, timestamp }` envelope
- **Environment-aware config** — `dev` vs `production` behaviour for cookies, logging, and error messages

---

## Quick start

```bash
npm create codebyamanv-server@latest
# → Enter project name: my-api

cd my-api
npm install
```

Copy the env file and fill in your values:

```bash
# .env is already present — just update MONGO_URI and CORS_ORIGINS
```

```bash
npm run dev
```

The server starts at `http://localhost:8000`.

---

## Generated project structure

```
my-api/
├── src/
│   ├── config/
│   │   ├── database.js      # Mongoose connection
│   │   └── env.js           # Env validation + exports
│   ├── controllers/
│   │   └── user.controller.js
│   ├── helpers/             # Re-export barrels (utils, models, routes)
│   ├── middlewares/
│   │   ├── AuthMiddleware.js
│   │   └── globalErrorHandler.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── session.model.js
│   ├── routes/
│   │   ├── base.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── errorResponse.js
│   │   ├── multer.js
│   │   └── sessionUtils.js
│   ├── validators/
│   │   └── authValidator.js
│   ├── app.js
│   ├── constant.js
│   └── index.js
├── uploads/
│   └── avatar/
│       └── default/
│           └── avatar.png
├── .env
├── .gitignore
└── package.json
```

---

## Contact

- **Author:** Aman Verma
- **Email:** amanverma0428@gmail.com
- **GitHub:** [github.com/codebyamanv](https://github.com/codebyamanv)
- **npm:** [npmjs.com/package/create-codebyamanv-server](https://www.npmjs.com/package/create-codebyamanv-server)

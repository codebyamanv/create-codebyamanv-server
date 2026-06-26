# Express + MongoDB Backend

Production-ready Node.js backend scaffolded by [create-codebyamanv-server](https://www.npmjs.com/package/create-codebyamanv-server).

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/mydb

# Comma-separated list of allowed CORS origins
CORS_ORIGINS=http://localhost:3000
```

All variables are validated at startup — the server will exit with a clear error if any required value is missing.

### 3. Run

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

---

## API reference

Base URL: `http://localhost:8000/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users` | Public | Register a new user |
| `POST` | `/users/login` | Public | Login and receive a session token |
| `POST` | `/users/logout` | Required | Revoke the current session |
| `GET` | `/users/current-user` | Required | Get the authenticated user's profile |
| `PATCH` | `/users/avatar` | Required | Upload / replace avatar image |

#### POST `/users` — Register

```json
{
  "fullname": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

Rules: fullname (no digits, max 100 chars), email (max 254 chars), password (8–128 chars).

#### POST `/users/login` — Login

```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

Response sets a `sessionToken` httpOnly cookie and also returns the token in the body for non-browser clients:

```json
{
  "success": true,
  "data": { "sessionToken": "..." }
}
```

#### PATCH `/users/avatar` — Change avatar

`multipart/form-data` with field name `avatar`. Accepted types: JPEG, PNG, GIF, WebP. Max size: 5 MB.

---

## Authentication

The `accessController` middleware supports two token delivery methods:

- **Cookie** (recommended for web): the `sessionToken` httpOnly cookie set on login
- **Bearer token** (for mobile / API clients): `Authorization: Bearer <token>`

To protect a route:

```js
import { accessController } from "./middlewares/AuthMiddleware.js"

router.get("/admin-only", accessController("admin"), handler)
router.get("/any-user",   accessController("user", "admin"), handler)
router.get("/all-authed", accessController(), handler)
```

Sessions expire after **7 days** and are auto-deleted by a MongoDB TTL index. A maximum of **3 concurrent sessions** per user is enforced — the oldest is revoked when exceeded.

---

## Project structure

```
src/
├── config/
│   ├── database.js        # Mongoose connection with graceful exit on failure
│   └── env.js             # Env variable validation and typed exports
├── controllers/
│   └── user.controller.js # register, login, logout, currentUser, changeAvatar
├── helpers/               # Re-export barrels — import from here instead of deep paths
│   ├── handlersHelper.js  # ApiResponse, asyncHandler, ErrorResponse
│   ├── modelHelper.js     # User, Session
│   └── routeHelper.js     # baseRouter, userRouter
├── middlewares/
│   ├── AuthMiddleware.js  # accessController(…roles)
│   └── globalErrorHandler.js
├── models/
│   ├── user.model.js      # bcrypt hashing pre-save hook, isPasswordCorrect method
│   └── session.model.js   # TTL index on expiresAt, device/geo fields
├── routes/
│   ├── base.routes.js     # GET / health-check
│   └── user.routes.js
├── utils/
│   ├── apiResponse.js     # Chainable response builder (.send(res))
│   ├── asyncHandler.js    # Wraps async route handlers, forwards errors to next()
│   ├── errorResponse.js   # Custom Error subclass with statusCode
│   ├── multer.js          # Disk storage, MIME whitelist, 5 MB limit
│   └── sessionUtils.js    # generateSessionToken, cookieOptions
├── validators/
│   └── authValidator.js   # Zod schemas for login and register
├── app.js                 # Express app setup (cors, helmet, morgan, rate-limit)
├── constant.js            # Route map and CORS config
└── index.js               # Entry point — connects DB then starts server
```

---

## Adding a new resource

1. **Model** — `src/models/thing.model.js`
2. **Validator** — `src/validators/thingValidator.js`
3. **Controller** — `src/controllers/thing.controller.js`
4. **Router** — `src/routes/thing.routes.js`
5. **Register** — add `{ path: "/api/v1/things", router: thingRouter }` to `src/constant.js`

Use `asyncHandler` for all async route handlers and throw `new ErrorResponse(message, statusCode)` for expected errors — `globalErrorHandler` handles the rest.

---

## Production checklist

- [ ] Set `NODE_ENV=production` in your hosting environment
- [ ] Set `MONGO_URI` to your production cluster connection string
- [ ] Set `CORS_ORIGINS` to your frontend domain(s)
- [ ] Uncomment and set `domain` in `src/utils/sessionUtils.js` (use `.yourdomain.com` for subdomains)
- [ ] Set `app.set("trust proxy", N)` in `src/app.js` to match your infrastructure's proxy hop count
- [ ] Ensure `uploads/` is on persistent storage (not ephemeral) or use a cloud bucket

---

## Contact

- **Author:** Aman Verma
- **Email:** amanverma0428@gmail.com
- **GitHub:** [github.com/codebyamanv](https://github.com/codebyamanv)

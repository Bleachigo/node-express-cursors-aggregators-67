# Express Server

A student project using Node.js and Express 5 to demonstrate routes, controllers, middleware, Passport-based authentication with server-side sessions, cookies, server-side view rendering (EJS/Pug), and calling an external API.

Repository: [Bleachigo/nodejs-express-passport-64](https://github.com/Bleachigo/nodejs-express-passport-64)

## Installation and startup

Use Node.js 18 or newer (for the built-in `fetch` API) and npm.

```bash
git clone https://github.com/Bleachigo/nodejs-express-passport-64
npm ci
cp .env.example .env   # then edit .env with your own secrets
npm start
```

The server listens on the port set by `PORT` in `.env` (defaults to `3000` in `.env.example`).

### Environment variables

| Variable         | Required | Description                                                                                                                                          |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`           | No       | Port the server listens on.                                                                                                                          |
| `SESSION_SECRET` | Yes      | Secret used to sign the session cookie. No built-in default — the app relies on `express-session`, which throws at startup if this is missing.       |
| `NODE_ENV`       | No       | `development` (default in `.env.example`) or `production`. In production the session cookie gets the `Secure` flag and Express trusts one proxy hop. |

See `.env.example` for the expected format.

## Project structure

```text
nodejs-express-63/
├── app.js                  # Express setup and middleware registration
├── server.js               # Starts the server
├── package.json
├── package-lock.json
├── public/
│   ├── favicon.ico         # Served at /favicon.ico via express.static
│   └── css/styles.css
└── src/
    ├── config/
    │   └── passport.config.js   # Local strategy, serializeUser/deserializeUser
    ├── controllers/         # Route handlers (render views or send text/JSON)
    ├── routes/              # auth, root, users, articles, theme endpoints
    ├── middleware/          # Logging, session auth, authorization, validation, theme, errors
    ├── services/            # Business logic (auth, users, articles)
    ├── repositories/        # JSON-file-backed user persistence (src/data/users.json)
    ├── data/
    │   ├── users.json       # Local user store, used until a real DB is added
    │   └── sessions/        # Session records written by session-file-store
    ├── views/               # EJS templates (articles) and Pug templates (users)
    └── utils/
        ├── AppError.js      # Error with an HTTP status code
        └── password.js      # Hash/verify passwords with bcrypt
```

The application follows an MVC-style separation between routing, controllers, and services. Registered users are persisted locally in `src/data/users.json` (a stand-in for a real database); `GET /users`, `GET /users/:userId`, and `PATCH /users/:userId` all read/write this file, while `POST`/`PUT`/`DELETE` on `/users` are still placeholder text responses that don't touch it. Article data is not stored locally: `GET` article requests fetch live data from the [JSONPlaceholder](https://jsonplaceholder.typicode.com) demo API and render it into HTML views. Article write operations (`POST`/`PUT`/`DELETE`) are simulated and return plain-text acknowledgements only.

## Middleware

Middleware runs in this order:

1. **Logging:** records the timestamp, method, URL, response status, and duration when a response finishes. It runs before body parsing, so malformed JSON requests are logged too.
2. **Security headers:** `helmet` applies its default set of response headers.
3. **Static files:** serves everything in `public/`, including `favicon.ico` and `css/styles.css`.
4. **Body parsing:** accepts JSON and URL-encoded form data.
5. **Cookies:** `cookie-parser` reads incoming cookies (used for the theme preference; the session cookie is handled by `express-session`).
6. **Sessions:** `express-session` backed by `session-file-store`, with a cookie named `sid` (`HttpOnly`, `SameSite=Lax`, `Secure` in production) and a one-hour sliding expiry (`rolling: true`). Sessions are written to `src/data/sessions/`, so they survive a server restart. The root route increments a visit counter; reuse the session cookie to retain it.
7. **Passport:** `passport.initialize()` and `passport.session()` restore `req.user` from the session on every request.
8. **Theme:** reads the `theme` cookie and exposes it to views as `res.locals.theme` (defaulting to `light`).
9. **Route middleware:** `authenticateLocal` on login, `requireAuth` on protected routes, `authorize('admin')` on admin-only routes, and body validation on user-input routes.
10. **Not found and error handling:** returns textual error messages with the appropriate HTTP status. Unexpected server errors are logged and return `Internal server error`.

## Static files & favicon

`public/favicon.ico` is served by `express.static` at `/favicon.ico`. Every EJS/Pug view includes:

```html
<link rel="icon" href="/favicon.ico" />
```

so the favicon shows up on all rendered pages (`views/articles/*.ejs`, `views/users/*.pug`).

## Theme cookie

`POST /theme` lets a client save a preferred UI theme (`light` or `dark`) in a cookie, read back on every request via `theme.middleware.js` and exposed to templates as `theme` (used as a `<body class>` in both the EJS and Pug views).

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/theme \
  -H 'Content-Type: application/json' \
  -d '{"theme":"dark"}'

# Theme cookie is now sent on subsequent requests:
curl -b cookies.txt http://localhost:3000/users
```

## Authentication (Passport + sessions)

Authentication uses Passport's local strategy with email and password, and server-side sessions. There is no fixed set of demo credentials — accounts are created via `POST /auth/register`.

- **Strategy** (`src/config/passport.config.js`): `passport-local` configured with `usernameField: 'email'`. It calls `verifyCredentials`, which looks the user up in `src/data/users.json` and compares the password against the stored `bcryptjs` hash.
- **Session serialization:** `serializeUser` stores only the user's id in the session; `deserializeUser` loads the user on each request and attaches `req.user = { id, email, role }` — the password hash is deliberately left out.
- **Session storage:** the session id travels in a signed cookie named `sid` (`HttpOnly`, `SameSite=Lax`, `Secure` when `NODE_ENV=production`) with a one-hour sliding expiry. The session data itself lives on the server in `src/data/sessions/`, written by `session-file-store`, so restarting the server does not log anyone out.
- **Login** (`authenticateLocal` in `src/middleware/auth.middleware.js`): wraps `passport.authenticate('local', …)` in a custom callback so failures surface as an `AppError` (`401 Invalid email or password`) through the central error handler, then calls `req.logIn` to create the session.
- **Protected routes** (`requireAuth`): rejects the request with `401 Unauthorized` unless `req.isAuthenticated()` is true. It guards `/users`, `/articles`, `GET /auth/me`, and `POST /auth/logout`.
- **Role check** (`authorize(...roles)` in `src/middleware/authorization.middleware.js`): runs after `requireAuth` and answers `403 Access denied` unless `req.user.role` is one of the listed roles. It guards `PUT`/`PATCH` under `/users` and `POST`/`PUT`/`DELETE` under `/articles`.
- **Logout:** `req.logout()` followed by `req.session.destroy()`, which also deletes the session file on disk.

There is no dedicated superuser-provisioning flow yet: the first admin account is created by registering normally and then manually flipping that user's `role` to `"admin"` in `src/data/users.json`.

## Routes

### Root

| Method | Path | Response                                  |
| ------ | ---- | ----------------------------------------- |
| GET    | `/`  | `Get root route. Session visits: {count}` |

No authentication is required.

### Theme

| Method | Path     | Body                             | Response                                                                |
| ------ | -------- | -------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/theme` | `{ "theme": "light" \| "dark" }` | `{ "message": "Theme saved", "theme": "..." }`, sets the `theme` cookie |

No authentication is required.

### Auth

| Method | Path             | Auth required | Body                                          | Response                                                             |
| ------ | ---------------- | ------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| POST   | `/auth/register` | No            | `{ "email", "password" }` (non-empty strings) | `201` `{ "user": { "id", "email", "role" } }`                        |
| POST   | `/auth/login`    | No            | `{ "email", "password" }`                     | `200` `{ "message": "Login successful", "user": {...} }`, sets `sid` |
| GET    | `/auth/me`       | Yes           | —                                             | `{ "user": { "id", "email", "role" } }`                              |
| POST   | `/auth/logout`   | Yes           | —                                             | `200` `{ "message": "Logout successful" }`, destroys the session     |

Registration does not open a session — log in afterwards to get one.

### Users

All routes require an authenticated session. `PUT`/`PATCH` additionally require the `admin` role.

| Method | Path             | Auth  | Body                      | Response                                                                                |
| ------ | ---------------- | ----- | ------------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/users`         | user  | —                         | Renders `src/views/users/index.pug` with all users from `src/data/users.json`           |
| POST   | `/users`         | user  | `{ "email", "password" }` | `Post user by id: {userId}` (placeholder response; does not persist)                    |
| GET    | `/users/:userId` | user  | —                         | Renders `src/views/users/details.pug` with the matching user from `src/data/users.json` |
| PUT    | `/users/:userId` | admin | `{ "email", "password" }` | `Put user by Id route: {userId}` (placeholder response; does not persist)               |
| PATCH  | `/users/:userId` | admin | `{ "email", "password" }` | Updates and returns the stored user record (JSON) from `src/data/users.json`            |
| DELETE | `/users/:userId` | user  | —                         | `Delete user by Id route: {userId}` (placeholder response; does not persist)            |

Note: `GET` and `PATCH` are wired to the local `src/data/users.json` store; `POST`, `PUT`, and `DELETE` are still placeholder text responses that ignore the body and don't touch it. The Pug views were originally written for the JSONPlaceholder user shape (`name`, `email`, numeric `id`) — local records only have `id` (UUID), `email`, `passwordHash`, and `role`, so `user.name` renders empty for `GET /users` and `GET /users/:userId`.

### Articles

All article routes require an authenticated session. `POST`, `PUT`, and `DELETE` additionally require the `admin` role.

| Method | Path                   | Auth  | Response                                                                             |
| ------ | ---------------------- | ----- | ------------------------------------------------------------------------------------ |
| GET    | `/articles`            | user  | Renders `src/views/articles/index.ejs` with all posts from JSONPlaceholder           |
| POST   | `/articles`            | admin | `Post articles route`                                                                |
| GET    | `/articles/:articleId` | user  | Renders `src/views/articles/details.ejs` with the matching post from JSONPlaceholder |
| PUT    | `/articles/:articleId` | admin | `Put article by Id route: {articleId}`                                               |
| DELETE | `/articles/:articleId` | admin | `Delete article by Id route: {articleId}`                                            |

### Errors

| Status | Condition                                                                     | Response                                                     |
| ------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 400    | Missing or invalid `email`/`password` fields                                  | `Email and password must be non-empty strings`               |
| 400    | Malformed JSON                                                                | Body parser's error message                                  |
| 401    | No authenticated session on a protected route                                 | `Unauthorized`                                               |
| 401    | Login with an unknown email or wrong password                                 | `Invalid email or password`                                  |
| 403    | Authenticated account lacks the `admin` role on an admin-only route           | `Access denied`                                              |
| 404    | `:userId` (PATCH) / `:articleId` doesn't exist                                | `User {userId} not found` / `Article not found`              |
| 404    | Unmatched route after preceding middleware passes                             | `Route {method} {url} not found`                             |
| 409    | Registering an email that already exists                                      | `User already exists`                                        |
| 502    | The JSONPlaceholder articles API call fails for a reason other than not-found | `Failed to fetch articles` / `Failed to fetch article by id` |
| 500    | Unexpected server error                                                       | `Internal server error`                                      |

## Testing with curl

```bash
# Root: create a session, then reuse it (counts 1 and 2).
curl -c cookies.txt http://localhost:3000/
curl -b cookies.txt -c cookies.txt http://localhost:3000/

# Register a new account (does not log you in).
curl -i -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@mail.com","password":"test-password"}'

# Log in (stores the session cookie in cookies.txt for reuse below).
curl -i -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@mail.com","password":"test-password"}'

# Who am I.
curl -b cookies.txt http://localhost:3000/auth/me

# User list and individual user (renders HTML views); requires a session.
curl -b cookies.txt http://localhost:3000/users
curl -b cookies.txt http://localhost:3000/users/<userId>

# Patch a locally stored user (requires the admin role on the logged-in account).
curl -b cookies.txt -X PATCH http://localhost:3000/users/<userId> \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@mail.com","password":"new-password"}'

# Save a UI theme preference.
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/theme \
  -H 'Content-Type: application/json' \
  -d '{"theme":"dark"}'

# Articles: reading needs a session, writing needs the admin role.
curl -b cookies.txt http://localhost:3000/articles
curl -b cookies.txt http://localhost:3000/articles/1
curl -b cookies.txt -X POST http://localhost:3000/articles
curl -b cookies.txt -X PUT http://localhost:3000/articles/1
curl -b cookies.txt -X DELETE http://localhost:3000/articles/1

# Sessions survive a restart: stop the server, start it again, then
curl -b cookies.txt http://localhost:3000/auth/me   # still 200

# Log out (destroys the session; the cookie stops working).
curl -b cookies.txt -X POST http://localhost:3000/auth/logout

# Failure cases: no session (401), denied role (403),
# missing register/login fields (400), unknown route (404).
curl -i http://localhost:3000/users
curl -i -H 'Cookie: sid=not-a-real-session' http://localhost:3000/users
curl -i -b cookies.txt -X POST http://localhost:3000/articles   # as a non-admin account
curl -i -X POST http://localhost:3000/auth/register -H 'Content-Type: application/json' -d '{}'
curl -i http://localhost:3000/missing
```

The session/theme examples create a local `cookies.txt` file, which can be deleted after testing. There is currently no `npm test` script; use the examples above for manual verification.

## Known limitations

See `ANALYSIS.md` for the current list of observations, open bugs, and improvement ideas.

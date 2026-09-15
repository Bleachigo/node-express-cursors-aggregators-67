# Express Server

A student project using Node.js and Express 5 to demonstrate routes, controllers, middleware, JWT authentication, cookies, server-side view rendering (EJS/Pug), and calling an external API.

Repository: [Bleachigo/nodejs-express-63](https://github.com/Bleachigo/nodejs-express-63)

## Installation and startup

Use Node.js 18 or newer (for the built-in `fetch` API) and npm.

```bash
git clone https://github.com/Bleachigo/nodejs-express-63.git
cd nodejs-express-63
npm ci
cp .env.example .env   # then edit .env with your own secrets
npm start
```

The server listens on the port set by `PORT` in `.env` (defaults to `3000` in `.env.example`).

### Environment variables

| Variable         | Required | Description                                                                                                                                    |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`           | No       | Port the server listens on.                                                                                                                    |
| `SESSION_SECRET` | Yes      | Secret used to sign the session cookie. No built-in default — the app relies on `express-session`, which throws at startup if this is missing. |
| `JWT_SECRET`     | Yes      | Secret used to sign/verify JWTs issued at register/login.                                                                                      |

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
    ├── controllers/         # Route handlers (render views or send text/JSON)
    ├── routes/               # auth, root, users, articles, theme endpoints
    ├── middleware/           # Logging, JWT auth, authorization, validation, theme, formatting, errors
    ├── services/             # Business logic (auth, users, articles)
    ├── repositories/         # JSON-file-backed user persistence (src/data/users.json)
    ├── data/                 # users.json - local user store, used until a real DB is added
    ├── views/                # EJS templates (articles) and Pug templates (users)
    └── utils/
        ├── AppError.js       # Error with an HTTP status code
        ├── jwt.js            # Sign/verify JWTs
        └── password.js       # Hash/verify passwords with bcrypt
```

The application follows an MVC-style separation between routing, controllers, and services. Registered users are persisted locally in `src/data/users.json` (a stand-in for a real database); `GET /users`, `GET /users/:userId`, and `PATCH /users/:userId` all read/write this file, while `POST`/`PUT`/`DELETE` on `/users` are still placeholder text responses that don't touch it. Article data is not stored locally: `GET` article requests fetch live data from the [JSONPlaceholder](https://jsonplaceholder.typicode.com) demo API and render it into HTML views. Article write operations (`POST`/`PUT`/`DELETE`) are simulated and return plain-text acknowledgements only.

## Middleware

Middleware runs in this order:

1. **Logging:** records the timestamp, method, URL, response status, and duration when a response finishes. It runs before body parsing, so malformed JSON requests are logged too.
2. **Static files:** serves everything in `public/`, including `favicon.ico` and `css/styles.css`, before the text-format default is applied.
3. **Response format:** sets a default `text/plain` content type for responses (overridden per-route for HTML/JSON responses).
4. **Body parsing:** accepts JSON and URL-encoded form data.
5. **Cookies:** `cookie-parser` reads incoming cookies (used for the JWT access token and the theme preference).
6. **Sessions:** `express-session` with an in-memory store and a one-hour cookie configured with `HttpOnly` and `SameSite=Lax`. Sessions reset when the server restarts. The root route increments a visit counter; reuse the session cookie to retain it.
7. **Theme:** reads the `theme` cookie and exposes it to views as `res.locals.theme` (defaulting to `light`).
8. **Route middleware:** JWT authentication on protected routes, role-based authorization on admin-only routes, and body validation on user-input routes.
9. **Not found and error handling:** returns textual error messages with the appropriate HTTP status. Unexpected server errors are logged and return `Internal server error`.

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

## Authentication (JWT)

Authentication is JWT-based, not HTTP Basic. There is no fixed set of demo credentials — accounts are created via `POST /auth/register`.

- `POST /auth/register` and `POST /auth/login` create/verify a user (passwords hashed with `bcryptjs`) and issue a JWT signed with `JWT_SECRET`.
- The token is returned as an `httpOnly` cookie named `accessToken` (`SameSite=Lax`, 1-hour expiry) — it is never exposed to client-side JavaScript.
- `authenticate` middleware (`src/middleware/auth.middleware.js`) reads `accessToken` from the cookie, verifies it, loads the user from `src/data/users.json`, and attaches `req.user = { id, username, role }`. It protects `/users`, `/articles`, and `GET /auth/me`.
- `authorize` middleware (`src/middleware/authorization.middleware.js`) additionally requires `req.user.role === 'admin'`. It protects all of `/articles` and the `PUT`/`PATCH` routes under `/users`.

There is no dedicated superuser-provisioning flow yet: the first admin account is created by registering normally and then manually flipping that user's `role` to `"admin"` in `src/data/users.json`.

## Routes

### Root

| Method | Path | Response                                  |
| ------ | ---- | ----------------------------------------- |
| GET    | `/`  | `Get root route. Session visits: {count}` |

No authentication is required.

### Theme

| Method | Path     | Body                | Response  |
| ------ | -------- | ------------------- | --------- |
| POST   | `/theme` | `{ "theme": "light" | "dark" }` | `{ "message": "Theme saved", "theme": "..." }`, sets the `theme` cookie |

No authentication is required.

### Auth

| Method | Path             | Auth required | Body                                             | Response                                             |
| ------ | ---------------- | ------------- | ------------------------------------------------ | ---------------------------------------------------- |
| POST   | `/auth/register` | No            | `{ "username", "password" }` (non-empty strings) | `201` `{ "user": {...} }`, sets `accessToken` cookie |
| POST   | `/auth/login`    | No            | `{ "username", "password" }`                     | `200` `{ "user": {...} }`, sets `accessToken` cookie |
| GET    | `/auth/me`       | Yes           | —                                                | `{ "user": {...} }`                                  |
| POST   | `/auth/logout`   | No            | —                                                | `204`, clears `accessToken` cookie                   |

### Users

All routes require a valid `accessToken` (JWT). `PUT`/`PATCH` additionally require the `admin` role.

| Method | Path             | Auth  | Body                         | Response                                                                       |
| ------ | ---------------- | ----- | ---------------------------- | ------------------------------------------------------------------------------- |
| GET    | `/users`         | user  | —                            | Renders `src/views/users/index.pug` with all users from `src/data/users.json` |
| POST   | `/users`         | user  | `{ "username", "password" }` | `Post user by id: {userId}` (placeholder response; does not persist)          |
| GET    | `/users/:userId` | user  | —                            | Renders `src/views/users/details.pug` with the matching user from `src/data/users.json` |
| PUT    | `/users/:userId` | admin | `{ "username", "password" }` | `Put user by Id route: {userId}` (placeholder response; does not persist)     |
| PATCH  | `/users/:userId` | admin | `{ "username", "password" }` | Updates and returns the stored user record (JSON) from `src/data/users.json`  |
| DELETE | `/users/:userId` | user  | —                            | `Delete user by Id route: {userId}` (placeholder response; does not persist)  |

Note: `GET` and `PATCH` are wired to the local `src/data/users.json` store; `POST`, `PUT`, and `DELETE` are still placeholder text responses that ignore the body and don't touch it. The Pug views were originally written for the JSONPlaceholder user shape (`name`, `email`, numeric `id`) — local records only have `id` (UUID), `username`, `passwordHash`, and `role`, so `user.name` renders empty for `GET /users` and `GET /users/:userId`.

### Articles

All article routes require a valid `accessToken` **and** the `admin` role.

| Method | Path                   | Response                                                                             |
| ------ | ---------------------- | ------------------------------------------------------------------------------------ |
| GET    | `/articles`            | Renders `src/views/articles/index.ejs` with all posts from JSONPlaceholder           |
| POST   | `/articles`            | `Post articles route`                                                                |
| GET    | `/articles/:articleId` | Renders `src/views/articles/details.ejs` with the matching post from JSONPlaceholder |
| PUT    | `/articles/:articleId` | `Put article by Id route: {articleId}`                                               |
| DELETE | `/articles/:articleId` | `Delete article by Id route: {articleId}`                                            |

### Errors

| Status | Condition                                                            | Response                                                    |
| ------ | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| 400    | Missing or invalid `username`/`password` fields                      | `Username and password must be non-empty strings`           |
| 400    | Malformed JSON                                                       | Body parser's error message                                 |
| 401    | Missing/invalid/expired `accessToken` cookie                         | `Authentication required` / `Invalid or expired token`      |
| 401    | Login with unknown username or wrong password                        | `Invalid username or password`                              |
| 403    | Authenticated account lacks the `admin` role on a protected route    | `Access denied`                                             |
| 404    | `:userId` (PATCH) / `:articleId` doesn't exist                       | `User {userId} not found` / `Article not found`             |
| 404    | Unmatched route after preceding middleware passes                    | `Route {method} {url} not found`                            |
| 409    | Registering a username that already exists                           | `Username already exists`                                   |
| 502    | The JSONPlaceholder articles API call fails for a reason other than not-found | `Failed to fetch articles` / `Failed to fetch article by id` |
| 500    | Unexpected server error                                              | `Internal server error`                                     |

## Testing with curl

```bash
# Root: create a session, then reuse it (counts 1 and 2).
curl -c cookies.txt http://localhost:3000/
curl -b cookies.txt -c cookies.txt http://localhost:3000/

# Register a new account (stores the JWT cookie in cookies.txt for reuse below).
curl -i -c cookies.txt -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"test-password"}'

# Log in with an existing account instead.
curl -i -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"test-password"}'

# Who am I.
curl -b cookies.txt http://localhost:3000/auth/me

# User list and individual user (renders HTML views); requires a valid accessToken cookie.
curl -b cookies.txt http://localhost:3000/users
curl -b cookies.txt http://localhost:3000/users/1

# Patch a locally stored user (requires the admin role on the logged-in account).
curl -b cookies.txt -X PATCH http://localhost:3000/users/<userId> \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"new-password"}'

# Save a UI theme preference.
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/theme \
  -H 'Content-Type: application/json' \
  -d '{"theme":"dark"}'

# Article access: requires the admin role.
curl -b cookies.txt http://localhost:3000/articles
curl -b cookies.txt -X POST http://localhost:3000/articles
curl -b cookies.txt http://localhost:3000/articles/1
curl -b cookies.txt -X PUT http://localhost:3000/articles/1
curl -b cookies.txt -X DELETE http://localhost:3000/articles/1

# Log out (clears the accessToken cookie).
curl -b cookies.txt -X POST http://localhost:3000/auth/logout

# Failure cases: missing/invalid auth (401), denied role (403),
# missing register/login fields (400), unknown route (404).
curl -i http://localhost:3000/users
curl -i -H 'Cookie: accessToken=not-a-real-token' http://localhost:3000/users
curl -i -b cookies.txt http://localhost:3000/articles   # as a non-admin account
curl -i -X POST http://localhost:3000/auth/register -H 'Content-Type: application/json' -d '{}'
curl -i http://localhost:3000/missing
```

The session/theme/auth examples create a local `cookies.txt` file, which can be deleted after testing. There is currently no `npm test` script; use the examples above for manual verification.

## Known limitations

See `ANALYSIS.md` for the current list of observations, open bugs, and improvement ideas.

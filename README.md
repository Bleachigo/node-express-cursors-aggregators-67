# Express Server

A student project using Node.js and Express 5 to demonstrate routes, controllers, middleware, sessions, server-side view rendering (EJS/Pug), and calling an external API.

Repository: [Bleachigo/express-api-60](https://github.com/Bleachigo/express-api-60)

## Installation and startup

Use Node.js 18 or newer (for the built-in `fetch` API) and npm.

```bash
git clone https://github.com/Bleachigo/express-pug-ejs-62
cd express-api-60
npm ci
npm start
```

The server listens at `http://localhost:3000`. The port is fixed in `server.js`.

Optionally set a session secret when starting the server:

```bash
SESSION_SECRET='your-local-session-secret' npm start
```

If omitted, the application uses its built-in student-project secret.

## Project structure

```text
express-api-60/
├── app.js                  # Express setup and middleware registration
├── server.js               # Starts the server on port 3000
├── package.json
├── package-lock.json
└── src/
    ├── controllers/        # Route handlers (render views or send text)
    ├── routes/              # Root, user, and article endpoints
    ├── middleware/          # Logging, auth, access control, validation, formatting, errors
    ├── services/            # Fetch user/article data from jsonplaceholder.typicode.com
    ├── views/               # EJS templates (articles) and Pug templates (users)
    └── utils/
        └── AppError.js      # Error with an HTTP status code
```

The application preserves MVC-style separation between routing, controllers, and services. User and article data is not stored locally; `GET` requests fetch live data from the [JSONPlaceholder](https://jsonplaceholder.typicode.com) demo API and render it into HTML views. Write operations (`POST`/`PUT`/`DELETE`) are simulated and return plain-text acknowledgements only.

## Middleware

Middleware runs in this order:

1. **Logging:** records the timestamp, method, URL, response status, and duration when a response finishes. It runs before body parsing, so malformed JSON requests are logged too.
2. **Response format:** sets a default `text/plain` content type for responses.
3. **Body parsing:** accepts JSON and URL-encoded form data.
4. **Sessions:** uses `express-session` with an in-memory store and a one-hour cookie configured with `HttpOnly` and `SameSite=Lax`. Sessions reset when the server restarts. The root route increments a visit counter; reuse the session cookie to retain it.
5. **Route middleware:** checks HTTP Basic auth credentials on user/article routes, validates user POST/PUT bodies, and checks the authenticated account's role for article routes.
6. **Not found and error handling:** returns textual error messages with the appropriate HTTP status. Unexpected server errors are logged and return `Internal server error`.

## Authentication

User and article routes require **HTTP Basic authentication**. Two accounts are built in:

| Username | Password   | Role    |
| -------- | ---------- | ------- |
| `admin`  | `admin123` | `admin` |
| `user`   | `user123`  | `user`  |

Any other credentials, or a missing/malformed `Authorization` header, are rejected. These are fixed demo credentials for testing only — there is no real user store or login flow.

Article routes additionally require the authenticated account to have the `admin` role.

## Routes

### Root

| Method | Path | Response                                  |
| ------ | ---- | ----------------------------------------- |
| GET    | `/`  | `Get root route. Session visits: {count}` |

No authentication is required. A new session starts with a visit count of 1.

### Users

All user routes require Basic auth with either account above.

POST and PUT additionally require `username` and `password` in a JSON or URL-encoded body. Both must be strings containing at least one non-whitespace character.

| Method | Path             | Response                                                                          |
| ------ | ---------------- | --------------------------------------------------------------------------------- |
| GET    | `/users`         | Renders `src/views/users/index.pug` with the full user list from JSONPlaceholder  |
| POST   | `/users`         | `Post users route`                                                                |
| GET    | `/users/:userId` | Renders `src/views/users/details.pug` with the matching user from JSONPlaceholder |
| PUT    | `/users/:userId` | `Put user by Id route: {userId}`                                                  |
| DELETE | `/users/:userId` | `Delete user by Id route: {userId}`                                               |

### Articles

All article routes require Basic auth **and** the `admin` role.

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
| 400    | Missing or invalid user POST/PUT fields                              | `Username and password must be non-empty strings`           |
| 400    | Malformed JSON                                                       | Body parser's error message                                 |
| 401    | Missing `Authorization` header                                       | `Authorization header is required`                          |
| 401    | `Authorization` header is not `Basic ...`                            | `Basic authorization is required`                           |
| 401    | Basic credentials don't match a known account                        | `Invalid credentials`                                       |
| 403    | Authenticated account is not `admin` on an article route             | `Access denied`                                             |
| 404    | `:userId` / `:articleId` doesn't exist in JSONPlaceholder            | `User not found` / `Article not found`                      |
| 404    | Unmatched route after preceding middleware passes                    | `Route {method} {url} not found`                            |
| 502    | The JSONPlaceholder API call fails for a reason other than not-found | `Failed to fetch articles` / `Failed to fetch users` / etc. |
| 500    | Unexpected server error                                              | `Internal server error`                                     |

## Testing with curl

```bash
# Root: create a session, then reuse it (counts 1 and 2).
curl -c cookies.txt http://localhost:3000/
curl -b cookies.txt -c cookies.txt http://localhost:3000/

# User list and individual user (renders HTML views).
curl -u user:user123 http://localhost:3000/users
curl -u user:user123 http://localhost:3000/users/1

# Valid user creation and update.
curl -X POST http://localhost:3000/users \
  -u user:user123 \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"test-password"}'

curl -X PUT http://localhost:3000/users/1 \
  -u user:user123 \
  -d 'username=student&password=test-password'

curl -X DELETE -u user:user123 http://localhost:3000/users/1

# Article access: requires the admin account.
curl -u admin:admin123 http://localhost:3000/articles
curl -X POST -u admin:admin123 http://localhost:3000/articles
curl -u admin:admin123 http://localhost:3000/articles/1
curl -X PUT -u admin:admin123 http://localhost:3000/articles/1
curl -X DELETE -u admin:admin123 http://localhost:3000/articles/1

# Failure cases: missing authentication (401), wrong scheme (401),
# denied role (403), missing user fields (400), unknown route (404).
curl -i http://localhost:3000/users
curl -i -H 'Authorization: test-user' http://localhost:3000/users
curl -i -u user:user123 http://localhost:3000/articles
curl -i -X POST -u user:user123 http://localhost:3000/users
curl -i http://localhost:3000/missing
```

The session examples create a local `cookies.txt` file, which can be deleted after testing. There is currently no `npm test` script; use the examples above for manual verification.

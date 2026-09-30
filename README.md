# Express Server with MongoDB

A student project using Node.js, Express 5 and MongoDB Atlas. It implements create, read, update, replace and delete operations with the official `mongodb` driver, behind an MVC-style REST API.

Repository: [Bleachigo/node-express-mongodb-65-66](https://github.com/Bleachigo/node-express-mongodb-65-66)

## Technologies

- **Node.js** 20.11 or newer (`--env-file`, `import.meta.dirname`)
- **Express.js** 5
- **MongoDB Atlas** through the official `mongodb` driver (7.6)

## Installation and startup

```bash
git clone https://github.com/Bleachigo/node-express-mongodb-65-66.git
cd node-express-mongodb-65-66
npm ci
cp .env.example .env   # then fill in your own values
npm start              # or: npm run dev (restarts on file changes)
```

On startup the server connects to MongoDB, pings the database, and only then starts listening on `PORT`. `Ctrl+C` (or `SIGTERM`) stops the HTTP server and closes the MongoDB connection.

### Environment variables

| Variable          | Required | Description                                                              |
| ----------------- | -------- | ------------------------------------------------------------------------ |
| `PORT`            | No       | Port the server listens on (`3000` in `.env.example`).                   |
| `SESSION_SECRET`  | Yes      | Secret used to sign the session cookie.                                  |
| `NODE_ENV`        | No       | `development` (default in `.env.example`) or `production`.               |
| `MONGODB_URI`     | Yes      | MongoDB Atlas SRV connection string (`mongodb+srv://…`).                 |
| `MONGODB_DB_NAME` | Yes      | Database name. Holds the `users`, `balloons` and `sessions` collections. |

See `.env.example` for the expected format.

## Project structure

```text
src/
├── config/
│   └── mongodb.config.js        # MongoClient, connectMongo / getCollection / closeMongo
├── routes/                      # users.routes.js, balloons.routes.js, auth.routes.js
├── controllers/                 # Read the request, call a service, send the response
├── services/                    # Validation, filters, 404 checks
└── repositories/
    ├── mongodb.repository.js    # Generic wrappers around the driver's CRUD methods
    ├── users.repository.js      # `users` collection, projection of public fields
    └── balloons.repository.js   # `balloons` collection
```

Requests flow routes → controllers → services → repositories → MongoDB. `mongodb.repository.js` is the only file that calls the driver directly; the collection repositories convert string ids to `ObjectId` and map `_id` to a string `id` in results. An invalid id is answered with `404`, the same as an id that doesn't exist.

## MongoDB CRUD operations

Each homework task and where it is implemented. Where a `findOneAnd…` method is used instead of the plain one, the route returns the changed document rather than a result summary.

| Task           | Driver method                                 | Route                                                  | Repository method                                                       |
| -------------- | --------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Create one     | `insertOne`                                   | `POST /auth/register`                                  | `mongoRepository.insertDocument` → `usersRepository.createOne`          |
| Create many    | `insertMany`                                  | `POST /balloons`                                       | `mongoRepository.insertDocuments` → `balloonsRepository.createMany`     |
| Update one     | `updateOne`                                   | `PATCH /balloons/:balloonId`                           | `mongoRepository.updateOne` → `balloonsRepository.updateBalloon`        |
|                | `findOneAndUpdate` (instead of `updateOne`)   | `PATCH /users/:userId`                                 | `mongoRepository.updateDocument` → `usersRepository.update`             |
| Update many    | `updateMany`                                  | `PATCH /balloons?color=…&shape=…`                      | `mongoRepository.updateDocuments` → `balloonsRepository.updateBalloons` |
| Replace one    | `replaceOne`                                  | `PUT /balloons/:balloonId`                             | `mongoRepository.replaceOne` → `balloonsRepository.replaceBalloon`      |
|                | `findOneAndReplace` (instead of `replaceOne`) | `PUT /users/:userId`                                   | `mongoRepository.replaceDocument` → `usersRepository.replace`           |
| Delete one     | `deleteOne`                                   | `DELETE /balloons/:balloonId`, `DELETE /users/:userId` | `mongoRepository.deleteDocument`                                        |
| Delete many    | `deleteMany`                                  | `DELETE /balloons?color=…&shape=…`                     | `mongoRepository.deleteDocuments` → `balloonsRepository.deleteBalloons` |
| Read + project | `find` / `findOne` with `projection`          | `GET /users`, `GET /users/:userId`                     | `mongoRepository.findDocuments` / `findDocument`                        |

### Reading with projection

`users.repository.js` applies `projection: { email: 1, role: 1 }` to every read by default, so `passwordHash` never leaves the repository. Only `findCredentialsByEmail`, used at login, adds `passwordHash: 1`, and the hash is stripped again before the user is returned. `findAll` and `findById` accept extra driver options (`limit`, `skip`, `sort`, …) that are merged over the default projection.

### Filters for many-document operations

`updateMany` and `deleteMany` on balloons build their filter from the `color` and `shape` query parameters. The color is trimmed and lowercased, the shape must be one of `round`, `heart`, `star`, and an empty filter is rejected with `400`, so a request can never update or delete the whole collection.

## Routes

### Auth

Needed to create users and to reach the `/users` routes. Login opens a session (cookie `sid`) that the `/users` routes require.

| Method | Path             | Body                                          | Response                                                             |
| ------ | ---------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| POST   | `/auth/register` | `{ "email", "password" }` (non-empty strings) | `201` `{ "user": { "id", "email", "role" } }` (`insertOne`)          |
| POST   | `/auth/login`    | `{ "email", "password" }`                     | `200` `{ "message": "Login successful", "user": {...} }`, sets `sid` |
| POST   | `/auth/logout`   | —                                             | `200` `{ "message": "Logout successful" }`                           |

The password is stored as a bcrypt hash (`passwordHash`); new users get the role `user`. To make an admin, change the user's `role` to `"admin"` in the `users` collection (Atlas Data Explorer or `mongosh`).

### Users

All routes require a logged-in session. `PUT`, `PATCH` and `DELETE` additionally require the `admin` role. `:userId` is a MongoDB `ObjectId` string.

| Method | Path             | Auth  | Body                              | Response                                                                   |
| ------ | ---------------- | ----- | --------------------------------- | -------------------------------------------------------------------------- |
| GET    | `/users`         | user  | —                                 | HTML list of every user's email and id (`find` + projection)               |
| GET    | `/users/:userId` | user  | —                                 | HTML page for one user (`findOne` + projection)                            |
| PUT    | `/users/:userId` | admin | `{ "email", "password", "role" }` | Replaces the whole user document and returns it (`findOneAndReplace`)      |
| PATCH  | `/users/:userId` | admin | Fields to change                  | Updates the given fields and returns the updated user (`findOneAndUpdate`) |
| DELETE | `/users/:userId` | admin | —                                 | Deletes the user (`deleteOne`)                                             |

`PUT` hashes the new password with bcrypt before storing it, so only `passwordHash` is saved.

### Balloons

A demo collection for the bulk operations. `:balloonId` is a MongoDB `ObjectId` string.

A balloon has `color` (non-empty string, stored trimmed and lowercased), `shape` (`round`, `heart` or `star`), `size` (positive integer) and `createdAt` (set by the server).

| Method | Path                            | Body                                          | Response                                                                   |
| ------ | ------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| POST   | `/balloons`                     | Array of 1–100 `{ "color", "shape", "size" }` | `201` array of created balloons with `id` and `createdAt` (`insertMany`)   |
| PATCH  | `/balloons/:balloonId`          | Fields to change, e.g. `{ "size": 12 }`       | `200` `{ "matchedCount", "modifiedCount" }` (`updateOne`)                  |
| PUT    | `/balloons/:balloonId`          | Full balloon `{ "color", "shape", "size" }`   | `200` `{ "matchedCount", "modifiedCount" }` (`replaceOne`)                 |
| DELETE | `/balloons/:balloonId`          | —                                             | `200` `{ "message": "1 balloon {id} successfully deleted" }` (`deleteOne`) |
| PATCH  | `/balloons?color={c}&shape={s}` | `{ "color": "<new color>" }`                  | `200` `{ "matched", "modified" }` (`updateMany`)                           |
| DELETE | `/balloons?color={c}&shape={s}` | —                                             | `200` `{ "message": "{n} document/s deleted" }` (`deleteMany`)             |

`POST /balloons` validates every item before inserting any, so a batch with one invalid item is rejected as a whole. `PATCH` and `DELETE` on `/balloons` require both `color` and `shape` query parameters.

### Errors

Errors are answered as plain text with the status below.

| Status | Condition                                                                | Response                                                                                   |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 400    | Missing or invalid `email`/`password`                                    | `Email and password must be non-empty strings`                                             |
| 400    | Invalid balloon batch or item                                            | `Body must be an array of 1-100 balloons` / `Item {n}: …`                                  |
| 400    | Missing `color`/`shape` query parameter or invalid filter on `/balloons` | `Query param "color" is required`, `shape must be one of …`                                |
| 401    | No logged-in session on `/users`, or wrong email/password at login       | `Unauthorized` / `Invalid email or password`                                               |
| 403    | The account lacks the `admin` role                                       | `Access denied`                                                                            |
| 404    | User or balloon with that id doesn't exist (or the id is invalid)        | `User {id} not found` / `Balloon {id} not found` (`Balloon with {id} not found` on DELETE) |
| 404    | No balloons match the `color`/`shape` filter                             | `Balloons with … field/s not found`                                                        |
| 409    | Registering an email that already exists                                 | `User already exists`                                                                      |
| 500    | Unexpected server error                                                  | `Internal server error`                                                                    |

## Testing with Postman

### Before you start

**Hard-coded names and fields.** The database name comes from `MONGODB_DB_NAME`, but the collection names and the balloon document shape are fixed in the code, so the tests only work with them:

| What                   | Hard-coded value                                      | Where                                     |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------- |
| Bulk-operations data   | Collection `balloons`                                 | `src/repositories/balloons.repository.js` |
| Users                  | Collection `users`                                    | `src/repositories/users.repository.js`    |
| Sessions               | Collection `sessions` (created automatically)         | `app.js`                                  |
| Balloon fields         | `color`, `shape` (string),, `size` (positive integer) | `src/services/balloons.service.js`        |
| Allowed shapes         | `round`, `heart`, `star`                              | `src/services/balloons.service.js`        |
| Filter for bulk routes | `color` and `shape` query parameters, both required   | `src/controllers/balloons.controller.js`  |
| `updateMany` change    | Only `color` can be changed                           | `src/controllers/balloons.controller.js`  |
| Batch size             | 1–100 balloons per `POST`                             | `src/services/balloons.service.js`        |

You don't need to create the collections in Atlas: MongoDB creates `balloons` and `users` on the first insert. If you add balloons by hand in Atlas, use the same fields and shapes, and lowercase colors, otherwise the filters won't find them.

**Postman setup.**

1. Create an environment with the variable `baseUrl` = `http://localhost:3000`.
2. For JSON bodies choose **Body → raw → JSON**.
3. Postman keeps cookies per domain, so after **Login** the `sid` session cookie is sent automatically with every later request. The `/users` routes need it; `/balloons` doesn't.
4. `:userId` and `:balloonId` are MongoDB ids (24 hex characters). Copy them from earlier responses: `id` from **Register** or from the **POST /balloons** response.
5. The admin-only user routes need an account with `role: "admin"`. Register it, change `role` to `"admin"` in the `users` collection in Atlas, then log in again.

Run the tests in the order below: each block uses data created by the one before it.

### 1. Auth — `insertOne`

| #   | Request               | Method | URL                         | Body (raw JSON)                                                | Expected                                                                          |
| --- | --------------------- | ------ | --------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | Register              | POST   | `{{baseUrl}}/auth/register` | `{ "email": "student@mail.com", "password": "test-password" }` | `201` `{ "user": { "id", "email", "role": "user" } }` — a new document in `users` |
| 2   | Register again        | POST   | `{{baseUrl}}/auth/register` | same as #1                                                     | `409` `User already exists`                                                       |
| 3   | Register, empty body  | POST   | `{{baseUrl}}/auth/register` | `{}`                                                           | `400` `Email and password must be non-empty strings`                              |
| 4   | Login                 | POST   | `{{baseUrl}}/auth/login`    | same as #1                                                     | `200` `{ "message": "Login successful", "user": {...} }`, sets the `sid` cookie   |
| 5   | Login, wrong password | POST   | `{{baseUrl}}/auth/login`    | `{ "email": "student@mail.com", "password": "wrong" }`         | `401` `Invalid email or password`                                                 |

### 2. Users — `find`, `findOne` with projection

Logged in as any user (request #4).

| #   | Request           | Method | URL                                          | Body | Expected                                                            |
| --- | ----------------- | ------ | -------------------------------------------- | ---- | ------------------------------------------------------------------- |
| 1   | All users         | GET    | `{{baseUrl}}/users`                          | —    | `200` HTML list with each user's email and id; no password hashes   |
| 2   | One user          | GET    | `{{baseUrl}}/users/:userId`                  | —    | `200` HTML page for that user                                       |
| 3   | Unknown id        | GET    | `{{baseUrl}}/users/000000000000000000000000` | —    | `404` `User 000000000000000000000000 not found`                     |
| 4   | Without a session | GET    | `{{baseUrl}}/users`                          | —    | `401` `Unauthorized` (delete the `sid` cookie in **Cookies** first) |

### 3. Users — `findOneAndUpdate`, `findOneAndReplace`, `deleteOne`

Logged in as an **admin**. Use the id of a test user, not your admin account.

| #   | Request        | Method | URL                         | Body (raw JSON)                                                               | Expected                                                      |
| --- | -------------- | ------ | --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Update fields  | PATCH  | `{{baseUrl}}/users/:userId` | `{ "email": "student2@mail.com" }`                                            | `200` the updated user `{ "id", "email", "role" }`            |
| 2   | Replace user   | PUT    | `{{baseUrl}}/users/:userId` | `{ "email": "student@mail.com", "password": "new-password", "role": "user" }` | `200` the new user document; the password is stored as a hash |
| 3   | Delete user    | DELETE | `{{baseUrl}}/users/:userId` | —                                                                             | The user is removed from `users`                              |
| 4   | As a non-admin | PATCH  | `{{baseUrl}}/users/:userId` | `{ "email": "x@mail.com" }`                                                   | `403` `Access denied`                                         |

### 4. Balloons — `insertMany`

No login needed.

| #   | Request         | Method | URL                    | Body (raw JSON)                                                                                                                                          | Expected                                                                     |
| --- | --------------- | ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Create balloons | POST   | `{{baseUrl}}/balloons` | `[{ "color": "red", "shape": "heart", "size": 10 }, { "color": "red", "shape": "heart", "size": 8 }, { "color": "blue", "shape": "round", "size": 12 }]` | `201` array of 3 balloons, each with `id` and `createdAt`                    |
| 2   | Invalid shape   | POST   | `{{baseUrl}}/balloons` | `[{ "color": "red", "shape": "cube", "size": 1 }]`                                                                                                       | `400` `Item 0: shape must be one of round, heart, star`; nothing is inserted |
| 3   | Not an array    | POST   | `{{baseUrl}}/balloons` | `{ "color": "red", "shape": "heart", "size": 1 }`                                                                                                        | `400` `Body must be an array of 1-100 balloons`                              |

Copy the `id` of the blue balloon for the next block.

### 5. Balloons by id — `updateOne`, `replaceOne`, `deleteOne`

| #   | Request           | Method | URL                               | Body (raw JSON)                                    | Expected                                                            |
| --- | ----------------- | ------ | --------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Update fields     | PATCH  | `{{baseUrl}}/balloons/:balloonId` | `{ "size": 15 }`                                   | `200` `{ "matchedCount": 1, "modifiedCount": 1 }`                   |
| 2   | Same update again | PATCH  | `{{baseUrl}}/balloons/:balloonId` | `{ "size": 15 }`                                   | `200` `{ "matchedCount": 1, "modifiedCount": 0 }` — nothing changed |
| 3   | Replace balloon   | PUT    | `{{baseUrl}}/balloons/:balloonId` | `{ "color": "green", "shape": "star", "size": 9 }` | `200` `{ "matchedCount": 1, "modifiedCount": 1 }`                   |
| 4   | Delete balloon    | DELETE | `{{baseUrl}}/balloons/:balloonId` | —                                                  | `200` `{ "message": "1 balloon <id> successfully deleted" }`        |
| 5   | Delete it again   | DELETE | `{{baseUrl}}/balloons/:balloonId` | —                                                  | `404` `Balloon with <id> not found`                                 |

### 6. Balloons by filter — `updateMany`, `deleteMany`

Uses the two red hearts from block 4.

| #   | Request         | Method | URL                                           | Body (raw JSON)       | Expected                                                             |
| --- | --------------- | ------ | --------------------------------------------- | --------------------- | -------------------------------------------------------------------- |
| 1   | Recolor many    | PATCH  | `{{baseUrl}}/balloons?color=red&shape=heart`  | `{ "color": "pink" }` | `200` `{ "matched": 2, "modified": 2 }`                              |
| 2   | Nothing matches | PATCH  | `{{baseUrl}}/balloons?color=red&shape=heart`  | `{ "color": "pink" }` | `404` — the red hearts are pink now                                  |
| 3   | Missing filter  | PATCH  | `{{baseUrl}}/balloons?color=pink`             | `{ "color": "red" }`  | `400` `Query param "shape" is required`                              |
| 4   | Delete many     | DELETE | `{{baseUrl}}/balloons?color=pink&shape=heart` | —                     | `200` `{ "message": "2 document/s deleted" }`                        |
| 5   | No filter       | DELETE | `{{baseUrl}}/balloons`                        | —                     | `400` `Query param "color" is required`; the collection is untouched |

### 7. Logout

| #   | Request | Method | URL                       | Body | Expected                                                                      |
| --- | ------- | ------ | ------------------------- | ---- | ----------------------------------------------------------------------------- |
| 1   | Logout  | POST   | `{{baseUrl}}/auth/logout` | —    | `200` `{ "message": "Logout successful" }`; `/users` answers `401` afterwards |

There is no `npm test` script; the tables above are the manual test plan.

## Known limitations

See `ANALYSIS.md` for the current list of observations, open bugs, and improvement ideas.

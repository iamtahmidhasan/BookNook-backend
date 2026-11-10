# BookNook Backend

BookNook's backend is an Express API backed by MongoDB. It manages books, owners, borrowing quantities, returns, and JWT-protected operations.

## Features

- Express REST API.
- MongoDB collections:
  - `Books`
  - `borrows`
- CORS and JSON request parsing.
- Better Auth JWT verification through the JWKS endpoint.
- Public book listing endpoint.
- Protected book management and borrowing endpoints.
- Quantity-aware borrowing and returning.
- Owner-scoped book updates.
- Vercel serverless deployment configuration.
- Local Express server on port `5000`.

## API Endpoints

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health/welcome response |
| `GET` | `/books` | List books; supports `page` and `limit` query parameters |

### Protected

All protected requests require:

```http
Authorization: Bearer <better-auth-jwt>
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/book/:id` | Get a single book |
| `POST` | `/add` | Add a book |
| `PUT` | `/book/:id` | Update a book when `ownerEmail` matches |
| `DELETE` | `/book/:id` | Delete a book |
| `GET` | `/my-books/:email` | List books owned by an email |
| `POST` | `/borrows` | Borrow copies and decrease availability |
| `GET` | `/borrows/:email` | List a user's borrow records |
| `POST` | `/return` | Return copies and restore availability |

The current middleware applies JWT verification to every route registered after the public `/books` route.

## Request Examples

### Add a book

```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic novel.",
  "isbn": "9780743273565",
  "coverImage": "https://example.com/cover.jpg",
  "category": "Classic fiction",
  "language": "English",
  "publishedYear": 1925,
  "totalCopies": 5,
  "availableCopies": 5,
  "ownerName": "Reader",
  "ownerEmail": "reader@example.com"
}
```

### Borrow copies

```json
{
  "user": "Reader",
  "email": "reader@example.com",
  "bookId": "book-object-id",
  "quantity": 2
}
```

### Return copies

```json
{
  "user": "Reader",
  "email": "reader@example.com",
  "bookId": "book-object-id",
  "quantity": 1
}
```

Borrowing decreases `availableCopies`; returning increases it. Returning a quantity updates the borrow record and removes it when its quantity reaches zero.

## Getting Started

From the `backend` directory:

```bash
npm install
node index.js
```

The API runs at [http://localhost:5000](http://localhost:5000).

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=your-mongodb-connection-string
NEXT_PUBLIC_URL=http://localhost:3000
```

`NEXT_PUBLIC_URL` is used to locate the Better Auth JWKS endpoint:

```text
${NEXT_PUBLIC_URL}/api/auth/jwks
```

For production, set it to the deployed frontend URL.

## MongoDB

The API uses the `BookNook` database and these collections:

- `Books` for book records
- `borrows` for borrow records

The MongoDB connection string must include a database-compatible connection and allow the deployed backend to connect.

## Vercel Deployment

The backend includes [vercel.json](./vercel.json) for `@vercel/node`.

In Vercel:

1. Import the repository.
2. Set the project root directory to `backend`.
3. Add `DATABASE_URL`.
4. Add `NEXT_PUBLIC_URL` with the deployed frontend URL.
5. Deploy.

The Express app is exported for Vercel and listens on port `5000` for local development.

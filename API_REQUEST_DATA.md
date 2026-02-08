# API Request Body Data Examples

## Authentication Endpoints

### 1. Register
**POST** `/auth/register`

```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

### 2. Login
**POST** `/auth/login`

```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

---

## Blog Endpoints

### 3. Create Blog (Requires Authentication)
**POST** `/blogs`
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

```json
{
  "title": "Getting Started with NestJS",
  "content": "NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses modern JavaScript, is built with TypeScript and combines elements of OOP, FP, and FRP."
}
```

**More Examples:**

```json
{
  "title": "Understanding Prisma ORM",
  "content": "Prisma is a next-generation ORM that makes it easy to work with databases. It provides type-safety, auto-completion, and a powerful query engine."
}
```

```json
{
  "title": "Building REST APIs with JWT Authentication",
  "content": "JSON Web Tokens (JWT) are a compact, URL-safe means of representing claims to be transferred between two parties. In this post, we'll explore how to implement JWT authentication in a NestJS application."
}
```

### 4. Update Blog (Requires Authentication + Ownership)
**PATCH** `/blogs/:id`
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

```json
{
  "title": "Getting Started with NestJS - Updated",
  "content": "Updated content here..."
}
```

---

## Comment Endpoints

### 5. Create Comment (Requires Authentication)
**POST** `/comment`
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

```json
{
  "content": "Great article! This helped me understand the concepts better.",
  "blogId": 1
}
```

**More Examples:**

```json
{
  "content": "Thanks for sharing this. Very informative!",
  "blogId": 1
}
```

```json
{
  "content": "I have a question about this topic. Could you elaborate on the middleware part?",
  "blogId": 2
}
```

```json
{
  "content": "This is exactly what I was looking for. Bookmarked for future reference!",
  "blogId": 1
}
```

### 6. Update Comment (Requires Authentication + Ownership)
**PATCH** `/comment/:id`
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

```json
{
  "content": "Great article! This helped me understand the concepts better. Edit: I implemented this in my project and it works perfectly!"
}
```

---

## Complete Example Flow

### Step 1: Register a new user
```bash
POST /auth/register
Body:
{
  "username": "alice_dev",
  "password": "password123"
}

Response: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (JWT Token)
```

### Step 2: Create a blog post
```bash
POST /blogs
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Body:
{
  "title": "My First Blog Post",
  "content": "This is my first blog post about web development."
}

Response:
{
  "id": 1,
  "title": "My First Blog Post",
  "content": "This is my first blog post about web development.",
  "published": false,
  "authorId": 1,
  "createdAt": "2026-02-08T10:00:00.000Z",
  "updatedAt": "2026-02-08T10:00:00.000Z",
  "author": {
    "id": 1,
    "username": "alice_dev",
    "email": null
  }
}
```

### Step 3: Register another user
```bash
POST /auth/register
Body:
{
  "username": "bob_reader",
  "password": "password456"
}

Response: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (JWT Token for bob_reader)
```

### Step 4: Bob comments on Alice's blog
```bash
POST /comment
Headers: Authorization: Bearer (Bob's JWT Token)
Body:
{
  "content": "Nice post, Alice! Looking forward to more content.",
  "blogId": 1
}

Response:
{
  "id": 1,
  "content": "Nice post, Alice! Looking forward to more content.",
  "userId": 2,
  "blogId": 1,
  "createdAt": "2026-02-08T10:05:00.000Z",
  "updatedAt": "2026-02-08T10:05:00.000Z",
  "user": {
    "id": 2,
    "username": "bob_reader"
  },
  "blog": {
    "id": 1,
    "title": "My First Blog Post"
  }
}
```

### Step 5: Bob updates his comment
```bash
PATCH /comment/1
Headers: Authorization: Bearer (Bob's JWT Token)
Body:
{
  "content": "Nice post, Alice! Looking forward to more content. Update: Just tried this approach and it works!"
}

Response:
{
  "id": 1,
  "content": "Nice post, Alice! Looking forward to more content. Update: Just tried this approach and it works!",
  "userId": 2,
  "blogId": 1,
  "createdAt": "2026-02-08T10:05:00.000Z",
  "updatedAt": "2026-02-08T10:10:00.000Z",
  "user": {
    "id": 2,
    "username": "bob_reader"
  }
}
```

### Step 6: Alice (blog owner) deletes Bob's comment
```bash
DELETE /comment/1
Headers: Authorization: Bearer (Alice's JWT Token)

Response:
{
  "message": "Comment deleted successfully"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'
```

### Create Blog
```bash
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"My Blog Title","content":"Blog content here"}'
```

### Create Comment
```bash
curl -X POST http://localhost:3000/comment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content":"Great post!","blogId":1}'
```

---

## Testing with Postman

1. **Register User**
   - Method: POST
   - URL: `http://localhost:3000/auth/register`
   - Body (JSON):
     ```json
     {
       "username": "your_username",
       "password": "your_password"
     }
     ```
   - Copy the JWT token from response

2. **Create Blog**
   - Method: POST
   - URL: `http://localhost:3000/blogs`
   - Headers: 
     - Key: `Authorization`
     - Value: `Bearer YOUR_JWT_TOKEN`
   - Body (JSON):
     ```json
     {
       "title": "Your Blog Title",
       "content": "Your blog content"
     }
     ```

3. **Create Comment**
   - Method: POST
   - URL: `http://localhost:3000/comment`
   - Headers: 
     - Key: `Authorization`
     - Value: `Bearer YOUR_JWT_TOKEN`
   - Body (JSON):
     ```json
     {
       "content": "Your comment text",
       "blogId": 1
     }
     ```

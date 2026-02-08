# API Testing Guide

## Base URL
```
http://localhost:3000
```

## 1. Register User 1 (Blog Owner)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john_blogger\",\"password\":\"password123\"}"
```
**Save the returned JWT token as USER1_TOKEN**

## 2. Register User 2 (Commenter)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"jane_commenter\",\"password\":\"password456\"}"
```
**Save the returned JWT token as USER2_TOKEN**

## 3. User 1 Creates a Blog Post
```bash
curl -X POST http://localhost:3000/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER1_TOKEN" \
  -d "{\"title\":\"My First Blog Post\",\"content\":\"This is an amazing blog post about NestJS and Prisma.\"}"
```
**Save the returned blog ID as BLOG_ID**

## 4. Get All Blogs (Public - No Auth Required)
```bash
curl http://localhost:3000/blog/public
```

## 5. Get Specific Blog (Public)
```bash
curl http://localhost:3000/blog/public/BLOG_ID
```

## 6. User 2 Creates a Comment
```bash
curl -X POST http://localhost:3000/comment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER2_TOKEN" \
  -d "{\"content\":\"Great post! Very informative.\",\"blogId\":BLOG_ID}"
```
**Save the returned comment ID as COMMENT1_ID**

## 7. User 1 Creates a Comment
```bash
curl -X POST http://localhost:3000/comment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER1_TOKEN" \
  -d "{\"content\":\"Thanks for reading!\",\"blogId\":BLOG_ID}"
```

## 8. Get All Comments for Blog (Public)
```bash
curl http://localhost:3000/comment/blog/BLOG_ID
```

## 9. User 2 Updates Their Comment
```bash
curl -X PATCH http://localhost:3000/comment/COMMENT1_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER2_TOKEN" \
  -d "{\"content\":\"Great post! Updated comment.\"}"
```

## 10. User 2 Tries to Update User 1's Comment (Should Fail - 403)
```bash
curl -X PATCH http://localhost:3000/comment/COMMENT2_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER2_TOKEN" \
  -d "{\"content\":\"Trying to update someone else's comment\"}"
```

## 11. User 1 (Blog Owner) Deletes User 2's Comment
```bash
curl -X DELETE http://localhost:3000/comment/COMMENT1_ID \
  -H "Authorization: Bearer USER1_TOKEN"
```

## 12. User 1 Deletes Their Own Comment
```bash
curl -X DELETE http://localhost:3000/comment/COMMENT2_ID \
  -H "Authorization: Bearer USER1_TOKEN"
```

## 13. Get My Blogs (Authenticated)
```bash
curl http://localhost:3000/blog/my-blogs \
  -H "Authorization: Bearer USER1_TOKEN"
```

## Running the Automated Test
```bash
node test-api.js
```

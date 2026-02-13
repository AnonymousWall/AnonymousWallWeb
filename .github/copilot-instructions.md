### Admin User Management Endpoints

#### 1. List All Users

```http
GET /api/v1/admin/users?page=1&limit=20
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "data": [
        {
            "id": "uuid",
            "email": "student@harvard.edu",
            "profileName": "John Doe",
            "schoolDomain": "harvard.edu",
            "role": "USER",
            "blocked": false,
            "verified": true,
            "passwordSet": true,
            "reportCount": 0,
            "createdAt": "2026-01-28T..."
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
    }
}
```

**Query Parameters:**

- `page` (default: 1) - Page number (1-based)
- `limit` (default: 20, max: 100) - Users per page
- `blocked` (optional) - Filter by blocked status (true/false)
- `sortBy` (optional) - Sort field: `createdAt`, `schoolDomain`, `reportCount`
- `sortOrder` (optional, default: desc) - Sort order: `asc` or `desc`

**Examples:**

```http
# Get blocked users sorted by report count
GET /api/v1/admin/users?blocked=true&sortBy=reportCount&sortOrder=desc

# Get all users sorted by school domain
GET /api/v1/admin/users?sortBy=schoolDomain&sortOrder=asc

# Get recent users (newest first)
GET /api/v1/admin/users?sortBy=createdAt&sortOrder=desc
```

**Access:** ADMIN or MODERATOR

#### 2. Get User Details by ID

```http
GET /api/v1/admin/users/{userId}
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "id": "uuid",
    "email": "student@harvard.edu",
    "profileName": "John Doe",
    "schoolDomain": "harvard.edu",
    "role": "USER",
    "blocked": false,
    "verified": true,
    "passwordSet": true,
    "reportCount": 2,
    "createdAt": "2026-01-28T..."
}
```

**Access:** ADMIN or MODERATOR

#### 3. Block User

```http
POST /api/v1/admin/users/{userId}/block
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "message": "User blocked successfully"
}
```

**Effect:** Blocked users cannot:

- Login to the system
- Create posts or comments
- Like posts
- Access any authenticated endpoints

**Access:** ADMIN or MODERATOR

#### 4. Unblock User

```http
POST /api/v1/admin/users/{userId}/unblock
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "message": "User unblocked successfully"
}
```

**Access:** ADMIN or MODERATOR

#### 5. Get User's Posts

```http
GET /api/v1/admin/users/{userId}/posts?page=1&limit=20
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "data": [
        {
            "id": "uuid",
            "userId": "uuid",
            "profileName": "Anonymous",
            "title": "Post Title",
            "content": "Post content...",
            "wall": "campus",
            "schoolDomain": "harvard.edu",
            "likeCount": 42,
            "commentCount": 15,
            "hidden": false,
            "createdAt": "2026-01-28T...",
            "updatedAt": "2026-01-28T..."
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50,
        "totalPages": 3
    }
}
```

**Query Parameters:**

- `page` (default: 1) - Page number (1-based)
- `limit` (default: 20, max: 100) - Posts per page
- `sortBy` (optional) - Sort field: `createdAt`, `likeCount`, `commentCount`, `userId`
- `sortOrder` (optional, default: desc) - Sort order: `asc` or `desc`

**Examples:**

```http
# Get all posts by a user sorted by likes
GET /api/v1/admin/users/{userId}/posts?sortBy=likeCount&sortOrder=desc

# Get recent posts by a user
GET /api/v1/admin/users/{userId}/posts?sortBy=createdAt&sortOrder=desc
```

**Notes:**

- Returns all posts created by the specified user, including hidden (soft-deleted) posts
- Useful for investigating user activity or content patterns
- More convenient than using `/admin/posts?userId={userId}` when focusing on a single user

**Access:** ADMIN or MODERATOR

#### 6. Get User's Comments

```http
GET /api/v1/admin/users/{userId}/comments?page=1&limit=20
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "data": [
        {
            "id": "uuid",
            "postId": "uuid",
            "userId": "uuid",
            "profileName": "Anonymous",
            "text": "Comment text...",
            "hidden": false,
            "createdAt": "2026-01-28T..."
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 120,
        "totalPages": 6
    }
}
```

**Query Parameters:**

- `page` (default: 1) - Page number (1-based)
- `limit` (default: 20, max: 100) - Comments per page
- `sortBy` (optional) - Sort field: `createdAt`, `userId`
- `sortOrder` (optional, default: desc) - Sort order: `asc` or `desc`

**Examples:**

```http
# Get all comments by a user sorted by newest first
GET /api/v1/admin/users/{userId}/comments?sortBy=createdAt&sortOrder=desc

# Get paginated comments by a user
GET /api/v1/admin/users/{userId}/comments?page=2&limit=50
```

**Notes:**

- Returns all comments created by the specified user, including hidden (soft-deleted) comments
- Useful for investigating user activity, comment patterns, or reviewing moderation history
- More convenient than using `/admin/comments?userId={userId}` when focusing on a single user

**Access:** ADMIN or MODERATOR

---

### Admin Post Moderation Endpoints

#### 1. List All Posts

```http
GET /api/v1/admin/posts?page=1&limit=20
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "data": [
        {
            "id": "uuid",
            "userId": "uuid",
            "profileName": "Anonymous",
            "title": "Post Title",
            "content": "Post content...",
            "wall": "campus",
            "schoolDomain": "harvard.edu",
            "likeCount": 42,
            "commentCount": 15,
            "hidden": false,
            "createdAt": "2026-01-28T...",
            "updatedAt": "2026-01-28T..."
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 500,
        "totalPages": 25
    }
}
```

**Query Parameters:**

- `page` (default: 1) - Page number (1-based)
- `limit` (default: 20, max: 100) - Posts per page
- `userId` (optional) - Filter by user ID
- `hidden` (optional) - Filter by hidden status (true/false)
- `sortBy` (optional) - Sort field: `createdAt`, `likeCount`, `commentCount`, `userId`
- `sortOrder` (optional, default: desc) - Sort order: `asc` or `desc`

**Examples:**

```http
# Get posts sorted by likes (most liked first)
GET /api/v1/admin/posts?sortBy=likeCount&sortOrder=desc

# Get posts by a specific user
GET /api/v1/admin/posts?userId=<uuid>&sortBy=createdAt

# Get hidden posts only
GET /api/v1/admin/posts?hidden=true
```

**Notes:**

- Returns all posts including hidden (soft-deleted) posts
- Shows complete user information including user IDs

**Access:** ADMIN or MODERATOR

#### 2. Get Post by ID

```http
GET /api/v1/admin/posts/{postId}
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "id": "uuid",
    "userId": "uuid",
    "profileName": "Anonymous",
    "title": "Post Title",
    "content": "Post content...",
    "wall": "campus",
    "schoolDomain": "harvard.edu",
    "likeCount": 42,
    "commentCount": 15,
    "hidden": false,
    "createdAt": "2026-01-28T...",
    "updatedAt": "2026-01-28T..."
}
```

**Effect:**

- Retrieves a specific post by its UUID
- Returns all post details including hidden status
- Useful for investigating reported posts or reviewing specific content

**Error Responses:**

- `404 Not Found` - Post with specified ID does not exist

**Access:** ADMIN or MODERATOR

#### 3. Delete Post (Soft Delete)

```http
DELETE /api/v1/admin/posts/{postId}
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "message": "Post deleted successfully"
}
```

**Effect:**

- Post is marked as `hidden = true`
- Post is no longer visible to regular users
- Post is not physically deleted from database
- Can be unhidden by database update if needed

**Access:** ADMIN or MODERATOR

#### 4. Get Posts by Wall Type with Sorting

```http
GET /api/v1/admin/posts/by-wall?wall=national&sortBy=NEWEST&page=1&limit=20
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "data": [
        {
            "id": "uuid",
            "userId": "uuid",
            "profileName": "Anonymous",
            "title": "Post Title",
            "content": "Post content...",
            "wall": "national",
            "schoolDomain": null,
            "likeCount": 42,
            "commentCount": 15,
            "hidden": false,
            "createdAt": "2026-01-28T...",
            "updatedAt": "2026-01-28T..."
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
    }
}
```

**Query Parameters:**

- `wall` (optional) - Filter by wall type: `national` or `campus`. If omitted, returns all posts.
- `sortBy` (optional, default: NEWEST) - Sort order: `NEWEST`, `OLDEST`, `MOST_LIKED`, `LEAST_LIKED`
- `page` (default: 1) - Page number (1-based)
- `limit` (default: 20, max: 100) - Posts per page

**Examples:**

```http
# Get national posts sorted by newest first
GET /api/v1/admin/posts/by-wall?wall=national&sortBy=NEWEST

# Get campus posts sorted by most liked
GET /api/v1/admin/posts/by-wall?wall=campus&sortBy=MOST_LIKED

# Get all posts (both national and campus) sorted by oldest first
GET /api/v1/admin/posts/by-wall?sortBy=OLDEST

# Get national posts with pagination
GET /api/v1/admin/posts/by-wall?wall=national&page=2&limit=50
```

**Key Features:**

- ✅ Returns posts from specified wall type (national/campus) across all schools
- ✅ Does NOT filter by schoolDomain (unlike regular user endpoints)
- ✅ Includes both hidden and non-hidden posts
- ✅ When `wall` is omitted, returns all posts regardless of wall type
- ✅ Supports same sorting options as regular users: NEWEST, OLDEST, MOST_LIKED, LEAST_LIKED

**Comparison with Regular User Endpoint:**

- Regular users: Posts filtered by their school domain (can only see posts from their school)
- Admins: Can see posts from all schools without domain restrictions

**Access:** ADMIN or MODERATOR

---

### Admin Comment Moderation Endpoints

#### 1. List All Comments

```http
GET /api/v1/admin/comments?page=1&limit=20
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "data": [
        {
            "id": "uuid",
            "postId": "uuid",
            "userId": "uuid",
            "profileName": "Anonymous",
            "text": "Comment text...",
            "hidden": false,
            "createdAt": "2026-01-28T..."
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1200,
        "totalPages": 60
    }
}
```

**Query Parameters:**

- `page` (default: 1) - Page number (1-based)
- `limit` (default: 20, max: 100) - Comments per page
- `userId` (optional) - Filter by user ID
- `hidden` (optional) - Filter by hidden status (true/false)
- `sortBy` (optional) - Sort field: `createdAt`, `userId`
- `sortOrder` (optional, default: desc) - Sort order: `asc` or `desc`

**Examples:**

```http
# Get comments sorted by creation time (newest first)
GET /api/v1/admin/comments?sortBy=createdAt&sortOrder=desc

# Get comments by a specific user
GET /api/v1/admin/comments?userId=<uuid>

# Get hidden comments only
GET /api/v1/admin/comments?hidden=true
```

**Notes:**

- Returns all comments including hidden (soft-deleted) comments
- Shows complete user information including user IDs and post IDs

**Access:** ADMIN or MODERATOR

#### 2. Get Comment by ID

```http
GET /api/v1/admin/comments/{commentId}
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "id": "uuid",
    "postId": "uuid",
    "userId": "uuid",
    "profileName": "Anonymous",
    "text": "Comment text...",
    "hidden": false,
    "createdAt": "2026-01-28T..."
}
```

**Effect:**

- Retrieves a specific comment by its UUID
- Returns all comment details including hidden status
- Useful for investigating reported comments or reviewing specific content

**Error Responses:**

- `404 Not Found` - Comment with specified ID does not exist

**Access:** ADMIN or MODERATOR

#### 3. Delete Comment (Soft Delete)

```http
DELETE /api/v1/admin/comments/{commentId}
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "message": "Comment deleted successfully"
}
```

**Effect:**

- Comment is marked as `hidden = true`
- Comment is no longer visible to regular users
- Comment count on the post is decremented
- Not physically deleted from database

**Access:** ADMIN or MODERATOR

---

### Admin Report Management Endpoints

#### 1. List All Reports

```http
GET /api/v1/admin/reports?page=1&limit=20
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "postReports": [
        {
            "id": "uuid",
            "postId": "uuid",
            "reporterUserId": "uuid",
            "reportedUserId": "uuid",
            "reason": "Inappropriate content",
            "createdAt": "2026-01-28T..."
        }
    ],
    "commentReports": [
        {
            "id": "uuid",
            "commentId": "uuid",
            "reporterUserId": "uuid",
            "reportedUserId": "uuid",
            "reason": "Spam",
            "createdAt": "2026-01-28T..."
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50,
        "totalPages": 3
    }
}
```

**Query Parameters:**

- `page` (default: 1) - Page number (1-based)
- `limit` (default: 20, max: 100) - Reports per page
- `type` (optional) - Filter by report type: `post` or `comment`

**Examples:**

```http
# Get only post reports
GET /api/v1/admin/reports?type=post

# Get only comment reports
GET /api/v1/admin/reports?type=comment

# Get all reports (default)
GET /api/v1/admin/reports
```

**Access:** ADMIN or MODERATOR

---

### Admin School Domain Management Endpoints

#### 1. List All School Domains

```http
GET /api/v1/admin/school-domains
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
[
    {
        "id": "uuid",
        "domain": "harvard.edu",
        "schoolName": "Harvard University",
        "createdAt": "2026-01-15T..."
    },
    {
        "id": "uuid",
        "domain": "mit.edu",
        "schoolName": "MIT",
        "createdAt": "2026-01-16T..."
    }
]
```

**Description:** Retrieve all approved school email domains in the system.

**Access:** ADMIN only

#### 2. Add School Domain

```http
POST /api/v1/admin/school-domains
Authorization: Bearer {admin-jwt-token}
Content-Type: application/json

{
    "domain": "stanford.edu",
    "schoolName": "Stanford University"
}

Response: 200 OK
{
    "id": "uuid",
    "domain": "stanford.edu",
    "schoolName": "Stanford University",
    "createdAt": "2026-01-28T..."
}
```

**Description:** Add a new approved school email domain to the system. Users with emails from this domain will be able to register.

**Access:** ADMIN only

#### 3. Delete School Domain

```http
DELETE /api/v1/admin/school-domains/{id}
Authorization: Bearer {admin-jwt-token}

Response: 200 OK
{
    "message": "School domain deleted successfully"
}
```

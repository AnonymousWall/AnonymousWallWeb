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

**Description:** Remove a school domain from the approved list. This prevents new registrations from that domain but doesn't affect existing users.

**Access:** ADMIN only

**Important Notes:**

- Only ADMIN role can manage school domains (not MODERATOR)
- Deleting a domain doesn't delete existing users from that domain
- Domain validation ensures proper email domain format (e.g., "example.edu")
- Duplicate domains are prevented

---

### Admin API Security

**Role-Based Access Control (RBAC):**

- All admin endpoints require `ADMIN` or `MODERATOR` role
- Role is stored in the JWT token as an authority
- Regular users (`USER` role) receive `403 Forbidden`
- Unauthenticated requests receive `401 Unauthorized`

**JWT Token with Role:**

```json
{
  "sub": "user-id",
  "roles": ["ADMIN"],
  "email": "admin@example.com",
  "verified": true,
  "passwordSet": true,
  "exp": 1706486400
}
```

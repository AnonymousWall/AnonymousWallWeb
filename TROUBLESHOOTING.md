# Troubleshooting Guide

## Login Issues

### Backend Shows Success but Frontend Shows Failure

If you see successful authentication in the backend logs but the frontend shows an error, follow these steps:

#### 1. Check for `.env` file

The Vite proxy only works with **relative URLs**. If you have a `.env` file with an absolute URL, it will bypass the proxy:

```bash
# Check if .env exists
ls -la .env

# If it exists, remove it or comment out VITE_API_BASE_URL
rm .env
# OR edit .env and comment out:
# VITE_API_BASE_URL=http://localhost:8080/api/v1
```

#### 2. Restart the development server

After removing the `.env` file:

```bash
npm run dev
```

#### 3. Verify proxy is working

Open browser DevTools (F12) → Network tab → Try logging in

**✅ Correct (using proxy):**

- Request URL: `http://localhost:5173/api/v1/auth/login/password`

**❌ Incorrect (bypassing proxy):**

- Request URL: `http://localhost:8080/api/v1/auth/login/password`
- This will cause CORS errors

#### 4. Check backend response format

The backend must return a response matching this structure:

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "profileName": "string",
    "schoolDomain": "string",
    "blocked": boolean,
    "verified": boolean,
    "passwordSet": boolean,
    "reportCount": number,
    "createdAt": "string"
  },
  "accessToken": "string (JWT token containing user role)"
}
```

**Note:** The user's role is extracted from the JWT token, not from the response body. The JWT payload should include a `role` field with one of: `ADMIN`, `MODERATOR`, or `USER`.

#### 5. Check browser console

Open browser DevTools (F12) → Console tab

Look for errors related to:

- Response parsing errors
- Missing fields in response
- Role verification errors (role is extracted from JWT token and must be ADMIN or MODERATOR)
- JWT decoding errors

### Common Error Messages

#### "Unauthorized: Admin or Moderator role required"

**Cause:** The logged-in user doesn't have ADMIN or MODERATOR role in their JWT token.

**Solution:** The backend must include the correct role in the JWT token payload. Verify the JWT token contains a `role` field with value `ADMIN` or `MODERATOR`.

You can decode the JWT token at [jwt.io](https://jwt.io) to verify its contents.

#### "Unable to extract role from token"

**Cause:** The JWT token doesn't contain a `role` field in its payload.

**Solution:** Ensure the backend includes the user's role in the JWT token when generating it:

```javascript
// Example JWT payload (backend)
{
  "sub": "user-id",
  "email": "admin@nyu.edu",
  "role": "ADMIN",  // Must be present
  "exp": 1234567890,
  "iat": 1234567890
}
```

If you need to update a user's role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

#### "Network error. Please check your connection."

**Cause:** Backend is not running or not accessible.

**Solution:**

1. Verify backend is running: `curl http://localhost:8080/api/v1/health` (or similar endpoint)
2. Check backend logs for startup errors
3. Ensure backend is running on port 8080

#### "Cannot read properties of undefined"

**Cause:** Backend response structure doesn't match expected format.

**Solution:**

1. Check backend response in Network tab
2. Verify it includes both `user` and `accessToken` fields
3. Ensure all required user fields are present

## CORS Errors

### "No 'Access-Control-Allow-Origin' header"

**Cause:** You're using an absolute URL that bypasses the Vite proxy.

**Solution:**

1. Remove or comment out `VITE_API_BASE_URL` in `.env` file
2. Restart dev server with `npm run dev`
3. Verify requests go to `/api/v1/...` not `http://localhost:8080/api/v1/...`

## Development Setup Checklist

Before starting development:

- [ ] Backend is running on `http://localhost:8080`
- [ ] No `.env` file exists (or `VITE_API_BASE_URL` is commented out)
- [ ] Dev server started with `npm run dev`
- [ ] Browser opens to `http://localhost:5173`
- [ ] User account has ADMIN or MODERATOR role

## Need More Help?

If you're still experiencing issues:

1. Share the complete error message from browser console
2. Share the request/response details from Network tab
3. Verify backend response structure matches expected format
4. Check that Vite proxy configuration is correct in `vite.config.ts`

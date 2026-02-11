# Deployment Guide

This guide covers deploying the Anonymous Wall Admin Dashboard to various hosting platforms.

## Prerequisites

- Node.js 18+ installed
- Access to the Anonymous Wall backend API
- Admin/Moderator account credentials

## Environment Configuration

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Configure the API endpoint:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

For local development:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

The built files will be in the `dist/` directory.

## Deployment Options

### 1. Netlify

**Option A: Via Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Option B: Via Git Integration**
1. Push your code to GitHub
2. Connect repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard

### 2. Vercel

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option B: Via Git Integration**
1. Push your code to GitHub
2. Import project to Vercel
3. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel dashboard

### 3. OCI Object Storage + CDN

```bash
# Build the application
npm run build

# Upload to OCI Object Storage
oci os object bulk-upload --bucket-name your-bucket-name --src-dir dist/ --overwrite

# Invalidate CDN cache (if using OCI CDN)
oci edge redirect-waas purge-cache --waas-policy-id YOUR_POLICY_ID
```

**Object Storage Configuration:**
- Create a bucket in your OCI compartment
- Enable public access to the bucket
- Set index.html as the default object
- Configure bucket visibility to public

**OCI CDN Configuration:**
- Create a CDN distribution pointing to Object Storage bucket
- Configure origin settings with your bucket URL
- Set custom error responses (404 → /index.html)
- Add SSL certificate via OCI Certificates service

### 4. GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/AnonymousWallWeb"
}
```

3. Deploy:
```bash
npm run deploy
```

### 5. Docker

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Build and run:**
```bash
# Build image
docker build -t anonymous-wall-admin .

# Run container
docker run -p 8080:80 anonymous-wall-admin
```

### 6. Traditional Web Server (Apache/Nginx)

**Build the application:**
```bash
npm run build
```

**Copy dist/ contents to web server:**
```bash
# For Apache
sudo cp -r dist/* /var/www/html/admin/

# For Nginx
sudo cp -r dist/* /usr/share/nginx/html/admin/
```

**Apache Configuration (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /admin/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /admin/index.html [L]
</IfModule>
```

**Nginx Configuration:**
```nginx
location /admin {
    alias /usr/share/nginx/html/admin;
    try_files $uri $uri/ /admin/index.html;
    index index.html;
}
```

## Environment Variables

The following environment variables can be configured:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes | `http://localhost:8080/api/v1` |

## Post-Deployment

### 1. Verify Deployment

Access your deployed application and verify:
- Login page loads correctly
- Can authenticate with admin credentials
- All dashboard features work
- API calls succeed

### 2. Configure CORS

Ensure your backend API allows requests from your frontend domain:

```java
// Example backend CORS configuration
@Factory
public CorsFilter corsFilter() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOrigin("https://your-admin-domain.com");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    configuration.setAllowCredentials(true);
    return new CorsFilter(configuration);
}
```

### 3. Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Backend API accessible
- [ ] Admin accounts created
- [ ] Error logging configured
- [ ] Performance monitoring setup

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### 404 Errors After Deployment
- Ensure your web server is configured for SPA routing
- Check that all routes redirect to index.html

### API Connection Issues
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration on backend
- Verify API is accessible from your domain

### Authentication Issues
- Ensure backend API is running
- Verify admin user has correct role (ADMIN or MODERATOR)
- Check JWT token expiration settings

## Monitoring

### Application Logs
Monitor application errors in production:

```javascript
// Add to src/main.tsx
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to your logging service
});
```

### Performance Monitoring
Consider integrating:
- Google Analytics
- Sentry for error tracking
- LogRocket for session replay
- New Relic for performance monitoring

## Continuous Deployment

### GitHub Actions Example

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
        run: npm run build
        
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=dist
```

## Rollback Strategy

### Quick Rollback
1. Keep previous build artifacts
2. Revert to previous Git commit
3. Redeploy previous version

### Automated Rollback
Use your hosting platform's rollback features:
- Netlify: Deploy history
- Vercel: Deployments page
- OCI: Resource Manager rollback

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Review API connectivity
4. Consult hosting platform documentation
5. Open issue on GitHub

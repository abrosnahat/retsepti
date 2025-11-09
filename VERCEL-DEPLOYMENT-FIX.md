# Vercel Deployment Fix Guide

## Issue

The application was crashing on Vercel with a 500 error due to unhandled database connection errors.

## Changes Made

### 1. Added Error Handling to All Database Queries

All Prisma queries now have proper try-catch blocks to prevent unhandled exceptions:

- `src/app/page.tsx` - getLatestRecipes() and getFeaturedRecipes()
- `src/app/recipes/page.tsx` - getAllRecipes()
- `src/app/categories/page.tsx` - getCategories()
- `src/app/recipes/[slug]/page.tsx` - getRecipe()
- `src/app/categories/[slug]/page.tsx` - getCategory()

### 2. Enhanced Prisma Client Configuration

Updated `src/lib/prisma.ts` to include logging for better debugging in production.

## Required Actions on Vercel

### 1. Verify Environment Variables

Go to your Vercel project settings and ensure these environment variables are set:

#### Required Variables:

```bash
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://retsepti.vercel.app
NEXT_PUBLIC_BASE_URL=https://retsepti.vercel.app
```

#### Optional (if using Cloudinary):

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Verify DATABASE_URL Format

Your DATABASE_URL should be a PostgreSQL connection string in this format:

```
postgresql://username:password@host:port/database?schema=public
```

For Neon (which you're using based on .env.example):

```
postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### 3. Check Prisma Configuration

Make sure your `prisma/schema.prisma` has the correct provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Deployment Steps

1. **Push the changes to your repository:**

   ```bash
   git add .
   git commit -m "Fix: Add error handling for database queries"
   git push origin main
   ```

2. **Vercel will automatically redeploy**. If not, trigger a manual deployment.

3. **Check the deployment logs** in Vercel dashboard for any errors.

### 5. Database Migration

If you haven't run migrations on your production database:

```bash
# Set your production DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Or push schema directly
npx prisma db push
```

### 6. Verify the Fix

After deployment:

1. Visit https://retsepti.vercel.app
2. Check browser console for errors
3. Check Vercel function logs for any database connection errors

## Common Issues and Solutions

### Issue: Database Connection Timeout

**Solution**: Check if your database (Neon) is active and accessible. Neon free tier may sleep after inactivity.

### Issue: Environment Variables Not Working

**Solution**:

- Ensure variables are set in Vercel dashboard under Settings > Environment Variables
- Make sure they're enabled for Production environment
- Redeploy after adding/changing variables

### Issue: Prisma Client Not Generated

**Solution**: The build script includes `prisma generate`, but if issues persist:

1. Add `postinstall` script to package.json (already added)
2. Verify Prisma version compatibility

### Issue: Still Getting 500 Errors

**Solution**:

1. Check Vercel function logs for specific error messages
2. Verify DATABASE_URL is correctly set
3. Test database connection from local environment
4. Check if database has proper tables (run migrations)

## Testing Locally

Before deploying, test locally with production-like settings:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Build and start
npm run build
npm start
```

## Monitoring

After deployment, monitor:

1. Vercel function logs
2. Database connection metrics
3. Application error rates

## Next Steps

1. Consider adding a health check endpoint
2. Implement proper error monitoring (e.g., Sentry)
3. Add rate limiting for database queries
4. Consider connection pooling for production

## Support

If issues persist:

1. Check Vercel documentation: https://vercel.com/docs
2. Check Neon documentation: https://neon.tech/docs
3. Review Prisma deployment guide: https://www.prisma.io/docs/guides/deployment

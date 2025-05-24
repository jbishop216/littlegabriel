# Deployment Guide for LittleGabriel

This document provides instructions for building and deploying the LittleGabriel application to production.

## Prerequisites

- Node.js 18.x or higher
- Access to your production environment (server, Vercel, Netlify, etc.)
- Access to your database (Neon, etc.)
- OpenAI API key

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

1. Updated the `.env.production` file with:
   - Your actual production domain in `NEXTAUTH_URL`
   - Your production database connection string in `DATABASE_URL`
   - Your OpenAI API key
   - Any other required API keys

2. Tested the application locally in production mode:
   ```bash
   npm run build:prod
   npm run start:prod
   ```

## Deployment Steps

### Option 1: Standard Server Deployment

1. Build the application for production:
   ```bash
   npm run build:prod
   ```

2. The build will be in the `.next` directory. For a standalone deployment, it's in `.next/standalone`.

3. Start the production server:
   ```bash
   npm run start:prod
   ```

### Option 2: Vercel Deployment

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 3: Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t littlegabriel .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 --env-file .env.production littlegabriel
   ```

## Post-Deployment Verification

After deployment, verify:

1. The application loads properly
2. Authentication works correctly
3. The chat functionality is working
4. The Bible study features are accessible
5. Admin features are only available to admins

## Troubleshooting

If you encounter issues after deployment:

1. Check the server logs for errors
2. Verify all environment variables are set correctly
3. Make sure the database is accessible
4. Ensure the OpenAI API key is valid
5. Check that NextAuth.js is configured with the correct production URL

## Maintenance

- Regularly backup your database
- Keep your dependencies up to date
- Monitor your OpenAI API usage
- Check for security updates

For further assistance, contact the development team.

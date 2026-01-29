# Deployment Guide

## Frontend Deployment (Vercel)

The frontend is a Next.js application that can be easily deployed on Vercel.

### Prerequisites
- A [Vercel](https://vercel.com) account.
- The project pushed to a Git repository (GitHub/GitLab/Bitbucket).

### Steps
1. **Import Project**:
   - Go to your Vercel Dashboard.
   - Click **"Add New..."** -> **"Project"**.
   - Select the `connect-hub` repository.

2. **Configure Project**:
   - **Framework Preset**: Next.js (should be auto-detected).
   - **Root Directory**: `./` (default).

3. **Environment Variables**:
   - Copy the values from your local `.env.local` to the Vercel Environment Variables section.
   - **Required Variables**:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...
     NEXT_PUBLIC_MEILISEARCH_HOST=... (See Backend Deployment below)
     MEILISEARCH_MASTER_KEY=...
     WEBHOOK_SECRET=...
     NEXT_PUBLIC_APP_URL=https://your-deployment-url.vercel.app
     ```

4. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will build and deploy your site.

---

## Backend Deployment (Meilisearch on Render)

Since we are using Supabase for the primary database and Auth, the only "self-hosted" backend component we need is Meilisearch for search functionality. We can deploy this on [Render](https://render.com).

### Prerequisites
- A [Render](https://render.com) account.

### Steps

1. **New Web Service**:
   - Go to the Render Dashboard.
   - Click **"New +"** -> **"Web Service"**.

2. **Source**:
   - You can deploy directly from a public Docker image.
   - Select **"Deploy an existing image from a registry"**.
   - Image URL: `getmeili/meilisearch:v1.10` (Check for latest stable version).

3. **Configuration**:
   - **Name**: `connect-hub-search-engine`
   - **Region**: Choose one close to your users (and your Supabase region if possible).
   - **Instance Type**: Free (if available) or Starter.

4. **Environment Variables**:
   - Add the following variable:
     - `MEILI_MASTER_KEY`: **Generate a strong random string** (at least 16 bytes). You will use this as `MEILISEARCH_MASTER_KEY` in your frontend.

5. **Disk (Optional but Recommended)**:
   - For persistence (so you don't lose search data on restart), add a **Disk**.
   - Mount Path: `/meili_data`
   - Size: 1GB (or as needed).

6. **Deploy**:
   - Click **"Create Web Service"**.
   - Wait for the deployment to finish.
   - Copy the **Service URL** (e.g., `https://connect-hub-search.onrender.com`).
   - Use this URL as `NEXT_PUBLIC_MEILISEARCH_HOST` in your Vercel environment variables.

### Post-Deployment Setup

After both Frontend and Search are running:

1. **Sync Data**:
   - You need to initialize the Meilisearch index.
   - You can trigger the sync API endpoint from your deployed frontend (secured by admin logic/secret if you implemented it, or run the sync script locally pointing to the remote PROD url).
   - *Example (if you have an API route)*:
     ```bash
     curl -X POST https://your-vercel-app.vercel.app/api/meilisearch/sync
     ```

2. **Verify**:
   - Visit your site and try the search bar.

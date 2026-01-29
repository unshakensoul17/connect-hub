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
   - **Image URL**: `docker.io/getmeili/meilisearch:v1.10` (Use full registry path!)
   - **Alternative**: `docker.io/getmeili/meilisearch:latest` for latest stable version.
   - ⚠️ **Important**: Use the full `docker.io/` prefix to avoid image pull errors.

3. **Configuration**:
   - **Name**: `connect-hub-search-engine`
   - **Region**: Choose one close to your users (and your Supabase region if possible).
   - **Instance Type**: Free (if available) or Starter.

4. **Environment Variables**:
   - `MEILI_MASTER_KEY`: **REQUIRED**. Must be at least 16 characters. Meilisearch will crash if this is missing or too short.
   - `MEILI_ENV`: `production`

5. **Port Configuration (CRITICAL)**:
   - In the Render Service Settings (or during creation), find the **"Port"** field.
   - Set it to `7700`.
   - *Reason*: Meilisearch runs on port 7700 by default. If Render looks for port 10000 (default), the deploy will fail/timeout.

6. **Health Check Path**:
   - Set the **Health Check Path** to `/health`.
   - This ensures Render knows exactly when Meilisearch is ready.

7. **Disk (Optional but Recommended)**:
   - For persistence (so you don't lose search data on restart), add a **Disk**.
   - Mount Path: `/meili_data`
   - Size: 1GB (or as needed).

8. **Deploy**:
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

---

## Troubleshooting Meilisearch Deployment

### Issue: "Image pull failed"

**Cause**: Render cannot pull the Docker image.

**Solutions**:
1. **Use full registry path**: `docker.io/getmeili/meilisearch:v1.10` instead of just `getmeili/meilisearch:v1.10`
2. **Try a specific version**: Use `v1.10` instead of `latest`
3. **Use Blueprint deployment**: Push the `render.yaml` and `Dockerfile.meilisearch` to your repo, then deploy from Git

### Issue: Service starts but health checks fail

**Cause**: Render is checking the wrong port or path.

**Solutions**:
1. Ensure **Port** is set to `7700` in service settings
2. Set **Health Check Path** to `/health`
3. Add environment variable: `PORT=7700`

### Issue: "MEILI_MASTER_KEY is missing or invalid"

**Cause**: Master key is not set or is too short.

**Solutions**:
1. Set `MEILI_MASTER_KEY` to at least 16 characters
2. Example: `my-super-secret-meilisearch-key-2024`

### Issue: Data is lost on restart

**Cause**: No persistent disk is configured.

**Solutions**:
1. Add a **Disk** in Render service settings
2. Mount path: `/meili_data`
3. Size: 1GB minimum

### Alternative: Deploy from Git Repository

If Docker image deployment keeps failing, you can deploy from your Git repository:

1. Push `render.yaml` and `Dockerfile.meilisearch` to your repo
2. In Render, select **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect and deploy using the blueprint

This approach is more reliable as Render builds the image itself.


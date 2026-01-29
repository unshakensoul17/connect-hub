# Quick Fix for Meilisearch Deployment on Render

## The Problem
You're getting: **"Image pull failed for latest"**

## The Solution

### Method 1: Fix the Docker Image URL (Fastest)

1. **Delete your current Render service** (if it exists)

2. **Create a new Web Service**:
   - Go to Render Dashboard
   - Click **"New +"** → **"Web Service"**
   - Select **"Deploy an existing image from a registry"**

3. **Use the FULL Docker registry path**:
   ```
   docker.io/getmeili/meilisearch:v1.10
   ```
   ⚠️ **Don't use**: `getmeili/meilisearch:latest` (this causes the error!)
   ✅ **Use**: `docker.io/getmeili/meilisearch:v1.10`

4. **Configure the service**:
   - **Name**: `campus-connect-meilisearch`
   - **Region**: Choose closest to you
   - **Instance Type**: Free or Starter
   - **Port**: `7700` ⚠️ CRITICAL!

5. **Add Environment Variables**:
   ```
   MEILI_MASTER_KEY=your-secure-key-at-least-16-characters-long
   MEILI_ENV=production
   ```

6. **Set Health Check**:
   - **Health Check Path**: `/health`

7. **Add Disk** (Optional but recommended):
   - **Mount Path**: `/meili_data`
   - **Size**: 1GB

8. **Deploy!**

---

### Method 2: Deploy from Git (More Reliable)

If Method 1 still fails, use the Blueprint approach:

1. **Commit the new files to Git**:
   ```bash
   git add render.yaml Dockerfile.meilisearch
   git commit -m "Add Meilisearch deployment config"
   git push
   ```

2. **Deploy using Blueprint**:
   - Go to Render Dashboard
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Select the `campus-connect` repo
   - Render will auto-detect `render.yaml` and deploy

3. **Set the Master Key**:
   - After deployment, go to the service
   - Click **"Environment"**
   - Find `MEILI_MASTER_KEY`
   - Set it to a secure value (at least 16 characters)

---

## After Deployment

Once Meilisearch is running:

1. **Copy the Service URL** from Render (e.g., `https://campus-connect-meilisearch.onrender.com`)

2. **Update Vercel Environment Variables**:
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add/Update:
     ```
     NEXT_PUBLIC_MEILISEARCH_HOST=https://campus-connect-meilisearch.onrender.com
     MEILISEARCH_MASTER_KEY=<same-key-you-used-in-render>
     ```

3. **Redeploy Vercel** to pick up the new environment variables

4. **Test the search** on your deployed site!

---

## Why This Happens

Render requires the **full Docker registry path** (`docker.io/`) to properly pull images from Docker Hub. Without it, Render's image pull fails with the error you saw.

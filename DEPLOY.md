# CvBuilder Deployment Guide

The application has been upgraded to a full-stack secure app with User Auth and PostgreSQL key.

## 1. Prerequisites
- **Node.js** v18+
- **PostgreSQL Database** (Local or Cloud like Neon/Supabase/Render)
- **Netlify Account** (for Frontend)
- **Render or Railway Account** (for Backend)

## 2. Local Development Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   - Rename `.env.example` to `.env`
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `JWT_SECRET` to a random string
   - Set `CORS_ORIGIN="http://localhost:5173"`
3. **Database Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 3. Railway Deployment (Simplest Method - Monolith)
This method hosts both the Backend and Frontend in a single Railway service.

1. **Create Project**:
   - Go to [Railway.app](https://railway.app/) and create a new project.
   - Choose **Deploy from GitHub repo** and select your `CvBuilder` repo.
2. **Add Database**:
   - In the project canvas, right-click and add a **PostgreSQL** database service.
3. **Configure Environment Variables**:
   - Go to your `CvBuilder` service settings > Variables.
   - Add `DATABASE_URL`: Click "Reference Variable" and select `postgresql connection string`.
   - Add `JWT_SECRET`: A random strong string.
   - Add `NODE_ENV`: `production`.
   *(Note: You don't need `CORS_ORIGIN` or `VITE_API_URL` because the frontend and backend run on the same domain)*
4. **Settings > Build & Start**:
   - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
     *(This installs deps, builds the React frontend, and runs DB migrations)*
   - **Start Command**: `npm start`
5. **Generate Domain**:
   - In Settings > Networking, click **Generate Domain**.
   - Open that URL to see your app!

## 4. Alternative: Separate Frontend (Netlify)
If you prefer hosting the frontend separately for faster static edge delivery:
1. Deploy Backend to Railway (Build: `npm install && npx prisma migrate deploy`, Start: `npm start`).
   - Set `CORS_ORIGIN` to your Netlify URL.
2. Deploy Frontend to Netlify.
   - Set `VITE_API_URL` to your Railway URL.

## 5. Verification
- Open your Netlify URL.
- Register a new account.
- Create a resume.
- Save & Download PDF (now fully client-side!).

## 6. Troubleshooting
### Error: P3019 (Provider Mismatch)
If you see an error about `datasource provider` mismatch (sqlite vs postgresql):
1. Delete the `prisma/migrations` folder.
2. Delete `prisma/dev.db` if it exists.
3. Run `npx prisma migrate dev` again to start fresh with PostgreSQL.

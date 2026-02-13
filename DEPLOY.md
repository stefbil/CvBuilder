# Deploying CvBuilder to Railway

This project is configured for one-click deployment on [Railway](https://railway.app).

## Prerequisites

1.  A GitHub account
2.  A Railway account (you can sign up with GitHub)

## Deployment Steps

1.  **Push to GitHub**
    - Create a new repository on GitHub.
    - Push your local code to the new repository:
      ```bash
      git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
      git branch -M main
      git push -u origin main
      ```

2.  **Deploy on Railway**
    - Go to your Railway dashboard.
    - Click **"New Project"** -> **"Deploy from GitHub repo"**.
    - Select your `CvBuilder` repository.
    - Click **"Deploy Now"**.

3.  **Automatic Configuration**
    - Railway will automatically detect the `railway.json` and `nixpacks.toml` configuration files.
    - It will install the dependencies (including Chrome for PDF generation).
    - It will run the build command (`npm run build`).
    - It will start the server (`npm run start`).

4.  **Persistent Storage (Optional)**
    - By default, the SQLite database is stored in a file inside the container. If the deployment restarts, data might be lost.
    - For persistent data, you should add a **Volume** in Railway and mount it to the path where `dev.db` is stored, or switch to a PostgreSQL database (recommended for production).
    - **To stick with SQLite**:
      1. Go to your service settings in Railway.
      2. Specific the environment variable `DATABASE_URL=file:/app/data/dev.db`
      3. Add a volume mounted at `/app/data`.

## Troubleshooting

-   **PDF Generation Fails**: Check the deployment logs. Ensure `PUPPETEER_EXECUTABLE_PATH` is finding the chromium binary. The included `nixpacks.toml` handles the system dependencies.
-   **Database Errors**: If you see errors about the database file, make sure the volume is mounted correctly or the path in `DATABASE_URL` is correct.

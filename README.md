# BlogMe

A personal blog app built with React, Vite, and Tailwind. Posts are stored in a SQLite-compatible database (Turso) when deployed, with optional fallback to local storage.

## Database (SQLite / Turso)

The app uses **SQLite** via [Turso](https://turso.tech) (libSQL) so you get a simple, file-like database that works on Vercel’s serverless environment.

- **With database:** Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (e.g. from [Turso](https://turso.tech) or the Vercel + Turso integration). The API will create a `posts` table automatically.
- **Without database:** The app still works: it uses browser localStorage and shows a short notice in the footer.

## Running locally

- **Frontend only:** `npm run dev` — uses localStorage if the API is not available.
- **With API + DB:** Use [Vercel CLI](https://vercel.com/docs/cli) and run `vercel dev`. Copy `.env.example` to `.env.local`, add your Turso URL and token, and the serverless API will use the database.

## Deploying to Vercel

### 1. Push your code

Make sure the project is in a Git repo (GitHub, GitLab, or Bitbucket) and push your latest changes.

### 2. Import the project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (you can use your GitHub account).
2. Click **Add New…** → **Project**.
3. Import your repository. Vercel will detect the app and use these settings (already in `vercel.json`):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. The first deploy may succeed without a database; the app will show “Using local storage” in the footer until you add a database.

### 3. Add a database (so posts are saved)

1. In the Vercel dashboard, open your project.
2. Go to the **Storage** tab (or **Integrations**).
3. Click **Create Database** or **Add Integration**, then choose **Turso** (SQLite-compatible).
4. Create a new Turso database (or connect an existing one). Vercel will add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to your project.
5. **Redeploy** the project (Deployments → … on the latest deployment → Redeploy) so the new env vars are used.

After redeploy, the API will create the `posts` table on first use and your blogs will be stored in the database.

### Optional: Deploy from the command line

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add the Turso env vars in the Vercel dashboard (Settings → Environment Variables) and redeploy.

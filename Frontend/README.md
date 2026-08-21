# AI Code Assistant Frontend

React web application for the AI Code Assistant project. Built with Vite and native CSS styling.

## Setup Instructions

1. Install Node.js
2. Navigate to the `frontend` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will run at `http://localhost:5173`.

   ## Deployment (Vercel)

   You can deploy the frontend to Vercel with minimal setup. Two common approaches are shown below.

   Option A — Vercel Dashboard (recommended for GitHub):
   - Push your repository to GitHub.
   - In Vercel, click **Import Project** → **Import Git Repository** and select your repo.
   - Set the Project Root to `Frontend` (important).
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment variables: none required for the static frontend (configure if your backend requires them).
   - Deploy.

   Option B — Vercel CLI (quick one-off from your machine):
   1. Install the Vercel CLI if you don't have it:
   ```bash
   npm i -g vercel
   ```
   2. From the `Frontend` folder run:
   ```bash
   cd Frontend
   vercel --prod
   ```
   3. When prompted, set the project root to the current folder (or confirm). Vercel will use `package.json` and the `build` script to produce `dist`.

   The repository includes a minimal `vercel.json` that forces SPA routing to `index.html` and configures the static build output.


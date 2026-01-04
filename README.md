<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ckL4sh0oGfd5DD7aZYU_VemNTfNMtbkS

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

- Prerequisites: a Netlify account and a new site.
- Build command: `npm run build`
- Publish directory: `dist`

### Steps
- Push this repo to GitHub (or connect local) and create a Netlify site.
- In Netlify Site settings → Build & deploy, set:
  - Build command: `npm run build`
  - Publish directory: `dist`
- In Netlify Site settings → Environment variables, add:
  - `GEMINI_API_KEY` = your Gemini API key
- Deploy from the Netlify UI or connect Continuous Deployment to your repo.

This app is a single-page application. The `netlify.toml` includes `/* → /index.html (200)` to route all paths to the entry page.

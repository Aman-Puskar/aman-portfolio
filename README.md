# Aman Puskar portfolio (React + Vite)

    npm install
    npm run dev      # local dev server
    npm run build    # production build in dist/

Deploy `dist/` to Vercel, Netlify or GitHub Pages.

- Content lives in `src/data.js` (replace the project `repo` links).
- The chat sends a `GET` request with a `query` parameter to the backend's `/response` endpoint.
  Set `VITE_API_URL` in `.env` to change the endpoint. For deployment, configure your backend
  to allow CORS from the deployed site's domain. Response parsing is in `src/config.js`.
- If the API fails, the chat shows the real error (status code or network/CORS) instead of a canned answer.

# Movie Explorer

CPSC 349 Homework 3. A React movie browser styled to match Demo.mov.

## Run locally

1. Run `npm install`.
2. The homework TMDB key is included in `src/config.js`. No environment setup is needed.
3. Run `npm run dev` and open the printed address in Chrome.

To replace the key, edit `src/config.js`.

## Features

- Popular movies from TMDB, 20 per page (the final page may have fewer).
- Search by title, with a short delay while typing.
- Release date and rating sorting in both directions, applied to the current page like the demo.
- Previous/Next navigation, page count, and disabled boundary buttons.
- Missing poster, empty result, loading, and request error handling.
- Plain CSS and React components, state, and props. No UI framework.

The movie catalog changes over time, so the titles and ratings will differ from the 2025 video. TMDB only allows access through page 500; the app limits navigation accordingly.

## Check and build

```
npm test
npm run build
npm run preview
```

## Publish on GitHub Pages

1. Create a public GitHub repository and upload the contents of this directory (not the parent folder or `node_modules`).
2. No GitHub secret is required; the app reads the key from `src/config.js`.
3. Under Settings > Pages, select **GitHub Actions** as the source.
4. Push to `main`, or run the **Deploy to GitHub Pages** workflow from the Actions tab.
5. Open the URL shown by the deployment and verify search, sorting, pagination, and posters in Chrome.

The TMDB key in `src/config.js` is intentionally public for this homework. It is visible in both the repository and built JavaScript. The optional local `.env` remains ignored by Git and is no longer used by the app.

## Submission

Create `homework3.pdf` with exactly these two real links:

- The public GitHub repository URL.
- The publicly accessible deployed website URL.

Do not submit placeholders. The repository and deployment must exist first.

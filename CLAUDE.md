# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production (vite build)
- `npm run deploy` — Build + push to GitHub Pages (`gh-pages -d dist`)
- `npm run lint` — ESLint check
- `npm run preview` — Preview production build locally
- `npm ci` — Clean install (used by CI, avoids lockfile changes)
- `firebase deploy --only firestore:rules` — Deploy Firestore security rules

## CI/CD

Two deployment paths both active:

1. **GitHub Actions (push → master):** Auto-deploys to Firebase Hosting via `.github/workflows/firebase-hosting-merge.yml`. Runs `npm ci && npm run build` on ubuntu-latest (case-sensitive fs).
2. **`npm run deploy`:** Pushes `dist/` to `gh-pages` branch for GitHub Pages.

PR previews trigger `.github/workflows/firebase-hosting-pull-request.yml`.

## Architecture

- **Framework:** React 19 + Vite 6 + React Router 7
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **Database:** Firestore (collections: `projects`, `history`, `settings/profile`)
- **Auth:** Firebase Auth + Google OAuth for admin login
- **Analytics:** GA4 via `@analytics/google-analytics`

### Key Files

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Router, layout, fetches projects from Firestore on mount |
| `src/config/firebase.js` | Firebase SDK init |
| `firestore.rules` | Firestore security rules (admin UID hardcoded) |
| `src/components/HeroSS.jsx` | Hero section with profile photo from Firestore |
| `src/components/ProjectsSS.jsx` | Project grid display |
| `src/components/UploadProject.jsx` | Admin CRUD panel |
| `src/hooks/useProfilePhoto.js` | Read/write hero profile photo to `settings/profile` |
| `src/hooks/useImageUpload.js` | Image upload + preview for project images |
| `src/hooks/useProjectActions.js` | Project CRUD with Firestore |
| `src/utils/projectHelpers.js` | Image compression, validation, import/export |

### File Organization

```
src/
  assets/              — Images, lanyard model
  components/
    admin_auth/        — Login form, auth utils (cookie-based session)
    upload/            — Admin tab components (ProjectForm, ProfileTab, Modals, etc.)
    *.jsx              — Section components (HeroSS, AboutSS, ProjectsSS, etc.)
  hooks/               — Custom hooks (useProfilePhoto, useImageUpload, useProjectActions, etc.)
  utils/               — Helpers (analytics, projectHelpers)
  config/firebase.js   — Firebase init
functions/             — Firebase Cloud Functions (separate node project)
```

### Data Flow

- Projects in Firestore `projects`, fetched at app load
- Admin writes via `UploadProject` → `useProjectActions` → Firestore
- Images stored as **base64 data URLs** in Firestore docs (not Firebase Storage)
- Profile photo synced in realtime via `onSnapshot`
- Image compression via canvas: default maxWidth 1200, quality 0.7, JPEG output

### Gotchas

- CI on Linux = case-sensitive fs. Import paths must match actual filename casing exactly.
- Firestore 1 MiB doc limit — large base64 images will fail. Profile photo uses aggressive compression (400px, 0.6 quality).
- Profile photo write needs `settings/{document}` rule in Firestore rules.
- All images are base64 in Firestore — Firebase Storage bucket configured but unused.

# CineMatch — Movie Recommendation System

CineMatch is a movie recommendation web app that shows how recommender systems actually work. It combines **content-based filtering** (vector similarity on genre, director and keywords) with **collaborative filtering** (taste similarity against a community of users), and lets you tune the blend live and see *why* every movie was recommended.

Everything runs in the browser. There is no backend and no API key.

## Features

- **Hybrid recommendations** — every movie gets a match score (0–100%) split into a content score and a collaborative score, with the top reasons behind it.
- **Algorithm Lab** — switch between Hybrid, Content-based and Collaborative modes and drag the blend slider to see rankings change in real time.
- **Explainable results** — each recommendation lists its top matching factors (genre, director, keyword, peer) and the community users whose taste it was based on.
- **Quick Rate deck** — rate movies one card at a time (1–5 stars) to build your taste profile quickly, and reset or reload a profile whenever you want.
- **Mood Compass** — pick a mood preset (e.g. *Cosmic Mind-Bender*, *Dark Neo-Noir*) or set per-genre sliders to steer recommendations without rating anything.
- **Watchlist dashboard** — track movies as *Want to watch*, *Watching* or *Watched*, add personal notes and priorities, search and filter, see total runtime backlog, and export the list as JSON.
- **Movie details** — cast, director, runtime, IMDb score, streaming availability and an embedded YouTube trailer player.
- **Search, filter and sort** — by title, genre, minimum rating, match score, year or runtime.
- **Persistent state** — ratings, watchlist and genre preferences are saved in `localStorage`, so your profile survives a refresh.

## How the recommendations work

**Content-based filtering**
Each movie is turned into a sparse feature vector with weighted dimensions: director (3.0), genre (2.5) and keyword (1.2). Your profile vector is built from the movies you rated, weighted by how much you liked them (a 5★ pulls the profile toward that movie, a 1★ pushes it away), plus any Mood Compass preferences. Movies are then ranked by cosine similarity to your profile. With no data yet (cold start), movies fall back to a ranking based on critical acclaim.

**Collaborative filtering**
Your ratings are compared against a set of community users using Pearson/cosine similarity. Movies loved by the users most similar to you score higher, and the closest "neighbors" are shown next to each recommendation.

**Hybrid blend**

```
final score = w × content score + (1 − w) × collaborative score
```

`w` is the blend slider in the Algorithm Lab: `0` is purely collaborative, `1` is purely content-based.

The dataset is a curated catalog of 36 films with 7 community profiles, small enough to inspect by hand and easy to extend.

## Tech stack

- [React 19](https://react.dev) + TypeScript
- [Vite](https://vitejs.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animations
- [Lucide](https://lucide.dev) icons

## Getting started

**Prerequisites:** a recent version of [Node.js](https://nodejs.org) (v20.19+ or v22+).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open <http://localhost:3000>.

### Other scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the dev server on port 3000   |
| `npm run build`   | Create a production build in `dist` |
| `npm run preview` | Preview the production build        |
| `npm run lint`    | Type-check with `tsc --noEmit`      |

## Project structure

```
src/
├── App.tsx                       # App shell, state, tabs, localStorage
├── components/
│   ├── Navbar.tsx                # Top navigation and tab switcher
│   ├── HeroSpotlight.tsx         # Top pick with trailer and streaming info
│   ├── MovieCard.tsx             # Recommendation card with match score
│   ├── MovieDetailModal.tsx      # Full movie details
│   ├── TrailerModal.tsx          # YouTube trailer player
│   ├── AlgorithmLabModal.tsx     # Algorithm mode and hybrid blend controls
│   ├── QuickRateDeck.tsx         # Card-by-card rating flow
│   ├── GenreCompass.tsx          # Mood presets and genre sliders
│   ├── WatchlistDashboard.tsx    # Watchlist, notes, stats, JSON export
│   └── Toast.tsx                 # Notifications
├── services/
│   └── recommendationEngine.ts   # Vectorization, cosine/Pearson, hybrid scoring
├── data/
│   ├── movies.ts                 # Movie catalog
│   └── communityUsers.ts         # Community rating profiles
└── types/
    └── movie.ts                  # Shared TypeScript types
```

## Customizing

- **Add movies:** append entries to `src/data/movies.ts` (title, year, director, genres, keywords, cast, streaming, trailer ID). They are picked up by the engine automatically.
- **Add community users:** add profiles with their ratings to `src/data/communityUsers.ts` to change the collaborative signal.
- **Tune the algorithm:** feature weights and the rating-to-weight mapping live at the top of `src/services/recommendationEngine.ts`.

## Deployment

```bash
npm run build
```

This outputs a fully static site in `dist/`, which you can host on any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).

# Kitne Rupay

Mobile-first web MVP for India-focused product price discovery. Users can upload a product photo or search by text, then compare listings across Indian marketplaces.

## Features

- Hero page with a free-trial CTA.
- `/discover` flow with photo upload and browse search.
- SerpApi Google Lens-backed photo search.
- Google Custom Search-backed marketplace search.
- Product detail comparison page at `/item/[slug]`.
- Marketplace targeting for Amazon.in, Flipkart, Meesho, Myntra, AJIO, Nykaa, JioMart, Tata CLiQ, and Snapdeal.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
SERPAPI_KEY=
GOOGLE_CSE_API_KEY=
GOOGLE_CSE_CX=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SERPAPI_KEY` enables photo search through Google Lens. `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_CX` enable text search across the configured marketplace domains.

## Scripts

```bash
npm run lint
npm run build
npm run dev
```


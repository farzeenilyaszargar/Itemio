# Itemio

Mobile-first web MVP for India-focused product price discovery. Users can upload a product photo or search by text, then compare listings across Indian marketplaces.

Source repo: https://github.com/farzeenilyaszargar/Itemio

## Features

- Hero page with a free-trial CTA.
- `/discover` flow with photo upload and browse search.
- Itemio-branded mobile flow with SerpApi Google Lens-backed photo search.
- SerpApi Google-backed marketplace text search.
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
NEXT_PUBLIC_APP_URL=https://itemio.vercel.app
```

`SERPAPI_KEY` enables photo search through Google Lens and text search across the configured marketplace domains.

## Scripts

```bash
npm run lint
npm run build
npm run dev
```

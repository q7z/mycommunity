# The Landing Community Map

A React prototype for a private neighbor relationship map at The Landing in San Francisco.

## What It Does

- Renders floor-by-floor apartment geometry from the public SightMap floor-plate data.
- Lets you search and filter apartments by resident profile, interest, floor, or availability.
- Shows consented resident notes, work, interests, relationship strength, last touch, and next move.
- Includes a lightweight roadmap for turning the prototype into a private, owned community app.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Data Notes

`public/data/landing-map.json` was generated from public availability and floor-plate assets linked from `https://www.thelandingsf.com/availability/`.

Resident profiles in `src/data/community.ts` are synthetic placeholders. Replace them with consented, private data before using this as a real community tool.

# Pulse — MARTA Done Right

The transit app Atlanta actually deserves. Zero cognitive load, flawless live tracking, and delight at every step.

## Features
- Live GTFS-RT + MARTA WiFi auto vehicle claiming (no more disappearing buses)
- Smart Plan tab with 3 swipeable routes + Nearby & Direct Options
- Interactive Map (buses in blue, trains in orange) with tap-to-ride
- Auto On-Trip mode with giant countdown, capacity, door side, haptics
- Guest mode + one-tap sign-up for favorites, predictions, live share
- Pure white UI with official MARTA Process Blue accents

## Tech
- React + TypeScript + Tailwind
- Supabase (auth + DB + realtime)
- MARTA public GTFS-RT + Rail API

## Run locally
```bash
git clone https://github.com/Johnwolf-connect/marta-magic-ride.git
cd marta-magic-ride
npm install
npm run dev

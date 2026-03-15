# Orlické hory – Stezka Českem
## Planned Features / Roadmap

This document lists planned features for the Orlické hory stage website.
The goal of the project is to create a **practical trail companion for hikers**, optimized for mobile use, low network connectivity, and quick information access on the trail.

Features are grouped by development phase and priority.

---

# Phase 1 – Core System (MVP)

These features form the functional base of the project.

### Data Infrastructure
- Supabase database for structured trail data
- Data model for:
  - points
  - services (accommodation, food, water, shop, etc.)
  - navigation segments
- Sync from Google Sheets → Supabase
- Server-side rendering of itinerary from Supabase

### Itinerary
- Timeline-style itinerary list
- Compact mobile layout
- Icons for service categories
- Filters for:
  - accommodation
  - food
  - water
  - shop
  - navigation points

### Point Detail Pages
- Detailed service information
- Contact info (phone, website)
- Notes about services
- Nearby services (distance to next water / food / accommodation)

### Navigation
- Trail timeline with connected points
- Navigation filter showing only navigation points
- Trail segment colors between navigation points
  - red
  - blue
  - green
  - yellow

---

# Phase 2 – Content System

### Blog
- Markdown-based blog system
- Articles stored in repository
- Git-based CMS for editors
- Editor login via GitHub
- Image upload support

Possible blog topics:
- trail updates
- flora and fauna
- seasonal information
- trail reports

---

# Phase 3 – Trail Tools

These features improve the usefulness of the site during hiking.

### Distance Awareness
- Distance to next services
  - next water
  - next food
  - next accommodation

### Stage Summary
Display basic statistics:
- stage length
- highest point
- number of water sources
- number of accommodation options

### GPX Download
- Download GPX track of the stage
- Compatible with GPS devices and apps

### Service Notes
- reliability indicators for water sources
- seasonal availability
- notes about shops or restaurants

---

# Phase 4 – Offline Support

### Progressive Web App (PWA)
- Installable web app
- Offline support via service worker
- Cached pages:
  - itinerary
  - point detail pages
  - styles and icons

Images are optional and not required for offline use.

---

# Phase 5 – Export & Planning Tools

### Printable Itinerary
Special print layout for itinerary pages.

### PDF Export
Export filtered itineraries as PDF:
- navigation points
- accommodation list
- services overview

Use cases:
- printed guide
- offline reference
- trip planning

---

# Phase 6 – User Preferences

User preferences stored locally in the browser.

### Hiking Direction
Toggle route direction:
- West → East
- East → West

Changes:
- itinerary order
- distance calculations

### Dark Mode
Optional dark theme for evening or indoor use.

### Hiking Mode (optional)
Larger text and spacing for outdoor readability.

Preferences stored via `localStorage`.

---

# Phase 7 – Navigation Improvements

### Trail Visualization
- colored trail segments between navigation points
- distance between navigation points

### Optional Map View
Simple map showing:
- points
- services
- navigation segments

---

# Phase 8 – Community Features

### Trail Issue Reporting
Allow hikers to report problems:
- fallen trees
- damaged trail
- dry water sources

### Last Verified Information
Display last verification date for services.

Example:
"Water source verified: May 2026"

---

# UX Principles

The site should prioritize:

- fast loading
- minimal JavaScript
- mobile usability
- readability in sunlight
- compact information layout
- reliability with slow connections

The goal is to create a **practical hiking tool**, not a complex web application.

---

# Future Ideas (Optional)

- GPS-based "You are here" indicator
- Nearby services based on location
- hut/pub highlights
- educational articles about local nature
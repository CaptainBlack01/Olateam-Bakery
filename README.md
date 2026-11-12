# Olateam Bakery

A warm, editorial-style bakery website built with plain HTML, CSS, and JavaScript. Browse the catalogue, filter by collection, search the bakery, build a basket, and place a demo pickup order.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home, featured bakes, reservation form |
| `breads.html` | Bread catalogue with filters and sorting |
| `cakes.html` | Cake catalogue with filters and sorting |
| `pastries.html` | Pastry catalogue with filters and sorting |
| `story.html` | Bakery story, timeline, and values |
| `contact.html` | Contact details and message form |
| `login.html` | Demo sign-in form |
| `signup.html` | Demo account form with password strength meter |

## Features

- Shared product catalogue in `products.js` (18 bakes) powering category grids, search, and the basket.
- Category filters and sorting generated from the catalogue.
- Basket stored in `localStorage` (`olateamCartV2`) with quantity limits.
- Demo checkout with customer details, pickup slot, confirmation state, and automatic basket clearing. No payment is taken.
- Live search overlay across all products, linking back to catalogue cards.
- Reservation, contact, newsletter, login, and signup forms with inline validation and toast feedback.
- Responsive layout with a mobile navigation drawer and off-canvas basket.
- Keyboard support: focus trapping in overlays, Escape to close, skip link, visible focus states, and reduced-motion support.

## Demo Behavior

This is a front-end demo. There is no backend, payment provider, or real authentication. Form submissions display confirmation messages, and the basket persists locally in the browser. Demo login and signup redirect to the home page after validation.

## Project Structure

```text
index.html
breads.html
cakes.html
pastries.html
story.html
contact.html
login.html
signup.html
products.js    Shared product catalogue and collection map
script.js      Cart, checkout, search, navigation, forms, and UI behavior
styles.css     Design tokens, components, and responsive layout
```

## Setup

1. Download or clone the project.
2. Open `index.html` in a modern browser.

No build step or package installation is required. For the most reliable `localStorage` behavior, serve the folder with any static file server instead of opening files directly, for example:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Dependencies

- [Lucide](https://unpkg.com/lucide@latest) for icons (CDN)
- Google Fonts: Playfair Display and Inter
- Unsplash images

An internet connection is needed for the CDN assets and photography. All layout and behavior otherwise runs locally.

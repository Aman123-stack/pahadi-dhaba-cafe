# Pahadi Dhaba & Cafe — Website

React (Vite + Tailwind) front end and a Node.js (Express) API, rebuilt from the original `index (4).html`.

```
client/   React app — public site in src/components, admin page in src/admin
server/   Express API — routes in src/routes, default content in src/data
```

## Run it

```bash
npm run install:all     # installs root, server and client dependencies
npm run dev             # site: http://localhost:5173   admin: http://localhost:5173/admin
```

Production (one process serves both the site and the API):

```bash
npm run build           # builds client/dist
npm start               # http://localhost:5050  (admin at /admin)
```

## Editing the website (no code needed)

Open **/admin** and log in with the password set as `ADMIN_TOKEN` in `server/.env`
(copy `server/.env.example` if the file doesn't exist, and restart the server after changing it).

| Tab | What you can change |
| --- | --- |
| Website details | Restaurant name & logo text, top banner photo and text, phone, address, Google Maps search, hours, landmarks, parking, rating & review count, price range, menu PDF link, Instagram/Facebook, and every photo (overview, seating, gallery) |
| Menu | Categories (add, rename, reorder, delete) and dishes (photo, name, description, cooking time, serving, badge, spicy) |
| Bookings | Table/cabana requests from the website — call the guest, then mark confirmed or cancelled |
| Reviews | Reviews visitors sent through “Share Your Experience” |

Photos can be uploaded straight from your computer (JPG, PNG or WebP, up to 8 MB).
Saved content and uploads live in `server/storage/` — back up that folder.
The built-in defaults are in `server/src/data/` (site.js, menu.js, reviews.js).

## API

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/site` | Editable site content |
| GET | `/api/menu` | Menu categories and dishes |
| GET | `/api/reviews` | Rating summary and featured reviews |
| POST | `/api/reservations` | Validates and stores a reservation request, returns a reference like `PDC-3F9A1C` |
| POST | `/api/reviews` | Stores a guest review for staff to read |
| PUT | `/api/site`, `/api/menu` | Admin — save content |
| POST | `/api/admin/uploads` | Admin — upload a photo (raw image body) |
| GET / PATCH | `/api/reservations`, `/api/reservations/:ref` | Admin — list bookings / set status |
| GET | `/api/reviews/submissions` | Admin — submitted reviews |

Admin requests send the password in the `x-admin-token` header. Forms are protected by a hidden honeypot
field and per-IP rate limits. If you deploy behind a proxy, set `TRUST_PROXY=1`.

Hero photo: friends dining together, from Unsplash (images.unsplash.com/photo-1528605248644-14dd04022da1,
Unsplash License). A Himalayan alternative is kept at `client/public/images/hero-himalaya.jpg` — pick either in
the admin page by pasting `/images/hero-himalaya.jpg` or `/images/hero-dining.jpg` as the banner photo.

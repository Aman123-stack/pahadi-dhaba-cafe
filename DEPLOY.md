# Putting the website online

The whole project runs as **one service**: it serves the website, the admin page and the API.
After it's online you share two links:

| Link | Who gets it |
| --- | --- |
| `https://YOUR-ADDRESS/` | Everyone: customers, Google, Instagram bio, WhatsApp |
| `https://YOUR-ADDRESS/admin` + the admin password | Only the restaurant owner/manager |

> **Storage matters.** Admin edits, bookings and uploaded photos are saved as files in `DATA_DIR`.
> The host must give that folder a **persistent volume/disk**, or everything is wiped on each restart.

---

## GoDaddy cPanel hosting (upload a zip, no GitHub needed)

Works on GoDaddy **cPanel (Linux) hosting** that has **Setup Node.js App** in cPanel. It does *not* work on
GoDaddy Website Builder, or on hosting without Node.js (see "No Node.js?" below).

1. On your PC run `npm run release`. This creates `release/pahadi-dhaba-cafe.zip`, the only file you upload.
2. cPanel → **File Manager** → in your home folder (not `public_html`) upload the zip → **Extract**.
   You now have a folder `pahadi-dhaba-cafe/`.
3. cPanel → **Setup Node.js App** → **Create Application**:
   - Node.js version: the highest offered (18 or newer)
   - Application mode: Production
   - Application root: `pahadi-dhaba-cafe`
   - Application URL: your domain (e.g. `pahadidhaba.in`)
   - Application startup file: `app.cjs`
   - Environment variables: `ADMIN_TOKEN` = a long password (12+ characters), `TRUST_PROXY` = `1`
4. Click **Create**, then **Run NPM Install**, then **Restart**.
5. Turn on free SSL: cPanel → **SSL/TLS Status** → **Run AutoSSL**, so the site opens with `https://`.

**Updating later:** run `npm run release` again, upload and extract over the old folder, then **Restart**.
Never delete `pahadi-dhaba-cafe/server/storage/`, because it holds bookings, edits and photos.

**No Node.js?** Host the app on Railway (Option A below) and point your GoDaddy domain at it:
GoDaddy → **Domains → DNS** → add the CNAME record Railway shows under **Custom Domain**.

---

## Step 1 — Put the project on GitHub (once)

This folder currently sits inside a git repository that covers your whole user folder, so give it its own:

```bash
cd "C:\Users\volko\OneDrive\Documents\Pahadi Restraunt And Cafe"
git init -b main
git add .
git commit -m "Pahadi Dhaba & Cafe website"
```

Create an empty **private** repository on https://github.com/new (e.g. `pahadi-dhaba-cafe`), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/pahadi-dhaba-cafe.git
git push -u origin main
```

`.gitignore` already keeps out `node_modules`, `server/.env` (your local password) and `server/storage` (local test data).

---

## Step 2 — Deploy (pick one)

### Option A: Railway (recommended, about US$5/month)

1. Sign in at https://railway.com with GitHub → **New Project** → **Deploy from GitHub repo** → pick the repo.
   Railway finds the `Dockerfile` and builds it.
2. Open the service → **Variables** → add:
   - `ADMIN_TOKEN` = a long password (at least 12 characters, made up just for this site)
3. Right-click the service → **Attach Volume** → mount path **`/data`**.
4. **Settings → Networking → Generate Domain**. You get `https://something.up.railway.app`.

### Option B: Render (free demo, or about US$7/month + disk for real use)

1. https://dashboard.render.com → **New → Blueprint** → pick the repo. It reads `render.yaml`
   (Docker service, random `ADMIN_TOKEN`). As shipped it uses the **free** plan, so data resets on restart.
   For the real site, edit `render.yaml` as its comments explain (paid plan + 1 GB disk at `/data`).
2. After the first deploy, open **Environment** to see or change `ADMIN_TOKEN`.
3. Your link is `https://pahadi-dhaba-cafe.onrender.com` (or similar).

### Option C: Your own server / VPS (Docker)

```bash
docker build -t pahadi .
docker run -d --restart unless-stopped -p 80:8080 \
  -e ADMIN_TOKEN='a-long-password' -v pahadi-data:/data --name pahadi pahadi
```

Put Nginx/Caddy in front for HTTPS.

**Settings the container already sets:** `PORT=8080`, `DATA_DIR=/data`, `TRUST_PROXY=1`, `NODE_ENV=production`.
On a live server the admin page stays **off** if `ADMIN_TOKEN` is missing or shorter than 12 characters.

---

## Step 3 — Check it

1. Open `https://YOUR-ADDRESS/api/health` and you should see `{"ok":true,...}`.
2. Open `https://YOUR-ADDRESS/admin`, log in, change something small, **Save**, and reload the site.
3. Make a test booking from the website, then see it under **Admin → Bookings**.
4. Restart the service from the host's dashboard and confirm your change and booking are still there.
   This shows the volume is working.

## Step 4 — Your own domain (optional)

Buy a domain (e.g. `pahadidhaba.in`) and add it in Railway (**Settings → Networking → Custom Domain**) or
Render (**Settings → Custom Domains**). Follow the DNS record they show you. HTTPS is set up automatically.

---

## Message to send the owner

> Hi! The Pahadi Dhaba & Cafe website is live:
> **https://YOUR-ADDRESS/**
>
> To change the website (photos, menu, prices, phone, hours) and see table bookings:
> **https://YOUR-ADDRESS/admin**
> I'll send the password separately.
>
> In the admin page:
> - **Website details**: name, banner photo, text, phone, address, hours, all photos
> - **Menu**: add/edit dishes and categories, upload dish photos
> - **Bookings**: call the guest, then press Confirm or Cancel
> - **Reviews**: feedback customers sent from the site
>
> Always press **Save changes** after editing.

Send the password in a **separate** message (or say it on a call), never in the same message as the link.

## Updating the site later

Commit and `git push`. Railway/Render rebuild automatically. Content edited in the admin page lives on the
volume, so it is **not** overwritten by new deploys.

## Backups

Download the volume's contents now and then (Railway: volume → **Backups**; Render: disk → **Snapshots**).
They hold `site.json`, `menu.json`, `reservations.json`, `review-submissions.json` and `uploads/`.

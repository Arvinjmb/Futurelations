# SAID

A pocket quote deck for the web. Flick through lines one at a time, save the ones that hit, switch between themed collections that reskin the whole app, and add your own. Installable to a phone home screen and works offline.

This is the web-first version of a "[someone] said" quote app — built so the content is completely swappable. The Kanye-style original inspired the concept; this is your own engine with original demo lines you can replace in one file.

---

## What it does

- **Deck** — one quote per card. Tap the card, press → / space, or swipe to get the next.
- **Save** — heart a line to keep it in your library; keeps a like count per line.
- **Share** — native share sheet on mobile, with a copy-text + share-card fallback everywhere else.
- **Collections** — themed sets (Momentum, Stillness, Build, Late Night). Each one is a full duotone skin that washes the whole app when selected. This is the "album-themed widget" idea, reimagined for the web.
- **Add** — write your own lines; they live on the device and appear in the deck.
- **Daily line** — an opt-in once-a-day notification (best while the tab is open or the app is installed — see notes below).
- **Install + offline** — add to home screen as a PWA; the service worker caches everything for offline use.
- **Accessible** — keyboard controls, visible focus, respects reduced-motion.

---

## Run it locally

It's plain HTML/CSS/JS — no build step. But the service worker and "install" features need to be served over `http`, not opened as a `file://`. From this folder:

```bash
# any one of these
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

---

## Put it in the Futurelations repo and publish it (free)

An auto-deploy workflow is already included (`.github/workflows/pages.yml`), so once the files are in the repo and Pages is switched on, every push rebuilds the live site automatically. Pick whichever path suits you.

> Important: these files must sit at the **root** of the repo, not inside a `said/` subfolder. Upload the *contents* of this folder (`index.html`, `app.js`, the `icons/` folder, the `.github/` folder, etc.), not the folder itself.

### Path A — browser only, no terminal
1. Open your `Futurelations` repo on GitHub → **Add file → Upload files**.
2. Drag in everything from this folder (including the `icons` and `.github` folders), then **Commit changes**.
3. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Wait ~1 minute. The site is live at `https://YOUR_USERNAME.github.io/Futurelations/`.

### Path B — git command line
From inside this folder:
```bash
git init
git add .
git commit -m "Futurelations — initial web version"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Futurelations.git
git push -u origin main
```
Then do step 3 above (Settings → Pages → Source: GitHub Actions).

Every path in the project is relative, so it works correctly from the `/Futurelations/` subpath with no changes.

---

## Make it yours — edit one file

All content lives in **`quotes.js`**. Each collection has a name, four skin colors, and a list of lines. A line is either a plain string or `{ text, author }`:

```js
{
  id: "myset",
  name: "My Set",
  accent: "#E8743B",   // highlight color
  bg: "#241813",       // stage background
  card: "#F6EDE3",     // card surface
  onCard: "#241813",   // text on the card
  quotes: [
    "A plain line shows with no attribution.",
    { text: "A line with a source.", author: "Whoever" }
  ]
}
```

Add, remove, or rename collections freely. Set `DEFAULT_COLLECTION` to whichever `id` should load first. To rebrand the whole app, change the wordmark text in `index.html` and the name/colors in `manifest.json`.

> A note on content: if you swap in quotes by a real person, use lines you have the right to use, and remember song lyrics are copyrighted. Original lines, public-domain text, and your own writing are always safe.

---

## Files

| File | What it is |
|------|------------|
| `index.html` | App structure and all five views |
| `styles.css` | Visual identity + the per-collection skin system |
| `app.js` | Deck engine, save/share, collections, add, settings, PWA wiring |
| `quotes.js` | **The content. Edit this.** |
| `manifest.json` | Makes the app installable |
| `sw.js` | Service worker for offline use |
| `icons/` | App icons (SVG + generated PNGs) |

---

## Honest limits (worth knowing before you decide on a native app later)

- **Notifications**: the web can't reliably wake a *closed* website to fire a daily notification on a schedule. It works while the tab is open, and improves once installed, but a true "every morning at 8am even when closed" push needs either a small server (web push) or a native app. This is the main reason you might later choose to wrap it as an app.
- **Install prompt**: the "Install" button appears when the browser offers it (Chrome/Edge/Android). On iOS, installing is done via Share → *Add to Home Screen*.

---

## Where this can go next

The whole thing is content-agnostic and already installable, so the path forward is open: keep it as a PWA, wrap it for the App Store / Play Store with a thin shell (Capacitor or a PWA-to-store service) to get reliable scheduled notifications, or extend the web version with a shared backend so likes and collections sync across devices.

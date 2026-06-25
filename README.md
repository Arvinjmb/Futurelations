# Future said it

A pocket quote deck for the web. One line at a time — flick through, save the ones that hit, switch between themed collections that reskin the whole app, and add your own. Installable to a phone home screen and works offline.

Every line is signed **Future said it**. The content is fully swappable, so this is really a reusable quote-app engine seeded with original demo lines you replace in one file.

---

## What it does

- **Deck** — one quote per card. Tap the card, press → / space, or swipe for the next.
- **Three buttons, nothing more** — Save, Share, Next. Everything else (Saved, Collections, Add, Settings) lives behind the single menu in the top-right.
- **Save** — heart a line to keep it in your library.
- **Share** — native share sheet on mobile, with a copy-text + share-card fallback everywhere else.
- **Collections** — themed sets (Momentum, Stillness, Build, Late Night). Each is a full duotone skin that washes the whole app when selected.
- **Add** — write your own lines; they live on the device and appear in the deck.
- **Daily line** — opt-in once-a-day notification (works while open / installed — see limits below).
- **Install + offline** — add to home screen as a PWA; the service worker caches everything.
- **Accessible** — keyboard controls, visible focus, respects reduced-motion.

---

## Run it locally

Plain HTML/CSS/JS, no build step. The service worker and install features need `http`, not `file://`:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

---

## Put it in the Futurelations repo and publish it (free)

An auto-deploy workflow is included (`.github/workflows/pages.yml`), so once the files are in the repo and Pages is on, every push rebuilds the live site automatically.

> Important: these files must sit at the **root** of the repo. Upload the *contents* of this folder (`index.html`, `app.js`, the `icons/` and `.github/` folders, etc.), not a wrapping folder.

### Path A — browser only, no terminal
1. Open your `Futurelations` repo → **Add file → Upload files**.
2. Drag in everything here (including `icons` and `.github`), then **Commit changes**.
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Wait ~1 minute → live at `https://YOUR_USERNAME.github.io/Futurelations/`.

### Path B — git command line
```bash
git init
git add .
git commit -m "Future said it — web version"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Futurelations.git
git push -u origin main
```
Then do step 3 above. Every path is relative, so it works from the `/Futurelations/` subpath unchanged.

---

## Make it yours — edit one file

All content lives in **`quotes.js`**. Each collection has a name, four skin colors, and a list of lines:

```js
{
  id: "myset",
  name: "My Set",
  accent: "#E8743B",   // highlight color
  bg: "#241813",       // stage background
  card: "#F6EDE3",     // card surface
  onCard: "#241813",   // text on the card
  quotes: [
    "A line shows with the Future signature under it.",
    "Add as many as you like."
  ]
}
```

Add, remove, or rename collections freely. Set `DEFAULT_COLLECTION` to whichever `id` loads first. The signature under each quote ("Future said it") is set in `index.html` and `app.js` if you ever want to change the wording.

> A note on content: if you swap in quotes by a real person, use lines you have the right to use — song lyrics are copyrighted. Original lines and your own writing are always safe.

---

## Files

| File | What it is |
|------|------------|
| `index.html` | App structure and all views |
| `styles.css` | Visual identity + the per-collection skin system |
| `app.js` | Deck engine, save/share, menu, collections, add, settings, PWA |
| `quotes.js` | **The content. Edit this.** |
| `manifest.json` | Makes the app installable |
| `sw.js` | Service worker for offline use |
| `icons/` | App icons |
| `.github/workflows/pages.yml` | Auto-deploys to GitHub Pages on every push |

---

## Honest limits (relevant if you weigh a native app later)

- **Notifications**: the web can't reliably wake a *closed* site to fire a scheduled daily notification. It works while open and improves once installed, but a true "every morning at 8am even when closed" push needs a small server (web push) or a native wrapper. This is the main reason to consider going native.
- **Install prompt**: the Install button appears when the browser offers it (Chrome/Edge/Android). On iOS, install via Share → *Add to Home Screen*.

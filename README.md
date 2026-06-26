# Futurelations

A pocket quote deck for the web. One line at a time, set over full-screen photos. Flick through, save the ones that hit, switch backgrounds with a double-tap, and save a quote-on-photo straight to your gallery. Installable to a phone home screen and works offline.

Every line is signed **Future**. The content is fully swappable — it ships with original placeholder lines you replace in one file (`quotes.js`).

---

## What it does

- **Deck** — the quote sits straight on a full-screen photo. Tap, press → / space, or swipe for the next.
- **Double-tap to change background** — cycles through the four backgrounds. (Keyboard: `b`.)
- **Three icons, nothing else** — menu, save (heart), share/save-image.
- **Save image to gallery** — bakes the current quote + the **FUTURE** signature onto the photo and saves it (native share-sheet → Save Image on mobile, download elsewhere).
- **Save** — heart a line to keep it in your library.
- **Backgrounds** — four full-screen photos, **embedded in `assets.js`** so they always load (no separate image files to upload). Switch in the menu or by double-tapping.
- **Daily line** — opt-in once-a-day notification (works while open / installed — see limits below).
- **Install + offline** — add to home screen as a PWA; the service worker caches everything.
- **Accessible** — keyboard controls, visible focus, respects reduced-motion.

> The four photos are user-supplied and embedded in `assets.js`. To change them, replace the data in `assets.js` (or point `BACKGROUNDS[i].image` in `quotes.js` at your own file). The seeded lines are original placeholders — edit the `QUOTES` list in `quotes.js` to set the wording you want.

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
| `quotes.js` | **The lines. Edit this.** |
| `assets.js` | The four embedded background photos |
| `manifest.json` | Makes the app installable |
| `sw.js` | Service worker for offline use |
| `icons/` | App icons |
| `.github/workflows/pages.yml` | Auto-deploys to GitHub Pages on every push |

---

## Honest limits (relevant if you weigh a native app later)

- **Notifications**: the web can't reliably wake a *closed* site to fire a scheduled daily notification. It works while open and improves once installed, but a true "every morning at 8am even when closed" push needs a small server (web push) or a native wrapper. This is the main reason to consider going native.
- **Install prompt**: the Install button appears when the browser offers it (Chrome/Edge/Android). On iOS, install via Share → *Add to Home Screen*.

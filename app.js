/* =========================================================================
   FUTURE — app logic (photos, double-tap background, save-to-gallery)
   ========================================================================= */
(function () {
  "use strict";
  const { QUOTES, BACKGROUNDS, DEFAULT_BG } = window.SAID_DATA;
  const STORE = "future.v2";

  const def = { bgId: DEFAULT_BG, saved: [], custom: [], notify: false, reduceMotion: false };
  function load() { try { const r = localStorage.getItem(STORE); return r ? Object.assign({}, def, JSON.parse(r)) : Object.assign({}, def); } catch (e) { return Object.assign({}, def); } }
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  const state = load();

  const $ = (s) => document.querySelector(s);
  const norm = (q) => (typeof q === "string" ? { text: q } : { text: q.text });
  const idOf = (t) => "q" + Math.abs([].reduce.call(t, (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0));
  const bgById = (id) => BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
  const allQuotes = () => QUOTES.map(norm).concat(state.custom.map(norm));
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; };

  /* ---------- background ---------- */
  let bgActive = null;
  function setPhoto(src) {
    const a = document.getElementById("bgA"), b = document.getElementById("bgB");
    const cur = bgActive || a;
    const nxt = cur === a ? b : a;
    nxt.style.backgroundImage = 'url("' + src + '")';
    void nxt.offsetWidth;                 // reflow so the fade always runs
    nxt.classList.add("is-active");
    cur.classList.remove("is-active");
    bgActive = nxt;
  }
  function applyBackground(id) {
    const b = bgById(id);
    const root = document.documentElement.style;
    root.setProperty("--bg", b.bg);
    root.setProperty("--fg", b.fg);
    root.setProperty("--accent", b.accent);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", b.bg);
    if (b.image) {
      loadImg(b.image).then(() => {
        if (state.bgId !== id) return;
        setPhoto(b.image);
        root.setProperty("--scrim", "1");
        root.setProperty("--fg", "#ffffff");
      }).catch(() => {});
    } else {
      const a = document.getElementById("bgA"), bb = document.getElementById("bgB");
      a.classList.remove("is-active"); bb.classList.remove("is-active"); bgActive = null;
      root.setProperty("--scrim", "0");
    }
  }
  function cycleBackground() {
    const i = BACKGROUNDS.findIndex((b) => b.id === state.bgId);
    const nb = BACKGROUNDS[(i + 1) % BACKGROUNDS.length];
    state.bgId = nb.id; persist(); applyBackground(nb.id);
  }

  /* ---------- deck (with history so you can go back) ---------- */
  let pool = [], history = [], hIndex = -1, current = null;
  function reshuffle() { pool = allQuotes().slice(); for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; } }
  function drawNew() { if (!pool.length) reshuffle(); return pool.pop(); }
  function next() {
    if (hIndex < history.length - 1) hIndex++;
    else { history.push(drawNew()); hIndex = history.length - 1; }
    current = history[hIndex]; render();
  }
  function prev() {
    if (hIndex <= 0) return false;
    hIndex--; current = history[hIndex]; render(); return true;
  }
  function showQuote(q) {
    history.push({ text: q.text }); hIndex = history.length - 1; current = history[hIndex]; render();
  }
  function render() {
    $("#quoteText").textContent = current.text;
    $("#saveBtn").setAttribute("aria-pressed", String(state.saved.some((s) => s.id === idOf(current.text))));
    const w = $("#quoteWrap"); w.classList.remove("is-entering"); void w.offsetWidth;
    if (!state.reduceMotion) w.classList.add("is-entering");
  }

  /* ---------- save line ---------- */
  function toggleSave() {
    if (!current) return;
    const id = idOf(current.text);
    const i = state.saved.findIndex((s) => s.id === id);
    if (i >= 0) { state.saved.splice(i, 1); toast("Removed"); }
    else { state.saved.unshift({ id, text: current.text }); toast("Saved"); }
    persist(); render();
  }

  /* ---------- compose quote + photo into one image ---------- */
  function wrap(ctx, text, maxW) {
    const words = text.split(" "); const lines = []; let line = "";
    for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line); return lines;
  }
  async function composeImage() {
    const W = 1080, H = 1920;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const b = bgById(state.bgId);
    let photo = null;
    if (b.image) { try { photo = await loadImg(b.image); } catch (e) { photo = null; } }
    const fg = photo ? "#FFFFFF" : b.fg;
    if (photo) {
      const ar = photo.width / photo.height, AR = W / H; let dw, dh, dx, dy;
      if (ar > AR) { dh = H; dw = H * ar; dx = (W - dw) / 2; dy = 0; } else { dw = W; dh = W / ar; dx = 0; dy = (H - dh) / 2; }
      ctx.drawImage(photo, dx, dy, dw, dh);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(0,0,0,.25)"); g.addColorStop(1, "rgba(0,0,0,.7)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else { ctx.fillStyle = b.bg; ctx.fillRect(0, 0, W, H); }

    try { await document.fonts.load('700 84px "Space Grotesk"'); } catch (e) {}
    const pad = 96, maxW = W - pad * 2;
    let size = 84; ctx.font = '700 ' + size + 'px "Space Grotesk", sans-serif';
    let lines = wrap(ctx, current.text, maxW);
    while (lines.length * size * 1.16 > H * 0.5 && size > 44) { size -= 6; ctx.font = '700 ' + size + 'px "Space Grotesk", sans-serif'; lines = wrap(ctx, current.text, maxW); }
    const lh = size * 1.16, blockH = lines.length * lh;
    const startY = H * 0.6 - blockH / 2 + size * 0.8;
    ctx.fillStyle = fg; ctx.textAlign = "left";
    lines.forEach((ln, i) => ctx.fillText(ln, pad, startY + i * lh));
    // byline
    try { ctx.letterSpacing = "5px"; } catch (e) {}
    ctx.font = '700 30px "Space Grotesk", sans-serif';
    ctx.fillStyle = photo ? "rgba(255,255,255,.82)" : hexA(b.fg, 0.7);
    ctx.textAlign = "right";
    ctx.fillText("FUTURE", W - pad, startY + (lines.length - 1) * lh + 62);
    try { ctx.letterSpacing = "0px"; } catch (e) {}
    return await new Promise((res) => c.toBlob(res, "image/png", 0.95));
  }

  let lastBlob = null;
  async function openShareModal() {
    if (!current) return;
    $("#modal").hidden = false;
    $("#shareImg").removeAttribute("src");
    try { lastBlob = await composeImage(); $("#shareImg").src = URL.createObjectURL(lastBlob); }
    catch (e) { toast("Couldn't build image"); }
  }
  async function saveImage() {
    try {
      const blob = lastBlob || await composeImage();
      const file = new File([blob], "future.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return; }
        catch (e) { if (e && e.name === "AbortError") return; }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "future.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast("Image saved");
    } catch (e) { toast("Couldn't save"); }
  }
  async function copyText() {
    try { await navigator.clipboard.writeText('"' + current.text + '"\n\n— Future\n' + location.href); toast("Copied"); }
    catch (e) { toast("Couldn't copy"); }
  }

  /* ---------- menu + panels ---------- */
  const panels = ["saved", "backgrounds", "credits", "settings"];
  function openMenu() { $("#menu").hidden = false; }
  function closeMenu() { $("#menu").hidden = true; }
  function showPanel(name) {
    panels.forEach((p) => { $("#panel-" + p).hidden = p !== name; });
    if (name === "saved") renderSaved();
    if (name === "backgrounds") renderBackgrounds();
  }
  function renderSaved() {
    const list = $("#savedList"), empty = $("#savedEmpty"), hint = $("#savedHint"); list.innerHTML = "";
    empty.hidden = state.saved.length > 0;
    if (hint) hint.hidden = state.saved.length === 0;
    state.saved.forEach((s) => {
      const el = document.createElement("div"); el.className = "saved-item"; el.setAttribute("role", "button"); el.tabIndex = 0;
      const q = document.createElement("p"); q.className = "saved-item__q"; q.textContent = s.text;
      const rm = document.createElement("button"); rm.className = "saved-item__rm"; rm.textContent = "Remove";
      rm.addEventListener("click", (ev) => { ev.stopPropagation(); const i = state.saved.findIndex((x) => x.id === s.id); if (i >= 0) state.saved.splice(i, 1); persist(); renderSaved(); render(); });
      const open = () => { showQuote(s); closeMenu(); };
      el.addEventListener("click", open);
      el.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); } });
      el.appendChild(q); el.appendChild(rm); list.appendChild(el);
    });
  }
  function renderBackgrounds() {
    const grid = $("#bgGrid"); grid.innerHTML = "";
    BACKGROUNDS.forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "bg-swatch" + (b.id === state.bgId ? " is-current" : "");
      btn.style.background = b.bg; btn.textContent = b.name;
      if (b.image) loadImg(b.image).then(() => { btn.style.backgroundImage = "url(" + b.image + ")"; }).catch(() => {});
      btn.addEventListener("click", () => { state.bgId = b.id; persist(); applyBackground(b.id); renderBackgrounds(); });
      grid.appendChild(btn);
    });
  }
  function submitAdd() {
    const t = $("#addText").value.trim();
    if (!t) { $("#addNote").textContent = "Type a line first."; return; }
    state.custom.push({ text: t }); persist();
    $("#addText").value = ""; $("#addNote").textContent = "Added. It will show up in the deck.";
    reshuffle(); setTimeout(() => { $("#addNote").textContent = ""; }, 2500);
  }
  async function exportLines() {
    if (!state.custom.length) { toast("No added lines yet"); return; }
    const body = state.custom.map((q) => "  " + JSON.stringify(q.text) + ",").join("\n");
    try { await navigator.clipboard.writeText(body); toast("Copied " + state.custom.length + " line" + (state.custom.length > 1 ? "s" : "")); }
    catch (e) { toast("Couldn't copy"); }
  }

  /* ---------- gestures: swipe = next, double-tap = background (Pointer Events, all OSes) ---------- */
  function attachGestures() {
    const deck = $("#deck");
    const card = () => $("#quoteWrap");
    const THRESH = 64;          // min flick distance to advance
    let sx = 0, sy = 0, dx = 0, dy = 0, active = false, moved = false, pid = null, lastTap = 0;

    const reset = () => { const c = card(); c.style.transition = ""; c.style.transform = ""; c.style.opacity = ""; };

    const start = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      active = true; moved = false; pid = e.pointerId;
      sx = e.clientX; sy = e.clientY; dx = 0; dy = 0;
      try { deck.setPointerCapture(e.pointerId); } catch (_) {}
      card().style.transition = "none";
    };
    const move = (e) => {
      if (!active || e.pointerId !== pid) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 6) moved = true;
      if (moved) {
        card().style.transform = "translate(" + dx * 0.7 + "px," + dy * 0.7 + "px)";
        card().style.opacity = String(1 - Math.min(Math.hypot(dx, dy) / 320, 0.55));
      }
    };
    const end = (e) => {
      if (!active || (e && e.pointerId !== pid)) return;
      active = false;
      const dist = Math.hypot(dx, dy);
      if (moved && dist > THRESH) {
        hideHint();
        const horizontal = Math.abs(dx) > Math.abs(dy);
        const goPrev = !horizontal && dy < 0;       // swipe up = previous
        if (goPrev && hIndex <= 0) { reset(); return; }  // nothing before → snap back
        const k = 760 / (dist || 1), c = card();
        if (!state.reduceMotion) {
          c.style.transition = "transform .26s var(--ease), opacity .26s var(--ease)";
          c.style.transform = "translate(" + dx * k + "px," + dy * k + "px)";
          c.style.opacity = "0";
        }
        setTimeout(() => { reset(); if (goPrev) prev(); else next(); }, state.reduceMotion ? 0 : 230);
      } else if (!moved) {
        // a stationary tap: double-tap cycles the background, single tap does nothing
        const now = Date.now();
        reset();
        if (now - lastTap < 300) { lastTap = 0; cycleBackground(); }
        else lastTap = now;
      } else reset();
    };

    deck.addEventListener("pointerdown", start);
    deck.addEventListener("pointermove", move);
    deck.addEventListener("pointerup", end);
    deck.addEventListener("pointercancel", end);
    deck.addEventListener("pointerleave", (e) => { if (active) end(e); });
  }

  function hideHint() { const h = $("#hint"); if (h) h.classList.add("is-gone"); }

  /* ---------- toast ---------- */
  let tt; function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("is-shown"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("is-shown"), 1500); }

  /* ---------- motion / notify / install ---------- */
  function applyMotion() { document.body.classList.toggle("reduce-motion", state.reduceMotion); $("#motionToggle").setAttribute("aria-checked", String(state.reduceMotion)); }
  let ni = null;
  function startNudge() {
    stopNudge();
    const fire = () => {
      const last = localStorage.getItem("future.lastNudge"), today = new Date().toDateString();
      if (last === today) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const a = allQuotes(); const q = a[(Math.random() * a.length) | 0];
      new Notification("Futurelations", { body: q.text, icon: "icons/icon-192.png" });
      localStorage.setItem("future.lastNudge", today);
    };
    fire(); ni = setInterval(fire, 36e5);
  }
  function stopNudge() { if (ni) { clearInterval(ni); ni = null; } }
  async function toggleNotify() {
    if (!state.notify) {
      if (!("Notification" in window)) { toast("Not supported here"); return; }
      const p = await Notification.requestPermission();
      if (p !== "granted") { toast("Permission denied"); return; }
      state.notify = true; persist(); $("#notifyToggle").setAttribute("aria-checked", "true"); startNudge(); toast("Daily line on");
    } else { state.notify = false; persist(); $("#notifyToggle").setAttribute("aria-checked", "false"); stopNudge(); toast("Daily line off"); }
  }
  let dp = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); dp = e; $("#installRow").hidden = false; });
  async function install() { if (!dp) { toast("Use Add to Home Screen"); return; } dp.prompt(); await dp.userChoice; dp = null; $("#installRow").hidden = true; }

  /* ---------- init ---------- */
  function init() {
    applyBackground(state.bgId); applyMotion();
    reshuffle(); next(); attachGestures();

    $("#saveBtn").addEventListener("click", toggleSave);
    $("#shareBtn").addEventListener("click", openShareModal);
    $("#menuBtn").addEventListener("click", openMenu);

    document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeMenu));
    document.querySelectorAll(".menu-link").forEach((l) => l.addEventListener("click", () => showPanel(l.dataset.panel)));

    $("#notifyToggle").addEventListener("click", toggleNotify);
    $("#motionToggle").addEventListener("click", () => { state.reduceMotion = !state.reduceMotion; persist(); applyMotion(); });
    $("#installBtn").addEventListener("click", install);

    $("#saveImgBtn").addEventListener("click", saveImage);
    $("#copyBtn").addEventListener("click", copyText);
    $("#modalClose").addEventListener("click", () => $("#modal").hidden = true);
    document.querySelector("[data-close-modal]").addEventListener("click", () => $("#modal").hidden = true);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { $("#modal").hidden = true; closeMenu(); return; }
      if ($("#menu").hidden && $("#modal").hidden) {
        if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); hideHint(); next(); }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); hideHint(); prev(); }
        if (e.key.toLowerCase() === "s") toggleSave();
        if (e.key.toLowerCase() === "b") { hideHint(); cycleBackground(); }
      }
    });

    setTimeout(hideHint, 5000);   // hint fades on its own if unused

    if (state.notify && "Notification" in window && Notification.permission === "granted") { $("#notifyToggle").setAttribute("aria-checked", "true"); startNudge(); }
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  document.addEventListener("DOMContentLoaded", init);
})();

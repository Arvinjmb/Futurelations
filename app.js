/* =========================================================================
   FUTURE — app logic (clean version)
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

  /* ---------- background (color, or photo if the file exists) ---------- */
  function applyBackground(id) {
    const b = bgById(id);
    const root = document.documentElement.style;
    const stage = $("#stage");
    root.setProperty("--bg", b.bg);
    root.setProperty("--fg", b.fg);
    root.setProperty("--accent", b.accent);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", b.bg);
    // start on the solid color, then upgrade to a photo if one is present
    stage.style.backgroundImage = "none";
    stage.classList.remove("has-photo");
    if (b.image) {
      const test = new Image();
      test.onload = () => {
        if (state.bgId !== id) return;
        stage.style.backgroundImage = "url(" + b.image + ")";
        stage.classList.add("has-photo");
        root.setProperty("--fg", "#ffffff");      // white text over the scrim
      };
      test.onerror = () => {};
      test.src = b.image;
    }
  }

  /* ---------- deck ---------- */
  let pool = [], current = null;
  function reshuffle() {
    pool = allQuotes().slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  }
  function next() { if (!pool.length) reshuffle(); current = pool.pop(); render(); }
  function render() {
    $("#quoteText").textContent = current.text;
    const saved = state.saved.some((s) => s.id === idOf(current.text));
    $("#saveBtn").setAttribute("aria-pressed", String(saved));
    const w = $("#quoteWrap");
    w.classList.remove("is-entering"); void w.offsetWidth;
    if (!state.reduceMotion) w.classList.add("is-entering");
  }

  /* ---------- save / share ---------- */
  function toggleSave() {
    if (!current) return;
    const id = idOf(current.text);
    const i = state.saved.findIndex((s) => s.id === id);
    if (i >= 0) { state.saved.splice(i, 1); toast("Removed"); }
    else { state.saved.unshift({ id, text: current.text }); toast("Saved"); }
    persist(); render();
  }
  async function share() {
    if (!current) return;
    const payload = '"' + current.text + '"\n\n— Future said it';
    if (navigator.share) { try { await navigator.share({ text: payload, url: location.href }); return; } catch (e) {} }
    $("#shareQuote").textContent = current.text;
    $("#modal").hidden = false;
  }
  async function copyText() {
    try { await navigator.clipboard.writeText('"' + current.text + '"\n\n— Future said it\n' + location.href); toast("Copied"); }
    catch (e) { toast("Couldn't copy"); }
  }

  /* ---------- menu + panels ---------- */
  const panels = ["saved", "backgrounds", "add", "settings"];
  function openMenu() { $("#menu").hidden = false; }
  function closeMenu() { $("#menu").hidden = true; }
  function showPanel(name) {
    panels.forEach((p) => { $("#panel-" + p).hidden = p !== name; });
    document.querySelectorAll(".menu-link").forEach((l) => l.style.color = l.dataset.panel === name ? "var(--accent, #C5E063)" : "");
    if (name === "saved") renderSaved();
    if (name === "backgrounds") renderBackgrounds();
  }

  function renderSaved() {
    const list = $("#savedList"), empty = $("#savedEmpty");
    list.innerHTML = "";
    empty.hidden = state.saved.length > 0;
    state.saved.forEach((s) => {
      const el = document.createElement("div"); el.className = "saved-item";
      const q = document.createElement("p"); q.className = "saved-item__q"; q.textContent = s.text;
      const rm = document.createElement("button"); rm.className = "saved-item__rm"; rm.textContent = "Remove";
      rm.addEventListener("click", () => { const i = state.saved.findIndex((x) => x.id === s.id); if (i >= 0) state.saved.splice(i, 1); persist(); renderSaved(); render(); });
      el.appendChild(q); el.appendChild(rm); list.appendChild(el);
    });
  }

  function renderBackgrounds() {
    const grid = $("#bgGrid"); grid.innerHTML = "";
    BACKGROUNDS.forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "bg-swatch" + (b.id === state.bgId ? " is-current" : "");
      btn.style.background = b.bg;
      btn.textContent = b.name;
      if (b.image) { const t = new Image(); t.onload = () => { btn.style.backgroundImage = "url(" + b.image + ")"; }; t.src = b.image; }
      btn.addEventListener("click", () => { state.bgId = b.id; persist(); applyBackground(b.id); renderBackgrounds(); toast(b.name); });
      grid.appendChild(btn);
    });
  }

  function submitAdd() {
    const t = $("#addText").value.trim();
    if (!t) { $("#addNote").textContent = "Type a line first."; return; }
    state.custom.push({ text: t }); persist();
    $("#addText").value = ""; $("#addNote").textContent = "Added. It will show up in the deck.";
    reshuffle();
    setTimeout(() => { $("#addNote").textContent = ""; }, 2500);
  }

  /* ---------- swipe / tap to advance ---------- */
  function attachSwipe() {
    const deck = $("#deck");
    let sx = 0, sy = 0, dx = 0, on = false, moved = false;
    const card = () => $("#quoteWrap");
    const down = (x, y) => { sx = x; sy = y; dx = 0; on = true; moved = false; };
    const move = (x, y) => {
      if (!on) return; dx = x - sx; const dy = y - sy;
      if (Math.abs(dx) < Math.abs(dy)) return;
      if (!moved && Math.abs(dx) > 4) { moved = true; card().style.transition = "none"; }
      if (!moved) return;
      card().style.transform = "translateX(" + dx + "px)";
      card().style.opacity = String(1 - Math.min(Math.abs(dx) / 360, .5));
    };
    const reset = () => { const c = card(); c.style.transition = ""; c.style.transform = ""; c.style.opacity = ""; };
    const up = () => {
      if (!on) return; on = false;
      if (Math.abs(dx) > 80) {
        const dir = dx > 0 ? 1 : -1; const c = card();
        if (!state.reduceMotion) { c.style.transition = ""; c.style.transform = "translateX(" + dir * 500 + "px)"; c.style.opacity = "0"; }
        setTimeout(() => { reset(); next(); }, state.reduceMotion ? 0 : 260);
      } else reset();
    };
    deck.addEventListener("touchstart", (e) => down(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    deck.addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    deck.addEventListener("touchend", up);
    let md = false;
    deck.addEventListener("mousedown", (e) => { md = true; down(e.clientX, e.clientY); });
    window.addEventListener("mousemove", (e) => { if (md) move(e.clientX, e.clientY); });
    window.addEventListener("mouseup", () => { if (!md) return; md = false; if (moved) up(); else on = false; });
    deck.addEventListener("click", () => { if (!moved) next(); });
  }

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
      new Notification("Future said it", { body: q.text, icon: "icons/icon-192.png" });
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
    applyBackground(state.bgId);
    applyMotion();
    reshuffle(); next();
    attachSwipe();

    $("#saveBtn").addEventListener("click", toggleSave);
    $("#shareBtn").addEventListener("click", share);
    $("#menuBtn").addEventListener("click", () => { openMenu(); });

    document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeMenu));
    document.querySelectorAll(".menu-link").forEach((l) => l.addEventListener("click", () => showPanel(l.dataset.panel)));

    $("#addSubmit").addEventListener("click", submitAdd);
    $("#notifyToggle").addEventListener("click", toggleNotify);
    $("#motionToggle").addEventListener("click", () => { state.reduceMotion = !state.reduceMotion; persist(); applyMotion(); });
    $("#installBtn").addEventListener("click", install);

    $("#modalClose").addEventListener("click", () => $("#modal").hidden = true);
    document.querySelector("[data-close-modal]").addEventListener("click", () => $("#modal").hidden = true);
    $("#copyBtn").addEventListener("click", copyText);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { $("#modal").hidden = true; closeMenu(); return; }
      if ($("#menu").hidden && $("#modal").hidden) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
        if (e.key.toLowerCase() === "s") toggleSave();
      }
    });

    if (state.notify && "Notification" in window && Notification.permission === "granted") { $("#notifyToggle").setAttribute("aria-checked", "true"); startNudge(); }
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  document.addEventListener("DOMContentLoaded", init);
})();

/* =========================================================================
   FUTURE — app logic
   ========================================================================= */
(function () {
  "use strict";

  const { COLLECTIONS, DEFAULT_COLLECTION } = window.SAID_DATA;
  const STORE_KEY = "future.v1";

  /* ---------- persistent state ---------- */
  const defaultState = {
    collectionId: DEFAULT_COLLECTION,
    saved: [],
    custom: {},
    notify: false,
    reduceMotion: false
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? Object.assign({}, defaultState, JSON.parse(raw)) : Object.assign({}, defaultState);
    } catch (e) { return Object.assign({}, defaultState); }
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
  const state = load();

  /* ---------- helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const norm = (q) => (typeof q === "string" ? { text: q } : { text: q.text });
  const quoteId = (text) => "q" + Math.abs(hash(text));
  function hash(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; } return h; }
  function collectionById(id) { return COLLECTIONS.find((c) => c.id === id) || COLLECTIONS[0]; }
  function quotesFor(id) {
    const base = collectionById(id).quotes.map(norm);
    const extra = (state.custom[id] || []).map(norm);
    return base.concat(extra);
  }

  /* ---------- skin ---------- */
  function applySkin(id) {
    const c = collectionById(id);
    const root = document.documentElement.style;
    root.setProperty("--bg", c.bg);
    root.setProperty("--card", c.card);
    root.setProperty("--on-card", c.onCard);
    root.setProperty("--accent", c.accent);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", c.bg);
  }

  /* ---------- deck engine ---------- */
  let pool = [];
  let current = null;

  function reshuffle() {
    pool = quotesFor(state.collectionId).slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  function nextQuote() {
    if (!pool.length) reshuffle();
    current = pool.pop();
    renderCard(current);
  }

  function renderCard(q) {
    const card = $("#card");
    $("#quoteText").textContent = q.text;
    const id = quoteId(q.text);
    const isSaved = state.saved.some((s) => s.id === id);
    $("#saveBtn").setAttribute("aria-pressed", String(isSaved));
    $("#saveLabel").textContent = isSaved ? "Saved" : "Save";
    card.classList.remove("is-entering");
    void card.offsetWidth;
    if (!state.reduceMotion) card.classList.add("is-entering");
  }

  /* ---------- save ---------- */
  function toggleSave() {
    if (!current) return;
    const id = quoteId(current.text);
    const idx = state.saved.findIndex((s) => s.id === id);
    if (idx >= 0) { state.saved.splice(idx, 1); toast("Removed"); }
    else { state.saved.unshift({ id, text: current.text, collectionId: state.collectionId }); toast("Saved"); }
    save();
    renderCard(current);
  }

  /* ---------- share ---------- */
  async function share() {
    if (!current) return;
    const payload = `"${current.text}"\n\n— Future said it`;
    if (navigator.share) {
      try { await navigator.share({ text: payload, url: location.href }); return; }
      catch (e) { /* fall through */ }
    }
    openShareModal();
  }
  function openShareModal() {
    $("#shareQuote").textContent = current.text;
    $("#modal").hidden = false;
  }
  function closeModal() { $("#modal").hidden = true; }
  async function copyText() {
    const payload = `"${current.text}"\n\n— Future said it\n${location.href}`;
    try { await navigator.clipboard.writeText(payload); toast("Copied"); }
    catch (e) { toast("Couldn't copy"); }
  }

  /* ---------- saved view ---------- */
  function renderSaved() {
    const list = $("#savedList");
    const empty = $("#savedEmpty");
    list.innerHTML = "";
    if (!state.saved.length) {
      empty.hidden = false;
      $("#savedSub").textContent = "The lines you kept.";
      return;
    }
    empty.hidden = true;
    $("#savedSub").textContent = state.saved.length + (state.saved.length === 1 ? " line kept." : " lines kept.");
    state.saved.forEach((s) => {
      const el = document.createElement("div");
      el.className = "list-item";
      const q = document.createElement("p");
      q.className = "list-item__quote";
      q.textContent = s.text;
      const meta = document.createElement("div");
      meta.className = "list-item__meta";
      const a = document.createElement("span");
      a.className = "list-item__author";
      a.textContent = collectionById(s.collectionId).name;
      const rm = document.createElement("button");
      rm.className = "list-item__remove";
      rm.textContent = "Remove";
      rm.addEventListener("click", () => {
        const i = state.saved.findIndex((x) => x.id === s.id);
        if (i >= 0) state.saved.splice(i, 1);
        save(); renderSaved();
        if (current) renderCard(current);
      });
      meta.appendChild(a); meta.appendChild(rm);
      el.appendChild(q); el.appendChild(meta);
      list.appendChild(el);
    });
  }

  /* ---------- collections view ---------- */
  function renderCollections() {
    const grid = $("#collectionGrid");
    grid.innerHTML = "";
    COLLECTIONS.forEach((c) => {
      const count = quotesFor(c.id).length;
      const btn = document.createElement("button");
      btn.className = "collection-card" + (c.id === state.collectionId ? " is-current" : "");
      btn.style.background = c.bg;
      btn.innerHTML =
        '<span class="collection-card__swatch" style="background:' + c.accent + '"></span>' +
        '<div><div class="collection-card__name">' + c.name + '</div>' +
        '<div class="collection-card__count">' + count + ' lines</div></div>';
      btn.addEventListener("click", () => {
        state.collectionId = c.id;
        save();
        applySkin(c.id);
        reshuffle();
        nextQuote();
        showView("deck");
        toast(c.name);
      });
      grid.appendChild(btn);
    });
  }

  /* ---------- add view ---------- */
  function fillAddCollections() {
    const sel = $("#addCollection");
    sel.innerHTML = "";
    COLLECTIONS.forEach((c) => {
      const o = document.createElement("option");
      o.value = c.id; o.textContent = c.name;
      if (c.id === state.collectionId) o.selected = true;
      sel.appendChild(o);
    });
  }
  function submitAdd() {
    const text = $("#addText").value.trim();
    const cid = $("#addCollection").value;
    if (!text) { $("#addNote").textContent = "Type a line first."; return; }
    if (!state.custom[cid]) state.custom[cid] = [];
    state.custom[cid].push({ text });
    save();
    $("#addText").value = "";
    $("#addNote").textContent = "Added to " + collectionById(cid).name + ".";
    if (cid === state.collectionId) reshuffle();
    setTimeout(() => { $("#addNote").textContent = ""; }, 2500);
  }

  /* ---------- navigation ---------- */
  const views = ["deck", "saved", "collections", "add", "settings"];
  function showView(name) {
    views.forEach((v) => {
      const el = $("#view-" + v);
      const on = v === name;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-hidden", String(!on));
    });
    document.querySelectorAll(".menu__link").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.view === name);
    });
    if (name === "saved") renderSaved();
    if (name === "collections") renderCollections();
    if (name === "add") fillAddCollections();
  }

  /* ---------- menu ---------- */
  function openMenu() { $("#menu").hidden = false; $("#menuBtn").setAttribute("aria-expanded", "true"); }
  function closeMenu() { $("#menu").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false"); }

  /* ---------- swipe (bug-fixed: transition only suppressed during an actual drag) ---------- */
  function attachSwipe() {
    const card = $("#card");
    let startX = 0, startY = 0, dx = 0, dragging = false, moved = false;

    const down = (x, y) => { startX = x; startY = y; dx = 0; dragging = true; moved = false; };
    const move = (x, y) => {
      if (!dragging) return;
      dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dx) < Math.abs(dy)) return;
      if (!moved && Math.abs(dx) > 4) { moved = true; card.style.transition = "none"; }
      if (!moved) return;
      card.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 28) + "deg)";
      card.style.opacity = String(1 - Math.min(Math.abs(dx) / 380, 0.45));
    };
    const reset = () => { card.style.transition = ""; card.style.transform = ""; card.style.opacity = ""; };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 90) {
        const dir = dx > 0 ? 1 : -1;
        if (!state.reduceMotion) {
          card.classList.add("is-leaving");
          card.style.transition = "";
          card.style.transform = "translateX(" + (dir * 520) + "px) rotate(" + (dir * 16) + "deg)";
          card.style.opacity = "0";
        }
        setTimeout(() => { card.classList.remove("is-leaving"); reset(); nextQuote(); }, state.reduceMotion ? 0 : 300);
      } else {
        reset();
      }
    };

    card.addEventListener("touchstart", (e) => down(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    card.addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    card.addEventListener("touchend", up);

    let mouseDown = false;
    card.addEventListener("mousedown", (e) => { mouseDown = true; down(e.clientX, e.clientY); });
    window.addEventListener("mousemove", (e) => { if (mouseDown) move(e.clientX, e.clientY); });
    window.addEventListener("mouseup", () => { if (!mouseDown) return; mouseDown = false; if (moved) up(); else dragging = false; });

    // plain tap (no real drag) advances
    card.addEventListener("click", () => { if (!moved) nextQuote(); });
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-shown"), 1600);
  }

  /* ---------- motion ---------- */
  function applyMotionPref() {
    document.body.classList.toggle("reduce-motion", state.reduceMotion);
    $("#motionToggle").setAttribute("aria-checked", String(state.reduceMotion));
  }

  /* ---------- notifications (best-effort, local) ---------- */
  let notifyInterval = null;
  function startDailyNudge() {
    stopDailyNudge();
    const fire = () => {
      const last = localStorage.getItem("future.lastNudge");
      const today = new Date().toDateString();
      if (last === today) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const all = quotesFor(state.collectionId);
      const q = norm(all[Math.floor(Math.random() * all.length)]);
      new Notification("Future said it", { body: q.text, icon: "icons/icon-192.png" });
      localStorage.setItem("future.lastNudge", today);
    };
    fire();
    notifyInterval = setInterval(fire, 60 * 60 * 1000);
  }
  function stopDailyNudge() { if (notifyInterval) { clearInterval(notifyInterval); notifyInterval = null; } }

  async function toggleNotify() {
    if (!state.notify) {
      if (!("Notification" in window)) { toast("Not supported here"); return; }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast("Permission denied"); return; }
      state.notify = true; save();
      $("#notifyToggle").setAttribute("aria-checked", "true");
      startDailyNudge();
      toast("Daily line on");
    } else {
      state.notify = false; save();
      $("#notifyToggle").setAttribute("aria-checked", "false");
      stopDailyNudge();
      toast("Daily line off");
    }
  }

  /* ---------- PWA install ---------- */
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferredPrompt = e; $("#installRow").hidden = false;
  });
  async function doInstall() {
    if (!deferredPrompt) { toast("Use your browser's Add to Home Screen"); return; }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("#installRow").hidden = true;
  }

  /* ---------- wire up ---------- */
  function init() {
    applySkin(state.collectionId);
    applyMotionPref();
    reshuffle();
    nextQuote();
    attachSwipe();

    $("#nextBtn").addEventListener("click", nextQuote);
    $("#saveBtn").addEventListener("click", toggleSave);
    $("#shareBtn").addEventListener("click", share);
    $("#homeBtn").addEventListener("click", () => { closeMenu(); showView("deck"); });

    $("#menuBtn").addEventListener("click", () => {
      if ($("#menu").hidden) openMenu(); else closeMenu();
    });
    $("#menuBackdrop").addEventListener("click", closeMenu);
    document.querySelectorAll(".menu__link").forEach((b) => {
      b.addEventListener("click", () => { showView(b.dataset.view); closeMenu(); });
    });

    $("#addSubmit").addEventListener("click", submitAdd);
    $("#notifyToggle").addEventListener("click", toggleNotify);
    $("#motionToggle").addEventListener("click", () => { state.reduceMotion = !state.reduceMotion; save(); applyMotionPref(); });
    $("#installBtn").addEventListener("click", doInstall);

    $("#modalClose").addEventListener("click", closeModal);
    $("#modalBackdrop").addEventListener("click", closeModal);
    $("#copyBtn").addEventListener("click", copyText);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeModal(); closeMenu(); return; }
      if ($("#view-deck").classList.contains("is-active") && $("#menu").hidden && $("#modal").hidden) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextQuote(); }
        if (e.key.toLowerCase() === "s") toggleSave();
      }
    });

    if (state.notify && "Notification" in window && Notification.permission === "granted") {
      $("#notifyToggle").setAttribute("aria-checked", "true");
      startDailyNudge();
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

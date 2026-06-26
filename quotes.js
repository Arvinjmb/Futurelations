/* =========================================================================
   FUTURE — CONTENT FILE  (edit this one file)
   -------------------------------------------------------------------------
   QUOTES      one flat list of lines. Every line shows signed "FUTURE".
               A line is a plain string, or { text: "..." }.
               These are original lines — replace with anything you have the
               right to use. (Song lyrics are copyrighted; your own writing,
               public-domain text, or licensed lines are safe.)

   BACKGROUNDS four backgrounds the user can pick from. Each has:
               bg     solid color (shown if no image)
               fg     text color on that background
               accent small highlight color
               image  optional photo slot — drop a file at this path and it
                      takes over automatically (e.g. images/bg-1.jpg).
                      Until a file exists, the solid color is used.
   ========================================================================= */

const QUOTES = [
  // Empty. Add your lines here, one per line, like:  "Your line here",
  // Keep the [ above and the ]; below. Each line needs quotes and a comma.
];

const _IMG = (typeof window !== "undefined" && window.SAID_BG_IMAGES) || {};
const BACKGROUNDS = [
  { id: "bg1", name: "Mirror", pos: "center", bg: "#242525", fg: "#FFFFFF", accent: "#FFFFFF", image: _IMG.bg1 || "images/bg-1.jpg" },
  { id: "bg2", name: "Eagle",  pos: "bottom", bg: "#1F1818", fg: "#FFFFFF", accent: "#FFFFFF", image: _IMG.bg2 || "images/bg-2.jpg" },
  { id: "bg3", name: "Hood",   pos: "top",    bg: "#312D21", fg: "#FFFFFF", accent: "#FFFFFF", image: _IMG.bg3 || "images/bg-3.jpg" },
  { id: "bg4", name: "Chef",   pos: "top",    bg: "#424242", fg: "#FFFFFF", accent: "#FFFFFF", image: _IMG.bg4 || "images/bg-4.jpg" }
];

const DEFAULT_BG = "bg1";

if (typeof window !== "undefined") {
  window.SAID_DATA = { QUOTES, BACKGROUNDS, DEFAULT_BG };
}

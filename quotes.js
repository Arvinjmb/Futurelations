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
  "Start before you feel ready. Ready is a feeling that arrives after you begin.",
  "I am not lucky. I am early, consistent, and impossible to discourage.",
  "The future is just the present with the volume turned up.",
  "Build quietly. Let the results do the talking.",
  "Pressure made me. Comfort would have wasted me.",
  "You become what you repeat, so repeat the good days on purpose.",
  "I do not chase. I build, and the right things arrive.",
  "Make the move that scares the smaller version of you.",
  "Every closed door taught me which walls to build my own door into.",
  "Speed is a flex. Ship it, then sharpen it.",
  "I would rather be early and alone than late and crowded.",
  "Discipline is the loudest thing in a quiet room.",
  "Bet on the version of you that does the work, not the one that talks about it.",
  "Greatness is boring up close. It is the same thing done well, again.",
  "I stopped waiting for permission the day I realized no one was coming with it.",
  "Your name is a promise. Spend your life keeping it.",
  "Win in private long before you celebrate in public.",
  "The plan is simple: outlast the doubt.",
  "I do not fear the future. I am the one building it.",
  "Comparison is a thief, and I keep my doors locked.",
  "Talent opens the door. Showing up keeps it open.",
  "Be so consistent it looks like luck from the outside.",
  "The grind is not punishment. It is the price of becoming.",
  "I turned every no into raw material.",
  "Rest is part of the work, not a reward for finishing it.",
  "Choose the hard thing while it is still optional.",
  "Legends are just regular people who refused to quit on a Tuesday.",
  "I move like the future already happened and I am just catching up to it.",
  "Protect your focus like it is the only currency you have. It is.",
  "The crown was never given. It was outworked.",
  "Small steps still point at the summit.",
  "Doubt me quietly. I will answer loudly.",
  "I do not need the whole staircase, just the next step and the nerve.",
  "Make your future self proud, not your past self comfortable.",
  "Everything I wanted was on the other side of consistency.",
  "Be patient with the dream and impatient with the excuses.",
  "I am building something that does not need permission to exist.",
  "The work is the reward. The rest is just receipts.",
  "Stay in motion. The future does not wait, and neither do I.",
  "Tomorrow gets the best version of me, and so does today."
];

const BACKGROUNDS = [
  { id: "sunburst", name: "Sunburst", bg: "#DE8150", fg: "#1B1206", accent: "#1B1206", image: "images/bg-1.jpg" },
  { id: "orchid",   name: "Orchid",   bg: "#2C2342", fg: "#F2EEE4", accent: "#C9A9FF", image: "images/bg-2.jpg" },
  { id: "bone",     name: "Bone",     bg: "#ECE7DB", fg: "#1A1916", accent: "#B5832E", image: "images/bg-3.jpg" },
  { id: "ink",      name: "Ink",      bg: "#141318", fg: "#EDEAE0", accent: "#C5E063", image: "images/bg-4.jpg" }
];

const DEFAULT_BG = "sunburst";

if (typeof window !== "undefined") {
  window.SAID_DATA = { QUOTES, BACKGROUNDS, DEFAULT_BG };
}

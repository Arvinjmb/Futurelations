/* =========================================================================
   SAID — CONTENT FILE
   -------------------------------------------------------------------------
   This is the ONLY file you edit to change what the app says.
   Swap these collections for anything: a person, a fandom, stoic philosophy,
   gym lines, lyrics you have the rights to, your own writing — whatever.

   STRUCTURE
     id      a short unique key for the collection (used in storage + URLs)
     name    what the user sees
     accent  the highlight color for this collection's skin (hex)
     bg       the stage background for this skin (hex)
     card     the card surface color for this skin (hex)
     onCard   the text color on the card (hex)
     quotes  an array of lines. Each line is either:
               "just the text"                      → shows with no attribution
               { text: "...", author: "Name" }      → shows "— Name"

   The demo lines below are original placeholder content. Replace freely.
   ========================================================================= */

const COLLECTIONS = [
  {
    id: "momentum",
    name: "Momentum",
    accent: "#C5E063",
    bg: "#23241A",
    card: "#F4F1E6",
    onCard: "#23241A",
    quotes: [
      "Start before you feel ready. Ready is a feeling that arrives after you begin.",
      "The version of you that you want already exists. You reach them one boring rep at a time.",
      "Motion beats meditation when you are stuck. Move first, think while moving.",
      "You do not need a better plan. You need the next ten minutes.",
      "Speed is a feature. Ship the rough thing and let reality correct it.",
      "Discipline is just remembering what you actually want.",
      "Small and daily outruns big and rare.",
      "You are not behind. You are just early in a story you keep skipping to the end of.",
      "Pressure is a privilege. It means something is finally at stake.",
      "Do the thing badly until you can do the thing well. There is no other route.",
      "A streak is a promise you keep with yourself in public.",
      "Tired is not a reason. Tired is a weather report."
    ]
  },
  {
    id: "stillness",
    name: "Stillness",
    accent: "#7FB7BE",
    bg: "#1C2630",
    card: "#EAF2F0",
    onCard: "#16242B",
    quotes: [
      "Not every thought you have is asking to be answered.",
      "Rest is not a reward you earn. It is part of the work.",
      "You can let it be hard and still let it be fine.",
      "Slow is smooth. Smooth is fast.",
      "The quiet you are avoiding is where the good ideas live.",
      "You do not have to attend every argument you are invited to.",
      "Breathe like you have time. You usually do.",
      "Peace is not the absence of noise. It is choosing what you answer.",
      "Put the phone face down. The world will keep its shape.",
      "Some days the whole job is to stay kind and keep going.",
      "What you water grows. Be careful what you keep replaying.",
      "You are allowed to change your mind in private."
    ]
  },
  {
    id: "build",
    name: "Build",
    accent: "#E8743B",
    bg: "#241813",
    card: "#F6EDE3",
    onCard: "#241813",
    quotes: [
      "Taste is the gap between what you make and what you wish you made. Closing it is the whole job.",
      "Make the thing that only you would make. The market for that is small and loyal.",
      "Good work is mostly cut, not added.",
      "Constraints are not the enemy of creativity. They are the shape of it.",
      "Finish things. A finished bad thing teaches more than a perfect idea.",
      "Originality is just two old things standing closer than usual.",
      "Steal the structure, not the surface.",
      "If it is not a little embarrassing, you shipped it too late.",
      "The first draft is you telling yourself the story. The rest is for everyone else.",
      "Build for one real person, not the imaginary crowd.",
      "Quality is a habit, not an event.",
      "Your standards are a tool. Do not let them become a hiding place."
    ]
  },
  {
    id: "latenight",
    name: "Late Night",
    accent: "#8B7BE8",
    bg: "#16131F",
    card: "#ECE8F6",
    onCard: "#1B1626",
    quotes: [
      "Everyone you envy is also lying awake about something.",
      "You will not always feel like this. Write that down for the next bad night.",
      "The harshest voice in your head is rarely the most honest one.",
      "Comparison is just admiration pointed in the wrong direction.",
      "You are not the worst thing you have done at 2am in your own mind.",
      "Tomorrow gets a clean version of you. Tonight can be a mess.",
      "Half of growing up is forgiving yourself for the practice runs.",
      "The future you are scared of is built by the small choices you make awake right now.",
      "You can hold grief and gratitude in the same hand.",
      "Send the text in the morning. The night exaggerates everything.",
      "Being misunderstood is the tax on being early.",
      "Sleep is a decision, not an accident. Make it."
    ]
  }
];

/* The collection shown on first load. */
const DEFAULT_COLLECTION = "momentum";

if (typeof window !== "undefined") {
  window.SAID_DATA = { COLLECTIONS, DEFAULT_COLLECTION };
}

export type FAQ = { q: string; a: string; tags?: string[] };

export const FAQS: FAQ[] = [
  {
    q: "I can’t log into Canvas or the Student Portal.",
    a: "Reset your password first. If it still fails, contact the IT Service Desk with your student ID and a screenshot of the error.",
    tags: ["it", "canvas", "login", "password", "portal"],
  },
  {
    q: "How do I connect to campus Wi-Fi?",
    a: "Join the student network and sign in with your Swinburne credentials. If it keeps failing, forget the network and reconnect, or contact IT.",
    tags: ["wifi", "wi-fi", "internet", "network", "connection"],
  },
  {
    q: "The classroom AC or projector isn’t working.",
    a: "Log a Facilities request with the room number and a short photo/video.",
    tags: ["facilities", "classroom", "ac", "projector"],
  },
  {
    q: "Who do I call in an emergency?",
    a: "Call Campus Security on 082-260-607 (24/7). For life-threatening emergencies off-campus, dial 999.",
    tags: ["safety", "emergency", "security", "help"],
  },
  {
    q: "What are the library opening hours?",
    a: "See the current hours on the Library Help page.",
    tags: ["library", "hours", "study"],
  },
  {
    q: "Where can I get help with my studies?",
    a: "Start with Library Help; they can refer you to academic skills support.",
    tags: ["study", "academic", "support"],
  },
  {
    q: "How do I report a maintenance issue?",
    a: "Use the Facilities Helpdesk and include photos and the exact location.",
    tags: ["maintenance", "facilities", "report"],
  },
];

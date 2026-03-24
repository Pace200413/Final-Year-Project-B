/**
 * Single source of truth for all navigable campus destinations.
 * Used by: navigate page (cards), assistant (place matching), lib/navigation (href resolution).
 * Add new destinations here; the rest of the app will pick them up automatically.
 */
export type NavDestination = {
  key: string;
  title: string;
  href: string;
  aliases: string[];
};

export const NAV_DESTINATIONS: NavDestination[] = [
  {
    key: "maps",
    title: "Maps",
    href: "/navigate/map",
    aliases: ["map", "campus map", "360", "panorama", "route"],
  },
  {
    key: "mph",
    title: "Multi Purpose Hall",
    href: "/navigate/mph",
    aliases: ["mph", "multi purpose hall", "hall", "exam hall"],
  },
  {
    key: "atrium",
    title: "Borneo Atrium",
    href: "/navigate/borneoatrium",
    aliases: ["atrium", "borneo atrium", "borneo"],
  },
  {
    key: "HQ",
    title: "Student HQ",
    href: "/navigate/sHQ",
    aliases: ["hq", "student hq", "admin", "admin office", "help desk", "help", "info", "shq"],
  },
  {
    key: "library",
    title: "Library",
    href: "/navigate/library",
    aliases: ["library", "lib", "book"],
  },
  {
    key: "study",
    title: "Junction & Study Spaces",
    href: "/navigate/study",
    aliases: ["study", "junction", "study spaces", "study room", "junction building"],
  },
  {
    key: "gblock",
    title: "G Block",
    href: "/navigate/gblock",
    aliases: ["g block", "gblock", "block g", "it department", "student service"],
  },
  {
    key: "studenthub",
    title: "Student Hub",
    href: "/navigate/shub",
    aliases: ["student hub", "hub", "clubs", "hangout", "shub", "studenthub"],
  },
  {
    key: "dining",
    title: "Dining",
    href: "/navigate/dining",
    aliases: ["dining", "cafeteria", "food", "restaurant", "canteen", "breakfast", "lunch"],
  },
  {
    key: 'studentvillage',
    title: 'Student Village',
    href: '/navigate/studentvillage',
    aliases: ['student village', 'SV', 'village', 'sv', 'sv1', 'sv2', 'sv3'],
  },
];
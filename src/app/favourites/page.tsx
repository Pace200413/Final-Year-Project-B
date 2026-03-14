// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useBookmarks } from "@/lib/client";
// import type { CampusEvent } from "@/lib/types";
// import EventRow from "@/app/events/EventRow";
// import Image from "next/image";

// /* ---------- UTC-safe date helpers ---------- */
// function ymdUTC(iso: string) {
//   const d = new Date(iso);
//   return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
//     d.getUTCDate()
//   ).padStart(2, "0")}`;
// }

// function dayLabelUTC(key: string) {
//   const [y, m, d] = key.split("-").map(Number);
//   const dt = new Date(Date.UTC(y, m - 1, d));
//   const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   const MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const today = new Date();
//   const tk = ymdUTC(today.toISOString());
//   const tmr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
//   const tmk = ymdUTC(tmr.toISOString());
//   if (key === tk) return "Today";
//   if (key === tmk) return "Tomorrow";
//   return `${WD[dt.getUTCDay()]}, ${String(d).padStart(2, "0")} ${MN[dt.getUTCMonth()]} ${y}`;
// }

// function group(list: CampusEvent[]) {
//   const map = new Map<string, CampusEvent[]>();
//   for (const e of list) {
//     const k = ymdUTC(e.date);
//     if (!map.has(k)) map.set(k, []);
//     map.get(k)!.push(e);
//   }
//   return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
// }

// /* ---------- Hero ---------- */
// function HeroImage() {
//   const [error, setError] = useState(false);
//   const src = error ? "/images/swinburne-logo.jpg" : "/images/sample.jpg";
//   return (
//     <Image
//       src={src}
//       alt=""
//       fill
//       priority
//       onError={() => setError(true)}
//       className="object-cover saturate-[.9] contrast-[1.05]"
//     />
//   );
// }

// export default function FavouritesPage() {
//   const { ready, mounted, ids } = useBookmarks();

//   const bookmarkedEvents = useMemo(() => {
//     if (!mounted || !ready) return [];
//     const set = new Set(ids);
//     return EVENTS.filter((event) => set.has(event.id)).sort((a, b) => +new Date(a.date) - +new Date(b.date));
//   }, [mounted, ready, ids]);

//   const groups = useMemo(() => group(bookmarkedEvents), [bookmarkedEvents]);

//   if (!mounted || !ready) {
//     return (
//       <div className="min-h-screen">
//         <header className="relative h-[32vh] min-h-[220px] overflow-hidden">
//           <HeroImage />
//           <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-white/0" />
//           <div className="absolute bottom-4 left-0 right-0 maxw container-px">
//             <h1 className="text-white/95 text-[20px] font-semibold">Favourites</h1>
//             <p className="text-white/90 text-[13px]">Loading your saved events...</p>
//           </div>
//         </header>
//         <div className="maxw container-px pb-20">
//           <div className="text-[12px] text-slate-500 py-6">Loading...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen">
//       <header className="relative h-[32vh] min-h-[220px] overflow-hidden">
//         <HeroImage />
//         <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-white/0" />
//         <div className="absolute bottom-4 left-0 right-0 maxw container-px">
//           <h1 className="text-white/95 text-[20px] font-semibold">Favourites</h1>
//           <p className="text-white/90 text-[13px]">Your saved events ({bookmarkedEvents.length})</p>
//         </div>
//       </header>

//       <div className="maxw container-px pb-20">
//         {bookmarkedEvents.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-6xl mb-4">⭐</div>
//             <h2 className="text-lg font-medium text-slate-700 mb-2">You haven&apos;t saved any events yet</h2>
//             <p className="text-sm text-slate-500 mb-6">Bookmark events you&apos;re interested in to see them here.</p>
//             <button
//               onClick={() => (window.location.href = "/events/list")}
//               className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200"
//             >
//               Browse upcoming
//             </button>
//           </div>
//         ) : (
//           groups.map(([key, items]) => (
//             <div key={key} className="mb-2">
//               <div className="sticky top-[52px] z-[1] bg-white/90 backdrop-blur">
//                 <div className="flex items-center gap-2 text-[12px] font-medium text-slate-700 py-1">
//                   <span className="inline-block h-4 w-1.5 bg-[var(--brand-red,#D42A30)] rounded-sm" />
//                   <h2 suppressHydrationWarning>{dayLabelUTC(key)}</h2>
//                   <span className="text-[11px] text-slate-500">• {items.length}</span>
//                 </div>
//                 <div className="h-px bg-slate-200" />
//               </div>

//               <div className="divide-y divide-slate-200">
//                 {items.map((ev) => (
//                   <EventRow key={ev.id} ev={ev} />
//                 ))}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
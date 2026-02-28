import type { NavCard } from "@/lib/types";

export const NAV_CARDS_SEED: NavCard[] = [
  { id:'maps', title:'Maps', hint:'Map & 360 tours', href:'/navigate/map', icon:'map', order:1, enabled:true, description:'Interactive map with blue dots and 360° panoramas.' },
  { id:'dining', title:'Dining', hint:'Open now near you', href:'/navigate/dining', icon:'dining', order:2, enabled:true, hours:{ open:'07:00', close:'17:00' }, stallsCount:12, description:'Ground floor (chicken rice, noodles).' },
  { id:'study', title:'Study Spaces', hint:'Quiet / group rooms', href:'/navigate/study', icon:'study', order:3, enabled:true, hours:{ open:'00:00', close:'24:00' }, description:'Junction, charging area, discussion room.' },
  { id:'HQ', title:'Student HQ', hint:'Help desk & services', href:'/sHQ', icon:'hq', order:4, enabled:true, hours:{ open:'08:00', close:'17:00' }, description:'ID cards, enrolment support, fees & forms.' },
  { id:'mph', title:'Multi Purpose Hall', hint:'Events & assemblies', href:'/smph', icon:'mph', order:5, enabled:true, hours:{ open:'07:00', close:'23:00' }, description:'Venue bookings, exams, large events.' },
  { id:'studenthub', title:'Student Hub', hint:'Clubs & hangout space', href:'/shub', icon:'hub', order:6, enabled:true, hours:{ open:'07:00', close:'22:00' }, description:'Clubs, lounge areas, activity sign-ups.' },
  { id:'library', title:'Library', hint:'Resources & study zones', href:'/library', icon:'library', order:7, enabled:true, hours:{ open:'08:00', close:'21:30' }, description:'Quiet zone, self-checkout, opening hours.' },
  { id:'parking', title:'Parking', hint:'Closest lots', href:'/parking', icon:'parking', order:8, enabled:true, hours:{ open:'00:00', close:'24:00' }, description:'Multi level car parks available.' }
];

export const RANGES = ["24h", "7d", "30d", "All"] as const;
export type Range = (typeof RANGES)[number];

export const CITY_DIST = [
  { name: "Mumbai", value: 28 },
  { name: "Bengaluru", value: 22 },
  { name: "Delhi NCR", value: 18 },
  { name: "Chennai", value: 12 },
  { name: "Pune", value: 9 },
  { name: "Others", value: 11 },
];

export const VOLUNTEER_TREND = [
  { day: "Mon", hours: 142 }, { day: "Tue", hours: 168 }, { day: "Wed", hours: 154 },
  { day: "Thu", hours: 192 }, { day: "Fri", hours: 221 }, { day: "Sat", hours: 286 }, { day: "Sun", hours: 248 },
];

export const RECENT = [
  { id: 1, donor: "Hyatt Regency", area: "Andheri W, Mumbai",   meals: 80,  ngo: "Robin Hood Army",  status: "On route" },
  { id: 2, donor: "Sharma Wedding",  area: "Bandra, Mumbai",    meals: 30,  ngo: "Robin Hood Army",  status: "Delivered" },
  { id: 3, donor: "TCS Cafeteria",   area: "Powai, Mumbai",     meals: 120, ngo: "Feeding India",    status: "Confirmed" },
  { id: 4, donor: "Goonj HQ",        area: "Saket, Delhi",      meals: 65,  ngo: "Goonj",            status: "Delivered" },
  { id: 5, donor: "Mahindra Office", area: "Whitefield, BLR",   meals: 95,  ngo: "Akshaya Patra",    status: "On route" },
];

export type FeedItem = { id: string; donor: string; ngo: string; city: string; meals: number; timeAgo: string; karma: number };

const DONORS = ["Hyatt Regency", "Sharma Wedding", "TCS Cafeteria", "Aanya Kapoor", "ITC Maratha", "Infosys Mysore", "Goonj HQ", "Reliance Office", "Marriott", "Indigo Catering", "Wipro Pune"];
const NGO_NAMES = ["Robin Hood Army", "Feeding India", "Akshaya Patra", "Goonj", "Smile Foundation", "Helpage India"];
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Pune", "Hyderabad", "Kolkata"];

export function seedFeed(): FeedItem[] {
  return Array.from({ length: 8 }, () => randomEvent());
}

export function randomEvent(): FeedItem {
  return {
    id: Math.random().toString(36).slice(2),
    donor: DONORS[Math.floor(Math.random() * DONORS.length)],
    ngo: NGO_NAMES[Math.floor(Math.random() * NGO_NAMES.length)],
    city: CITIES[Math.floor(Math.random() * CITIES.length)],
    meals: [12, 24, 30, 45, 60, 80, 120][Math.floor(Math.random() * 7)],
    timeAgo: ["just now", "30s ago", "1 min ago", "2 min ago", "4 min ago"][Math.floor(Math.random() * 5)],
    karma: [40, 60, 80, 120, 200][Math.floor(Math.random() * 5)],
  };
}

export function buildSeries(range: Range) {
  const len = range === "24h" ? 12 : range === "7d" ? 7 : range === "30d" ? 30 : 12;
  const labels24 = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
  const labels7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const labelsAll = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const base = range === "24h" ? 240 : range === "7d" ? 1800 : range === "30d" ? 1400 : 28000;
  const span = range === "24h" ? 180 : range === "7d" ? 700 : range === "30d" ? 900 : 9000;
  return Array.from({ length: len }, (_, i) => {
    const noise = Math.sin(i * 0.9) * 0.4 + Math.cos(i * 0.4) * 0.2;
    const meals = Math.round(base + span * (0.5 + noise / 2 + Math.random() * 0.25));
    const pickups = Math.round(meals / (range === "All" ? 60 : 18) + Math.random() * 4);
    const label = range === "24h" ? labels24[i % 12] : range === "7d" ? labels7[i % 7] : range === "30d" ? `${i + 1}` : labelsAll[i % 12];
    return { label, meals, pickups };
  });
}

export function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

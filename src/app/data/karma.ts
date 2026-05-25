export type LevelKey = "seed" | "helper" | "changemaker" | "hero" | "legend";

export type Level = {
  key: LevelKey;
  name: string;
  emoji: string;
  threshold: number;
  color: string;
  ring: string;
};

export type ScoreRule = {
  key: string;
  label: string;
  points: number;
  count: number;
};

export type ScoreSource = ScoreRule & {
  weight: number;
};

export type Badge = {
  key: string;
  name: string;
  emoji: string;
  earned: boolean;
  description: string;
  unlockedAt?: string;
};

export type Milestone = {
  meals: number;
  reward: string;
  achieved: boolean;
};

export type DonationHistoryItem = {
  id: string;
  title: string;
  ngo: string;
  city: string;
  dateLabel: string;
  type: "food" | "emergency" | "campaign" | "milestone";
  meals: number;
  karma: number;
};

export type LeaderboardRow = {
  rank: number;
  name: string;
  city: string;
  karma: number;
  badge: string;
  avatar: string;
  level: LevelKey;
};

export const LEVELS: Level[] = [
  { key: "seed", name: "Seed", emoji: "🌱", threshold: 0, color: "#65B384", ring: "rgba(101,179,132,0.18)" },
  { key: "helper", name: "Helper", emoji: "🤝", threshold: 500, color: "#0F8F5F", ring: "rgba(15,143,95,0.18)" },
  { key: "changemaker", name: "Changemaker", emoji: "❤️", threshold: 1500, color: "#E5484D", ring: "rgba(229,72,77,0.18)" },
  { key: "hero", name: "Hero", emoji: "🏆", threshold: 5000, color: "#D4AF37", ring: "rgba(212,175,55,0.20)" },
  { key: "legend", name: "Legend", emoji: "👑", threshold: 15000, color: "#7C3AED", ring: "rgba(124,58,237,0.18)" },
];

export const SCORE_RULES: ScoreRule[] = [
  { key: "food", label: "Food donation", points: 50, count: 14 },
  { key: "emergency", label: "Emergency donation", points: 100, count: 3 },
  { key: "fundraiser", label: "QR fundraiser created", points: 150, count: 2 },
  { key: "milestone", label: "Milestone achievement", points: 200, count: 1 },
];

export const IMPACT_SUMMARY = {
  mealsDonated: 412,
  donationsCompleted: 17,
  campaignContributions: 9,
  familiesReached: 126,
  citiesHelped: 6,
  co2SavedKg: 156,
};

const totalFromRules = SCORE_RULES.reduce((sum, rule) => sum + rule.points * rule.count, 0);

export const SOURCES: ScoreSource[] = SCORE_RULES.map((rule) => ({
  ...rule,
  weight: totalFromRules === 0 ? 0 : (rule.points * rule.count) / totalFromRules,
}));

export const TOTAL_KARMA = totalFromRules;

export const BADGES: Badge[] = [
  { key: "first-donation", name: "First Donation", emoji: "🍱", earned: true, description: "Completed your very first food donation.", unlockedAt: "Apr 02, 2026" },
  { key: "hundred-meals", name: "100 Meals Saved", emoji: "💯", earned: true, description: "Reached 100 meals routed through verified NGOs.", unlockedAt: "Apr 18, 2026" },
  { key: "community-hero", name: "Community Hero", emoji: "🏆", earned: true, description: "Stayed active across multiple city donation drives.", unlockedAt: "May 03, 2026" },
  { key: "qr-fundraiser-creator", name: "QR Fundraiser Creator", emoji: "📱", earned: true, description: "Created a personal fundraiser and shared it publicly.", unlockedAt: "May 10, 2026" },
  { key: "ai-helper", name: "AI Helper", emoji: "✨", earned: true, description: "Used Setu AI to complete a matched pickup flow.", unlockedAt: "May 13, 2026" },
  { key: "top-donor", name: "Top Donor", emoji: "👑", earned: false, description: "Finish the month inside the city top 3 leaderboard." },
];

export const RECENT_UNLOCK = BADGES.find((badge) => badge.key === "community-hero") ?? BADGES[0];

export const MILESTONES: Milestone[] = [
  { meals: 10, reward: "Seed badge unlocked", achieved: true },
  { meals: 100, reward: "Helper tier reached", achieved: true },
  { meals: 250, reward: "Community Hero badge", achieved: true },
  { meals: 500, reward: "Hero tier progress boost", achieved: false },
  { meals: 1000, reward: "Legend leaderboard spotlight", achieved: false },
];

export const DONATION_HISTORY: DonationHistoryItem[] = [
  { id: "hist_1", title: "Wedding surplus pickup", ngo: "Robin Hood Army", city: "Mumbai", dateLabel: "2 days ago", type: "food", meals: 30, karma: 50 },
  { id: "hist_2", title: "Monsoon relief run", ngo: "Goonj", city: "Delhi NCR", dateLabel: "5 days ago", type: "emergency", meals: 60, karma: 100 },
  { id: "hist_3", title: "Office lunch rescue", ngo: "Feeding India", city: "Delhi NCR", dateLabel: "1 week ago", type: "food", meals: 42, karma: 50 },
  { id: "hist_4", title: "Campus fundraiser launch", ngo: "Akshaya Patra", city: "Bengaluru", dateLabel: "2 weeks ago", type: "campaign", meals: 0, karma: 150 },
  { id: "hist_5", title: "100 meals milestone", ngo: "DaanSetu", city: "Mumbai", dateLabel: "3 weeks ago", type: "milestone", meals: 100, karma: 200 },
];

export const LEADERBOARD_ROWS: LeaderboardRow[] = [
  { rank: 1, name: "Aanya Kapoor", city: "Mumbai", karma: 5460, badge: "🏆", avatar: "AK", level: "hero" },
  { rank: 2, name: "Rohan Verma", city: "Bengaluru", karma: 4812, badge: "❤️", avatar: "RV", level: "changemaker" },
  { rank: 3, name: "Priya Iyer", city: "Chennai", karma: 4266, badge: "❤️", avatar: "PI", level: "changemaker" },
  { rank: 4, name: "Satvik Mishra", city: "Mumbai", karma: TOTAL_KARMA, badge: "🤝", avatar: "SM", level: "helper" },
  { rank: 5, name: "Kabir Singh", city: "Delhi", karma: 1164, badge: "🤝", avatar: "KS", level: "helper" },
  { rank: 6, name: "Meera Joshi", city: "Pune", karma: 966, badge: "🌱", avatar: "MJ", level: "helper" },
  { rank: 7, name: "Aditya Rao", city: "Hyderabad", karma: 840, badge: "🌱", avatar: "AR", level: "helper" },
];

export function getCurrentLevel(karma: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (karma >= level.threshold) current = level;
  }
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] ?? null;
  const lower = current.threshold;
  const upper = next?.threshold ?? current.threshold;
  const pct = next ? Math.min(100, Math.round(((karma - lower) / (upper - lower)) * 100)) : 100;
  return { current, next, pct, idx };
}

export function getLevelByKey(key: LevelKey) {
  return LEVELS.find((level) => level.key === key) ?? LEVELS[0];
}

export function getImpactSummaryText() {
  return `${IMPACT_SUMMARY.mealsDonated} meals delivered across ${IMPACT_SUMMARY.citiesHelped} cities with ${IMPACT_SUMMARY.familiesReached} families reached so far.`;
}

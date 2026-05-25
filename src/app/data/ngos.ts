export type NGOCategory =
  | "Food Rescue"
  | "Child Hunger"
  | "Community Kitchen"
  | "Disaster Relief";

export type NGOUrgency = "High" | "Medium" | "Low";

export type NGOMetric = {
  label: string;
  value: string;
  detail: string;
};

export type NGOGalleryItem = {
  src: string;
  caption: string;
};

export type NGONeed = {
  title: string;
  detail: string;
  priority: "Immediate" | "This week" | "Ongoing";
  quantity: string;
};

export type NGOContact = {
  phone: string;
  email: string;
  address: string;
  website: string;
};

export type NGO = {
  id: string;
  name: string;
  city: string;
  category: NGOCategory;
  focus: string;
  urgency: NGOUrgency;
  mealsServed: number;
  verified: boolean;
  responseTime: string;
  description: string;
  mission: string;
  hero: string;
  profile: string;
  serviceAreas: string[];
  impactMetrics: NGOMetric[];
  gallery: NGOGalleryItem[];
  needs: NGONeed[];
  contact: NGOContact;
  trustBadges: string[];
  verifiedTags: string[];
};

export const NGO_CATEGORIES: NGOCategory[] = [
  "Food Rescue",
  "Child Hunger",
  "Community Kitchen",
  "Disaster Relief",
];

export const FOOD_TYPES = [
  "Cooked meals",
  "Dry ration kits",
  "Fresh produce",
  "Bakery items",
  "Packaged groceries",
  "Beverages",
];

export const NGOS: NGO[] = [
  {
    id: "robin-hood-army",
    name: "Robin Hood Army",
    city: "Mumbai",
    category: "Food Rescue",
    focus: "Surplus wedding, hotel, and cafeteria meals",
    urgency: "High",
    mealsServed: 124000,
    verified: true,
    responseTime: "18 min avg pickup",
    description: "A volunteer-led food rescue network that redirects fresh surplus meals to shelters, labour chowks, and night feeding points across Mumbai.",
    mission: "Stop perfectly edible food from going to waste and route it to people who need it most before the quality window closes.",
    hero: "From banquet leftovers to office cafeteria surplus, this team is built for fast same-day rescue across Mumbai's busiest neighbourhoods.",
    profile: "Robin Hood Army Mumbai runs hyperlocal volunteer clusters across Bandra, Andheri, Lower Parel, and Navi Mumbai. They specialise in cooked food pickups, quick dispatch, and same-night distribution for homeless communities and low-income families.",
    serviceAreas: ["Bandra", "Andheri", "Lower Parel", "Chembur", "Navi Mumbai"],
    impactMetrics: [
      { label: "Meals rescued", value: "1.24L", detail: "Verified across 14 city zones" },
      { label: "Pickup reliability", value: "98%", detail: "On-time volunteer arrivals" },
      { label: "Monthly donors", value: "420+", detail: "Hotels, caterers, offices" },
      { label: "Volunteer network", value: "128", detail: "Active coordinators this month" },
    ],
    gallery: [
      { src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80", caption: "Late-evening meal rescue from a wedding venue in Bandra." },
      { src: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1200&q=80", caption: "Volunteer sorting line before community distribution." },
      { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80", caption: "Ready-to-serve meal packs stacked for same-night delivery." },
    ],
    needs: [
      { title: "Cooked dinner trays", detail: "Freshly packed within 2 hours of preparation for same-night distribution.", priority: "Immediate", quantity: "40 to 150 meals" },
      { title: "Insulated food crates", detail: "Reusable containers for safe transport from events and hotels.", priority: "This week", quantity: "20 crates" },
      { title: "Weekend volunteers", detail: "Drivers and coordinators for Friday to Sunday evening rescue windows.", priority: "Ongoing", quantity: "12 volunteers" },
    ],
    contact: {
      phone: "+91 98330 11224",
      email: "mumbai@robinhoodarmy.org",
      address: "Santacruz support hub, Western Express Highway, Mumbai",
      website: "https://robinhoodarmy.com",
    },
    trustBadges: ["80G receipts", "FCRA compliant partner routing", "Food safety SOP trained", "Same-day handoff logs"],
    verifiedTags: ["Verified NGO", "Section 8", "FSSAI process trained"],
  },
  {
    id: "akshaya-patra",
    name: "Akshaya Patra",
    city: "Bengaluru",
    category: "Child Hunger",
    focus: "School nutrition and child meal access",
    urgency: "Medium",
    mealsServed: 982000,
    verified: true,
    responseTime: "Scheduled morning pickups",
    description: "One of India's largest child nutrition networks, serving high-volume school meal operations and nutrition support for underserved children.",
    mission: "Ensure no child is denied education because of hunger by building reliable daily meal access at scale.",
    hero: "Ideal for staple food donations, packaged groceries, and bulk support that can slot into structured child nutrition programs.",
    profile: "The Bengaluru team manages central kitchens, school delivery routes, and nutrition drives in peri-urban communities. They are best suited for dry rations, produce, and planned recurring donations that support breakfast and lunch operations.",
    serviceAreas: ["Yeshwanthpur", "Electronic City", "KR Puram", "Whitefield", "Mysuru Road"],
    impactMetrics: [
      { label: "Children fed", value: "9.82L", detail: "Across school programs and camps" },
      { label: "Kitchen capacity", value: "55k/day", detail: "Large-format production readiness" },
      { label: "Donor retention", value: "91%", detail: "Recurring support year over year" },
      { label: "Nutrition camps", value: "64", detail: "Community-led child support drives" },
    ],
    gallery: [
      { src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80", caption: "Breakfast service at a weekday school nutrition program." },
      { src: "https://images.unsplash.com/photo-1469571486292-b53601010376?auto=format&fit=crop&w=1200&q=80", caption: "Fresh produce sorting before kitchen dispatch." },
      { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80", caption: "Community volunteers packing child nutrition kits." },
    ],
    needs: [
      { title: "Dry ration packs", detail: "Rice, dal, oil, and protein staples for school-linked family support kits.", priority: "This week", quantity: "300 kits" },
      { title: "Fresh produce", detail: "Seasonal vegetables and fruits with next-day delivery windows.", priority: "Ongoing", quantity: "500 kg weekly" },
      { title: "Corporate meal sponsorship", detail: "Support recurring weekday child meal runs.", priority: "Ongoing", quantity: "Monthly commitments" },
    ],
    contact: {
      phone: "+91 99801 23145",
      email: "bengaluru@akshayapatra.org",
      address: "Hoskote central kitchen corridor, Bengaluru",
      website: "https://www.akshayapatra.org",
    },
    trustBadges: ["80G receipts", "Large kitchen audited", "Child safeguarding trained", "CSR onboarding ready"],
    verifiedTags: ["Verified NGO", "Scale-ready", "Central kitchen audited"],
  },
  {
    id: "goonj",
    name: "Goonj",
    city: "Delhi NCR",
    category: "Disaster Relief",
    focus: "Relief supplies and dignity kits for vulnerable communities",
    urgency: "High",
    mealsServed: 56000,
    verified: true,
    responseTime: "4 hour city mobilization",
    description: "A relief and redistribution network that channels urban surplus into high-need communities, especially during monsoon, heatwave, and emergency responses.",
    mission: "Convert surplus into dignity-led relief so communities can respond to crisis faster and rebuild with agency.",
    hero: "Best for dry food, packaged groceries, and fast-moving community support during weather events and displacement situations.",
    profile: "Goonj NCR coordinates city collection hubs, volunteer sorting, and dispatch pipelines to flood-affected belts and resettlement communities. They are equipped for organised, traceable relief collections rather than one-off cooked-meal pickups.",
    serviceAreas: ["Noida", "Ghaziabad", "East Delhi", "Faridabad", "Gurugram"],
    impactMetrics: [
      { label: "Relief families", value: "18.6k", detail: "Reached through dignity kits" },
      { label: "Rapid dispatches", value: "240+", detail: "Emergency runs in the last year" },
      { label: "Community hubs", value: "22", detail: "Sorting and distribution points" },
      { label: "Volunteer captains", value: "86", detail: "Emergency-ready coordinators" },
    ],
    gallery: [
      { src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80", caption: "Community sorting line for emergency ration distribution." },
      { src: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1200&q=80", caption: "Relief materials packed for monsoon dispatch." },
      { src: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1200&q=80", caption: "Volunteer-led dignity kit assembly at the NCR hub." },
    ],
    needs: [
      { title: "Packaged dry food", detail: "Rice, atta, dal, ready-to-cook staples for family kits.", priority: "Immediate", quantity: "600 family packs" },
      { title: "Sanitation support", detail: "Soap, sanitary pads, disinfectant, and hygiene add-ons for relief kits.", priority: "This week", quantity: "400 kits" },
      { title: "Transport sponsorship", detail: "Fuel and last-mile movement for district dispatches.", priority: "Ongoing", quantity: "8 weekly runs" },
    ],
    contact: {
      phone: "+91 98188 44102",
      email: "relief@goonj.org",
      address: "Mayur Vihar collection and response hub, Delhi NCR",
      website: "https://goonj.org",
    },
    trustBadges: ["80G receipts", "Emergency dispatch logs", "Inventory accountability", "District partner verified"],
    verifiedTags: ["Verified NGO", "Disaster response ready", "Audit-compliant"],
  },
  {
    id: "feeding-india",
    name: "Feeding India",
    city: "Delhi NCR",
    category: "Community Kitchen",
    focus: "Urban hunger relief and volunteer kitchen support",
    urgency: "Medium",
    mealsServed: 412000,
    verified: true,
    responseTime: "24 hour scheduling",
    description: "A large citizen movement tackling hunger through volunteer kitchens, ration drives, and city-wide distribution programs.",
    mission: "Make hunger visible, solvable, and locally actionable through volunteer-powered distribution systems.",
    hero: "A strong fit for planned meal drives, packaged groceries, recurring office pantry donations, and community kitchen support.",
    profile: "Feeding India Delhi NCR blends volunteer energy with structured city operations. Their teams coordinate community kitchens, recurring office donations, and neighbourhood meal drives, especially for children and migrant families.",
    serviceAreas: ["South Delhi", "Noida", "Gurugram", "Dwarka", "Ghaziabad"],
    impactMetrics: [
      { label: "Meals distributed", value: "4.12L", detail: "Across city campaigns and kitchens" },
      { label: "Kitchen partners", value: "34", detail: "Community meal production sites" },
      { label: "Donor NPS", value: "4.8/5", detail: "Post-donation satisfaction" },
      { label: "Volunteer hours", value: "9.4k", detail: "Logged in the last quarter" },
    ],
    gallery: [
      { src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80", caption: "Community kitchen service line during a weekend drive." },
      { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80", caption: "Packaged groceries staged for neighbourhood distribution." },
      { src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80", caption: "Volunteer briefing before a city hunger outreach run." },
    ],
    needs: [
      { title: "Cooked lunch batches", detail: "Pre-packed, sealed trays for afternoon distribution windows.", priority: "This week", quantity: "80 to 200 meals" },
      { title: "Corporate pantry surplus", detail: "Shelf-stable grocery support from office cafeterias and events.", priority: "Ongoing", quantity: "Weekly pickup slots" },
      { title: "Kitchen essentials", detail: "Cooking oil, pulses, and spice base stock for community kitchen runs.", priority: "Ongoing", quantity: "Monthly restock" },
    ],
    contact: {
      phone: "+91 98733 99521",
      email: "hello@feedingindia.org",
      address: "Saket volunteer coordination desk, Delhi NCR",
      website: "https://www.feedingindia.org",
    },
    trustBadges: ["80G receipts", "Volunteer verified", "Kitchen hygiene checklist", "Digital impact receipts"],
    verifiedTags: ["Verified NGO", "Community kitchen network", "Volunteer led"],
  },
  {
    id: "smile-foundation",
    name: "Smile Foundation",
    city: "Pune",
    category: "Child Hunger",
    focus: "Family nutrition and school-linked support",
    urgency: "Low",
    mealsServed: 78000,
    verified: true,
    responseTime: "Next-day pickup",
    description: "A child and family welfare organisation running nutrition interventions for underserved communities through school and community partners.",
    mission: "Strengthen child wellbeing by combining nutrition, education, and family support where the need is chronic rather than episodic.",
    hero: "Well suited for planned donations that support child nutrition, family grocery packs, and school-linked community outreach.",
    profile: "The Pune chapter partners with schools, anganwadi workers, and local volunteers to route nutrition support where chronic food insecurity impacts learning outcomes the most.",
    serviceAreas: ["Hadapsar", "Pimpri", "Kothrud", "Yerwada", "Wagholi"],
    impactMetrics: [
      { label: "Children supported", value: "32k+", detail: "Through nutrition-linked outreach" },
      { label: "School clusters", value: "19", detail: "Community-linked locations" },
      { label: "Nutrition kits", value: "8.6k", detail: "Distributed this year" },
      { label: "Family touchpoints", value: "11.2k", detail: "Recurring household support" },
    ],
    gallery: [
      { src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80", caption: "Nutrition support session with children and caregivers." },
      { src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80", caption: "School-linked family outreach in Pune communities." },
      { src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80", caption: "Child meal service at a community learning point." },
    ],
    needs: [
      { title: "Fortified snack packs", detail: "Nutrition-dense snacks for school-linked child support sessions.", priority: "This week", quantity: "1,000 packs" },
      { title: "Family ration support", detail: "Staple food kits for low-income households with school-going children.", priority: "Ongoing", quantity: "180 families" },
      { title: "Volunteer nutrition mentors", detail: "Weekend volunteers for child sessions and parent counselling.", priority: "Ongoing", quantity: "10 volunteers" },
    ],
    contact: {
      phone: "+91 97644 00851",
      email: "pune@smilefoundationindia.org",
      address: "Koregaon Park field office, Pune",
      website: "https://www.smilefoundationindia.org",
    },
    trustBadges: ["80G receipts", "Child-safe operations", "Program monitoring", "Community verification"],
    verifiedTags: ["Verified NGO", "Child-focused", "Education-linked"],
  },
  {
    id: "helpage-india",
    name: "Helpage India",
    city: "Chennai",
    category: "Community Kitchen",
    focus: "Elder nutrition and home-delivered support",
    urgency: "Medium",
    mealsServed: 64000,
    verified: true,
    responseTime: "Planned same-day routes",
    description: "Supports elder nutrition and last-mile food assistance for senior citizens living alone or with limited income support.",
    mission: "Protect the dignity, nutrition, and health of elderly people who are often invisible in mainstream donation systems.",
    hero: "A strong match for carefully packed cooked meals, dry groceries, and recurring support for elder-serving routes.",
    profile: "Helpage India's Chennai team coordinates with community workers and senior citizen support groups to route food and grocery support to older adults who may not be able to access public feeding lines.",
    serviceAreas: ["T Nagar", "Velachery", "Tambaram", "Anna Nagar", "Perambur"],
    impactMetrics: [
      { label: "Senior meals", value: "64k", detail: "Delivered across urban routes" },
      { label: "Home visits", value: "3.4k", detail: "Nutrition and wellbeing touchpoints" },
      { label: "Support circles", value: "27", detail: "Neighbourhood elder groups" },
      { label: "Route completion", value: "96%", detail: "On-schedule food delivery" },
    ],
    gallery: [
      { src: "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=80", caption: "Neighbourhood team preparing elder meal deliveries." },
      { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80", caption: "Volunteers organising grocery support for senior households." },
      { src: "https://images.unsplash.com/photo-1593113598332-cd59a93e9b78?auto=format&fit=crop&w=1200&q=80", caption: "Meal kits staged for assisted living and home visits." },
    ],
    needs: [
      { title: "Soft cooked meals", detail: "Easy-to-eat, low-spice meals packed for older adults.", priority: "Immediate", quantity: "60 meals daily" },
      { title: "Grocery baskets", detail: "Rice, oil, lentils, and health staples for monthly delivery.", priority: "Ongoing", quantity: "120 homes" },
      { title: "Medical nutrition add-ons", detail: "Sugar-free biscuits, fortified drinks, and basic supplements.", priority: "This week", quantity: "80 care packs" },
    ],
    contact: {
      phone: "+91 98409 27431",
      email: "chennai@helpageindia.org",
      address: "Anna Salai elder support office, Chennai",
      website: "https://www.helpageindia.org",
    },
    trustBadges: ["80G receipts", "Senior-safe distribution", "Medical referral partners", "Documented delivery logs"],
    verifiedTags: ["Verified NGO", "Senior support", "Doorstep delivery"],
  },
];

export const NGO_CITIES = Array.from(new Set(NGOS.map((ngo) => ngo.city)));

export function getNGOById(id: string) {
  return NGOS.find((ngo) => ngo.id === id);
}

export const QR_CAMPAIGNS = [
  { slug: "sample-campaign", title: "Sample Daan Campaign", goal: 75000, raised: 28500, city: "Pan-India", days: 30 },
  { slug: "monsoon-2026", title: "Monsoon Relief 2026", goal: 100000, raised: 64200, city: "Mumbai", days: 14 },
  { slug: "republic-day", title: "Republic Day Daan Drive", goal: 250000, raised: 188400, city: "Pan-India", days: 5 },
  { slug: "campus-feeds", title: "Campus Feeds", goal: 50000, raised: 32100, city: "Bengaluru", days: 21 },
  { slug: "wedding-surplus", title: "Wedding Surplus Saver", goal: 150000, raised: 96000, city: "Delhi NCR", days: 30 },
];

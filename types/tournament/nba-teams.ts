export interface Team {
  id: string;
  name: string;
  city: string;
  losses: number; // For double elimination tracking
  wins?: number; // Optional wins property for tracking
  logo?: string; // Optional logo URL or path
}

// Complete list of NBA teams (including Vancouver Grizzlies and Seattle SuperSonics)
export const teams: Team[] = [
  { id: "bos", name: "Celtics", city: "Boston", losses: 0 },
  { id: "bkn", name: "Nets", city: "Brooklyn", losses: 0 },
  { id: "ny", name: "Knicks", city: "New York", losses: 0 },
  { id: "phi", name: "76ers", city: "Philadelphia", losses: 0 },
  { id: "tor", name: "Raptors", city: "Toronto", losses: 0 },
  { id: "chi", name: "Bulls", city: "Chicago", losses: 0 },
  { id: "cle", name: "Cavaliers", city: "Cleveland", losses: 0 },
  { id: "det", name: "Pistons", city: "Detroit", losses: 0 },
  { id: "ind", name: "Pacers", city: "Indiana", losses: 0 },
  { id: "mil", name: "Bucks", city: "Milwaukee", losses: 0 },
  { id: "atl", name: "Hawks", city: "Atlanta", losses: 0 },
  { id: "cha", name: "Hornets", city: "Charlotte", losses: 0 },
  { id: "mia", name: "Heat", city: "Miami", losses: 0 },
  { id: "orl", name: "Magic", city: "Orlando", losses: 0 },
  { id: "wsh", name: "Wizards", city: "Washington", losses: 0 },
  { id: "den", name: "Nuggets", city: "Denver", losses: 0 },
  { id: "min", name: "Timberwolves", city: "Minnesota", losses: 0 },
  { id: "okc", name: "Thunder", city: "Oklahoma City", losses: 0 },
  { id: "por", name: "Trail Blazers", city: "Portland", losses: 0 },
  { id: "utah", name: "Jazz", city: "Utah", losses: 0 },
  { id: "gs", name: "Warriors", city: "Golden State", losses: 0 },
  { id: "lac", name: "Clippers", city: "Los Angeles", losses: 0 },
  { id: "lal", name: "Lakers", city: "Los Angeles", losses: 0 },
  { id: "phx", name: "Suns", city: "Phoenix", losses: 0 },
  { id: "sac", name: "Kings", city: "Sacramento", losses: 0 },
  { id: "dal", name: "Mavericks", city: "Dallas", losses: 0 },
  { id: "hou", name: "Rockets", city: "Houston", losses: 0 },
  { id: "mem", name: "Grizzlies", city: "Memphis", losses: 0 },
  { id: "no", name: "Pelicans", city: "New Orleans", losses: 0 },
  { id: "sa", name: "Spurs", city: "San Antonio", losses: 0 },
  // Added the two requested teams to complete 32 teams
  { id: "vb", name: "Bears", city: "Vancouver", losses: 0 },
  { id: "sea", name: "SuperSonics", city: "Seattle", losses: 0 }
];

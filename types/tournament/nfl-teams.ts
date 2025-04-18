export interface Team {
  id: string;
  name: string;
  city: string;
  losses: number; // For double elimination tracking
  wins?: number; // Optional wins property for tracking
  logo?: string; // Optional logo URL or path
}

// Complete list of all 32 NFL teams
export const teams: Team[] = [
  { id: "ne", name: "Patriots", city: "New England", losses: 0 },
  { id: "kc", name: "Chiefs", city: "Kansas City", losses: 0 },
  { id: "dal", name: "Cowboys", city: "Dallas", losses: 0 },
  { id: "sf", name: "49ers", city: "San Francisco", losses: 0 },
  { id: "gb", name: "Packers", city: "Green Bay", losses: 0 },
  { id: "buf", name: "Bills", city: "Buffalo", losses: 0 },
  { id: "pit", name: "Steelers", city: "Pittsburgh", losses: 0 },
  { id: "bal", name: "Ravens", city: "Baltimore", losses: 0 },
  { id: "cin", name: "Bengals", city: "Cincinnati", losses: 0 },
  { id: "cle", name: "Browns", city: "Cleveland", losses: 0 },
  { id: "ten", name: "Titans", city: "Tennessee", losses: 0 },
  { id: "ind", name: "Colts", city: "Indianapolis", losses: 0 },
  { id: "hou", name: "Texans", city: "Houston", losses: 0 },
  { id: "jax", name: "Jaguars", city: "Jacksonville", losses: 0 },
  { id: "lv", name: "Raiders", city: "Las Vegas", losses: 0 },
  { id: "lac", name: "Chargers", city: "Los Angeles", losses: 0 },
  { id: "den", name: "Broncos", city: "Denver", losses: 0 },
  { id: "nyj", name: "Jets", city: "New York", losses: 0 },
  { id: "mia", name: "Dolphins", city: "Miami", losses: 0 },
  { id: "phi", name: "Eagles", city: "Philadelphia", losses: 0 },
  { id: "nyg", name: "Giants", city: "New York", losses: 0 },
  { id: "wsh", name: "Commanders", city: "Washington", losses: 0 },
  { id: "det", name: "Lions", city: "Detroit", losses: 0 },
  { id: "chi", name: "Bears", city: "Chicago", losses: 0 },
  { id: "min", name: "Vikings", city: "Minnesota", losses: 0 },
  { id: "no", name: "Saints", city: "New Orleans", losses: 0 },
  { id: "tb", name: "Buccaneers", city: "Tampa Bay", losses: 0 },
  { id: "car", name: "Panthers", city: "Carolina", losses: 0 },
  { id: "atl", name: "Falcons", city: "Atlanta", losses: 0 },
  { id: "ari", name: "Cardinals", city: "Arizona", losses: 0 },
  { id: "lar", name: "Rams", city: "Los Angeles", losses: 0 },
  { id: "sea", name: "Seahawks", city: "Seattle", losses: 0 }
];

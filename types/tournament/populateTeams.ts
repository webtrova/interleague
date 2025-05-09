// types/tournament/populateTeams.ts

// Ordered list of teams as per the bracket image
export const bracketTeams: string[] = [
  "MARLINS",
  "DODGERS",
  "CARDINALS",
  "PADRES",
  "RED SOX",
  "ROCKIES",
  "RAYS",
  "GUARDIANS",
  "REDS",
  "ORIOLES",
  "MARINERS",
  "REP DOM",
  "GIANTS",
  "ASTROS",
  "ROYALS",
  "RANGERS",
  "NATIONALS",
  "BREWERS",
  "CUBS",
  "TWINS",
  "ANGELS",
  "PHILLIES",
  "WHITE SOX",
  "DIAMONDBACKS",
  "BLUE JAYS",
  "TIGERS",
  "BRAVES",
  "PUERTO RICO",
  "YANKEES",
  "METS",
  "ATHLETICS",
  "PIRATES"
];

// Optionally, export as objects for extensibility
export interface BracketTeam {
  name: string;
  seed?: number;
  // add other properties as needed
}

export const bracketTeamsObjects: BracketTeam[] = bracketTeams.map((name, idx) => ({
  name,
  seed: idx + 1,
}));

// Usage example:
// import { bracketTeams } from "@/types/tournament/populateTeams";
// bracketTeams.forEach(team => ...);

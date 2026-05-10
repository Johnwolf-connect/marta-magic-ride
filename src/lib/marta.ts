// MARTA rail lines + mock live data layer.
// In a future iteration this is fed by /api/public/marta-arrivals proxy
// hitting MARTA's GTFS-RT feed. For now, deterministic-but-lifelike data
// drives a flawless-feeling tracking experience.

export type RailLine = "RED" | "GOLD" | "BLUE" | "GREEN";

export const LINE_META: Record<RailLine, { name: string; color: string; token: string }> = {
  RED:   { name: "Red Line",   color: "marta-red",   token: "var(--marta-red)" },
  GOLD:  { name: "Gold Line",  color: "marta-gold",  token: "var(--marta-gold)" },
  BLUE:  { name: "Blue Line",  color: "marta-blue",  token: "var(--marta-blue)" },
  GREEN: { name: "Green Line", color: "marta-green", token: "var(--marta-green)" },
};

export interface Arrival {
  vehicleId: string;
  line: RailLine;
  destination: string;
  station: string;
  minutes: number;
  occupancy: "low" | "medium" | "high";
  doorSide: "left" | "right";
  delayed?: boolean;
}

const STATIONS = [
  "Five Points", "Peachtree Center", "Civic Center", "North Avenue",
  "Midtown", "Arts Center", "Lindbergh Center", "Buckhead", "Lenox",
  "Brookhaven", "Doraville", "Inman Park", "East Lake", "Decatur",
  "Avondale", "Indian Creek", "Garnett", "West End", "Oakland City",
  "Lakewood", "East Point", "College Park", "Airport",
];

function seeded(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getNextArrivals(now = new Date()): Arrival[] {
  const minute = now.getMinutes();
  const lines: RailLine[] = ["RED", "GOLD", "BLUE", "GREEN"];
  return lines.map((line, i) => {
    const r = seeded(minute + i * 13);
    const minutes = Math.max(1, Math.round(r * 14) + 1);
    const stationIdx = Math.floor(r * STATIONS.length);
    return {
      vehicleId: `${line.slice(0, 1)}${100 + Math.floor(r * 50)}`,
      line,
      destination: line === "RED" ? "North Springs" : line === "GOLD" ? "Doraville" : line === "BLUE" ? "Indian Creek" : "Bankhead",
      station: STATIONS[stationIdx],
      minutes,
      occupancy: r > 0.66 ? "high" : r > 0.33 ? "medium" : "low",
      doorSide: i % 2 === 0 ? "right" : "left",
      delayed: r > 0.85,
    };
  });
}

export function getPredictedNext(now = new Date()): Arrival {
  const arr = getNextArrivals(now);
  return arr.sort((a, b) => a.minutes - b.minutes)[0];
}

export interface RouteOption {
  id: "fastest" | "cheapest" | "greenest";
  title: string;
  subtitle: string;
  totalMinutes: number;
  fareCents: number;
  carbonSavedKg: number;
  legs: { kind: "walk" | "rail" | "bus"; line?: RailLine; from: string; to: string; minutes: number }[];
}

export function planRoutes(from: string, to: string): RouteOption[] {
  const base = (from + to).length;
  return [
    {
      id: "fastest",
      title: "Fastest",
      subtitle: "Skip transfers",
      totalMinutes: 18 + (base % 7),
      fareCents: 250,
      carbonSavedKg: 1.8,
      legs: [
        { kind: "walk", from: from || "You", to: "Midtown", minutes: 4 },
        { kind: "rail", line: "RED", from: "Midtown", to: "Five Points", minutes: 8 },
        { kind: "walk", from: "Five Points", to: to || "Destination", minutes: 6 },
      ],
    },
    {
      id: "cheapest",
      title: "Cheapest",
      subtitle: "Breeze ride",
      totalMinutes: 26 + (base % 5),
      fareCents: 250,
      carbonSavedKg: 2.1,
      legs: [
        { kind: "walk", from: from || "You", to: "Arts Center", minutes: 6 },
        { kind: "rail", line: "GOLD", from: "Arts Center", to: "Lindbergh", minutes: 10 },
        { kind: "bus", from: "Lindbergh", to: to || "Destination", minutes: 10 },
      ],
    },
    {
      id: "greenest",
      title: "Greenest",
      subtitle: "Lowest carbon",
      totalMinutes: 22 + (base % 6),
      fareCents: 250,
      carbonSavedKg: 3.4,
      legs: [
        { kind: "walk", from: from || "You", to: "North Avenue", minutes: 5 },
        { kind: "rail", line: "BLUE", from: "North Avenue", to: "Decatur", minutes: 14 },
        { kind: "walk", from: "Decatur", to: to || "Destination", minutes: 3 },
      ],
    },
  ];
}

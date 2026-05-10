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

export interface NearbyRoute {
  id: string;
  kind: "rail" | "bus";
  line?: RailLine;
  routeNumber?: string;
  name: string;
  headsign: string;
  stop: string;
  walkMinutes: number;
  arrivesInMinutes: number;
  totalMinutes: number;
  occupancy: "low" | "medium" | "high";
  direct: boolean;
  takeoffAt: string;
  arrivalAt: string;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function addMinutes(d: Date, m: number) {
  return new Date(d.getTime() + m * 60_000);
}

const BUS_ROUTES = [
  { num: "110", name: "The Peach", head: "Downtown ↔ Lenox" },
  { num: "16",  name: "Noble",     head: "Arts Center ↔ Decatur" },
  { num: "2",   name: "Ponce",     head: "North Ave ↔ Avondale" },
  { num: "39",  name: "Buford Hwy", head: "Lindbergh ↔ Doraville" },
  { num: "55",  name: "Jonesboro Rd", head: "Five Points ↔ Airport" },
];

export function getNearbyRoutes(from: string, to: string, now = new Date()): NearbyRoute[] {
  const seedBase = (from + "→" + to).split("").reduce((a, c) => a + c.charCodeAt(0), 0) + now.getMinutes();
  const lines: RailLine[] = ["BLUE", "GOLD", "RED", "GREEN"];
  const out: NearbyRoute[] = [];

  lines.forEach((line, i) => {
    const r = seeded(seedBase + i * 7);
    const walkMinutes = 2 + Math.floor(r * 6);
    const arrivesInMinutes = 1 + Math.floor(r * 9);
    const totalMinutes = 14 + Math.floor(r * 18);
    const takeoff = addMinutes(now, arrivesInMinutes);
    const arrival = addMinutes(takeoff, totalMinutes - arrivesInMinutes);
    out.push({
      id: `rail-${line}-${i}`,
      kind: "rail",
      line,
      name: LINE_META[line].name,
      headsign: line === "RED" ? "North Springs" : line === "GOLD" ? "Doraville" : line === "BLUE" ? "Indian Creek" : "Bankhead",
      stop: STATIONS[Math.floor(r * STATIONS.length)],
      walkMinutes,
      arrivesInMinutes,
      totalMinutes,
      occupancy: r > 0.66 ? "high" : r > 0.33 ? "medium" : "low",
      direct: i < 2,
      takeoffAt: fmtTime(takeoff),
      arrivalAt: fmtTime(arrival),
    });
  });

  BUS_ROUTES.forEach((b, i) => {
    const r = seeded(seedBase + 100 + i * 11);
    const walkMinutes = 1 + Math.floor(r * 8);
    const arrivesInMinutes = 2 + Math.floor(r * 12);
    const totalMinutes = 18 + Math.floor(r * 22);
    const takeoff = addMinutes(now, arrivesInMinutes);
    const arrival = addMinutes(takeoff, totalMinutes - arrivesInMinutes);
    out.push({
      id: `bus-${b.num}`,
      kind: "bus",
      routeNumber: b.num,
      name: `Route ${b.num} · ${b.name}`,
      headsign: b.head,
      stop: STATIONS[Math.floor(r * STATIONS.length)],
      walkMinutes,
      arrivesInMinutes,
      totalMinutes,
      occupancy: r > 0.66 ? "high" : r > 0.33 ? "medium" : "low",
      direct: i % 2 === 0,
      takeoffAt: fmtTime(takeoff),
      arrivalAt: fmtTime(arrival),
    });
  });

  return out.sort((a, b) => (a.arrivesInMinutes + a.walkMinutes) - (b.arrivesInMinutes + b.walkMinutes));
}

export interface NearbyVehicle {
  id: string;
  kind: "rail" | "bus";
  line?: RailLine;
  routeNumber?: string;
  routeName?: string;
  headsign: string;
  // normalized 0-1 within map viewport
  x: number;
  y: number;
  occupancy: "low" | "medium" | "high";
  etaMinutes: number;
  takeoffAt: string;
  arrivalAt: string;
  stop: string;
}

export function getNearbyVehicles(now = new Date(), query = ""): NearbyVehicle[] {
  const m = now.getMinutes();
  const q = query.trim().toLowerCase();
  const lines: RailLine[] = ["RED", "GOLD", "BLUE", "GREEN"];
  const vehicles: NearbyVehicle[] = [];
  lines.forEach((line, i) => {
    for (let k = 0; k < 2; k++) {
      const r = seeded(m + i * 9 + k * 31);
      const eta = 1 + Math.floor(r * 12);
      const trip = 12 + Math.floor(r * 20);
      const takeoff = addMinutes(now, eta);
      const arrival = addMinutes(takeoff, trip);
      vehicles.push({
        id: `${line[0]}${100 + Math.floor(r * 99)}`,
        kind: "rail",
        line,
        routeName: LINE_META[line].name,
        headsign: line === "RED" ? "North Springs" : line === "GOLD" ? "Doraville" : line === "BLUE" ? "Indian Creek" : "Bankhead",
        stop: STATIONS[Math.floor(r * STATIONS.length)],
        x: 0.1 + r * 0.8,
        y: 0.15 + seeded(m + i * 5 + k) * 0.7,
        occupancy: r > 0.66 ? "high" : r > 0.33 ? "medium" : "low",
        etaMinutes: eta,
        takeoffAt: fmtTime(takeoff),
        arrivalAt: fmtTime(arrival),
      });
    }
  });
  BUS_ROUTES.forEach((b, i) => {
    const r = seeded(m + 200 + i * 17);
    const eta = 2 + Math.floor(r * 14);
    const trip = 16 + Math.floor(r * 24);
    const takeoff = addMinutes(now, eta);
    const arrival = addMinutes(takeoff, trip);
    vehicles.push({
      id: `B${b.num}`,
      kind: "bus",
      routeNumber: b.num,
      routeName: `Route ${b.num} · ${b.name}`,
      headsign: b.head,
      stop: STATIONS[Math.floor(r * STATIONS.length)],
      x: 0.08 + r * 0.85,
      y: 0.1 + seeded(m + 300 + i) * 0.78,
      occupancy: r > 0.5 ? "medium" : "low",
      etaMinutes: eta,
      takeoffAt: fmtTime(takeoff),
      arrivalAt: fmtTime(arrival),
    });
  });
  const filtered = q
    ? vehicles.filter(v =>
        (v.routeName ?? "").toLowerCase().includes(q) ||
        v.headsign.toLowerCase().includes(q) ||
        v.stop.toLowerCase().includes(q) ||
        (v.routeNumber ?? "").toLowerCase().includes(q)
      )
    : vehicles;
  return filtered.sort((a, b) => a.etaMinutes - b.etaMinutes);
}



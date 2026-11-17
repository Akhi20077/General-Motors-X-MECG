import json
import math

geo = json.load(open("/tmp/us-states.json"))
ABBR = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}
SKIP = {"District of Columbia", "Puerto Rico"}

phi1, phi2, phi0 = map(math.radians, (29.5, 45.5, 37.5))
lam0 = math.radians(-96)
n = (math.sin(phi1) + math.sin(phi2)) / 2
C = math.cos(phi1) ** 2 + 2 * n * math.sin(phi1)
rho0 = math.sqrt(C - 2 * n * math.sin(phi0)) / n


def project(lon, lat):
    phi = math.radians(lat)
    lam = math.radians(lon)
    rho = math.sqrt(max(0.0, C - 2 * n * math.sin(phi))) / n
    theta = n * (lam - lam0)
    return rho * math.sin(theta), rho0 - rho * math.cos(theta)


def keep(name, lon):
    if name == "Alaska":
        return -170 <= lon <= -129
    if name == "Hawaii":
        return -161 <= lon <= -154
    return True


def rings_of(geom, name):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    out = []
    for poly in polys:
        rings = []
        for ring in poly:
            pts = [(lon, lat) for lon, lat in ring if keep(name, lon)]
            if len(pts) >= 4:
                rings.append([project(lon, lat) for lon, lat in pts])
        if rings:
            out.append(rings)
    return out


def rdp(pts, eps):
    if len(pts) < 3:
        return pts

    def dist(p, a, b):
        ax, ay = a
        bx, by = b
        px, py = p
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0:
            return math.hypot(px - ax, py - ay)
        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = dist(pts[i], pts[0], pts[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[: idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]


def area(ring):
    a = 0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        a += x1 * y2 - x2 * y1
    return a / 2


def centroid(ring):
    a = cx = cy = 0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        c = x1 * y2 - x2 * y1
        a += c
        cx += (x1 + x2) * c
        cy += (y1 + y2) * c
    if abs(a) < 1e-9:
        return ring[0]
    return cx / (3 * a), cy / (3 * a)


def inside(x, y, ring):
    hit = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-15) + xi):
            hit = not hit
        j = i
    return hit


features = []
for feature in geo["features"]:
    name = feature["properties"]["name"]
    if name in SKIP:
        continue
    features.append((name, ABBR[name], rings_of(feature["geometry"], name)))


def all_pts(only):
    pts = []
    for name, _abbr, polys in features:
        if only is None and name in ("Alaska", "Hawaii"):
            continue
        if only is not None and name not in only:
            continue
        for poly in polys:
            for ring in poly:
                pts.extend(ring)
    return pts


def transform(pts, box):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    x0, y0, x1, y1 = box
    scale = min((x1 - x0) / (maxx - minx), (y1 - y0) / (maxy - miny))
    width, height = (maxx - minx) * scale, (maxy - miny) * scale
    ox = x0 + (x1 - x0 - width) / 2
    oy = y0 + (y1 - y0 - height) / 2

    def convert(x, y):
        return ox + (x - minx) * scale, oy + (maxy - y) * scale

    return convert


lower = transform(all_pts(None), (4, 4, 976, 508))
alaska = transform(all_pts({"Alaska"}), (16, 524, 230, 628))
hawaii = transform(all_pts({"Hawaii"}), (250, 518, 520, 634))


def tx_for(name):
    if name == "Alaska":
        return alaska
    if name == "Hawaii":
        return hawaii
    return lower


states = []
for name, abbr, polys in features:
    convert = tx_for(name)
    pixel_polys = [[[convert(x, y) for x, y in ring] for ring in poly] for poly in polys]
    best = max((ring for poly in pixel_polys for ring in poly[:1]), key=lambda ring: abs(area(ring)))
    cx, cy = centroid(best)
    if not inside(cx, cy, best):
        xs = [p[0] for p in best]
        ys = [p[1] for p in best]
        found = None
        for gy in range(10):
            for gx in range(10):
                x = min(xs) + (max(xs) - min(xs)) * (gx + 0.5) / 10
                y = min(ys) + (max(ys) - min(ys)) * (gy + 0.5) / 10
                if inside(x, y, best):
                    found = (x, y)
                    break
            if found:
                break
        if found:
            cx, cy = found
    bw = max(p[0] for p in best) - min(p[0] for p in best)
    bh = max(p[1] for p in best) - min(p[1] for p in best)
    parts = []
    for poly in pixel_polys:
        for ring in poly:
            simple = rdp(ring, 0.65 if bw < 40 else 0.85)
            if len(simple) < 3:
                continue
            if math.hypot(simple[0][0] - simple[-1][0], simple[0][1] - simple[-1][1]) > 0.4:
                simple.append(simple[0])
            cmd = [f"M{simple[0][0]:.1f} {simple[0][1]:.1f}"]
            cmd += [f"L{x:.1f} {y:.1f}" for x, y in simple[1:]]
            cmd.append("Z")
            parts.append("".join(cmd))
    states.append({
        "name": name,
        "abbr": abbr,
        "d": " ".join(parts),
        "x": round(cx, 1),
        "y": round(cy, 1),
        "w": bw,
        "h": bh,
        "wide": bw >= 40 and bh >= 40,
    })

# Rhode Island and Delaware are too small for an interior label. Park them in the Atlantic.
NUDGE = {"RI": (18, 6), "DE": (22, 10)}
PLACE = {"VT": (804.0, 96.0), "NH": (860.0, 126.0)}
for state in states:
    if state["abbr"] in NUDGE:
        dx, dy = NUDGE[state["abbr"]]
        state["x"] = round(state["x"] + dx, 1)
        state["y"] = round(state["y"] + dy, 1)
        state["wide"] = False
    if state["abbr"] in PLACE:
        state["x"], state["y"] = PLACE[state["abbr"]]
        state["wide"] = False

pins = [
    ("Tonawanda", "NY", -78.88, 43.02),
    ("Lockport", "NY", -78.69, 43.17),
    ("Rochester", "NY", -77.63, 43.20),
    ("Hyundai", "GA", -81.45, 32.15),
    ("Mack", "PA", -75.55, 40.52),
    ("Volvo NRV", "VA", -80.69, 37.10),
    ("Daimler", "NC", -80.69, 35.73),
]

lines = [
    "export type MapState = { name: string; abbr: string; d: string; x: number; y: number; wide: boolean };",
    "export type MapPin = { name: string; abbr: string; x: number; y: number };",
    "",
    "export const MAP_VIEW = { w: 980, h: 640 };",
    "",
    "export const MAP_STATES: MapState[] = [",
]
for state in states:
    lines.append(
        "  { name: %s, abbr: %s, x: %s, y: %s, wide: %s, d: %s },"
        % (
            json.dumps(state["name"]),
            json.dumps(state["abbr"]),
            state["x"],
            state["y"],
            "true" if state["wide"] else "false",
            json.dumps(state["d"]),
        )
    )
lines.append("];")
lines.append("")
lines.append("export const MAP_PINS: MapPin[] = [")
for name, abbr, lon, lat in pins:
    x, y = lower(*project(lon, lat))
    lines.append(
        "  { name: %s, abbr: %s, x: %s, y: %s },"
        % (json.dumps(name), json.dumps(abbr), round(x, 1), round(y, 1))
    )
lines.append("];")
lines.append("")

out = "/Users/akhileshkanmanthreddy/Documents/GM X MECG Project/src/mapPaths.ts"
open(out, "w").write("\n".join(lines))
print("wrote", len(states), "states")
for state in sorted(states, key=lambda item: item["w"] * item["h"]):
    print(
        f'{state["abbr"]:3} {state["w"]:6.1f}x{state["h"]:5.1f}  {state["x"]:6.1f},{state["y"]:6.1f}  wide={state["wide"]}'
    )

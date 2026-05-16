"""
Anonymize the real store list for the public Kiosko Logistics demo.

What it does
============
1. Reads `jsons/stores_new.json` (real store coordinates).
2. Shifts each store's lat/lng by a random vector of 30-70 m (deterministic
   per-store via a seeded RNG, so the demo data is stable across runs but
   nobody can recover the exact original coordinates).
3. Replaces store IDs with sequential `DEMO-XXXX` codes and strips the
   numeric prefix from `nm`, keeping the descriptive bit so the map labels
   still feel real.
4. Writes:
     kiosko-app/public/data/stores.demo.json
     kiosko-app/public/data/demo-run.json   (a pre-computed VRP-style run
                                             with the legacy_vrp_output
                                             shape the map component reads)

Why
===
The real store list is operational data for Kiosko. Even though store
addresses are technically public, publishing exact coordinates of every
location alongside a route plan would make the dataset abuse-friendly
(competitor surveillance, social engineering). Shifting ~50 m is enough
to make the data un-actionable while keeping the demo visually accurate
at city scale.

Run
===
    cd /Users/juanfelipezepeda/Documents/TEC/kiosko-demo
    uv run python scripts/anonymize_stores.py
or
    python3 scripts/anonymize_stores.py
"""

from __future__ import annotations

import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_STORES = ROOT / "jsons" / "stores_new.json"
OUT_DIR = ROOT / "kiosko-app" / "public" / "data"
OUT_STORES = OUT_DIR / "stores.demo.json"
OUT_RUN = OUT_DIR / "demo-run.json"

SEED = 0xC011_F0   # stable across runs ("COLLOF0")
MIN_SHIFT_M = 30.0
MAX_SHIFT_M = 70.0

# How many synthetic routes to spread the stores across.
N_ROUTES = 8
# Soft cap on stops per route (we round-robin across routes after sorting).
STOPS_PER_ROUTE_CAP = 35


def _shift_latlng(lat: float, lng: float, rng: random.Random) -> tuple[float, float]:
    """Return (lat, lng) shifted by a random vector of MIN_SHIFT..MAX_SHIFT meters."""
    angle = rng.uniform(0.0, 2.0 * math.pi)
    magnitude = rng.uniform(MIN_SHIFT_M, MAX_SHIFT_M)
    # 1 degree of latitude ~= 111_320 m; longitude scales by cos(lat).
    dlat = (magnitude * math.cos(angle)) / 111_320.0
    dlng = (magnitude * math.sin(angle)) / (111_320.0 * math.cos(math.radians(lat)))
    return lat + dlat, lng + dlng


def _strip_numeric_prefix(name: str) -> str:
    parts = name.split(maxsplit=1)
    if len(parts) == 2 and parts[0].isdigit():
        return parts[1].title()
    return name.title()


def anonymize_stores(raw: list[dict]) -> list[dict]:
    rng = random.Random(SEED)
    out: list[dict] = []
    for i, s in enumerate(raw, start=1):
        lat, lng = _shift_latlng(float(s["la"]), float(s["ln"]), rng)
        out.append(
            {
                "ti": f"DEMO-{i:04d}",
                "la": round(lat, 6),
                "ln": round(lng, 6),
                "nm": f"DEMO-{i:04d} {_strip_numeric_prefix(s.get('nm', ''))}",
                "es": s.get("es", ""),
            }
        )
    return out


def _haversine_km(a: tuple[float, float], b: tuple[float, float]) -> float:
    lat1, lng1 = a
    lat2, lng2 = b
    R = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def synthesize_demo_run(stores: list[dict]) -> dict:
    """Build a Run JSON with the shape the kiosko-app map reads:

    {
      result: {
        algorithm, runtime_sec, kpis,
        routes:  [{ route_id, truck_id, day, total_km, total_costo, total_min,
                    total_cajas, sequence: [{ store_id, ... }], ... }],
        legacy_vrp_output: {
          rutas: [{ ruta_id, cedis, tiendas: [{ id_tienda, lat, lng, nombre,
                                                zona, municipio, estado,
                                                demanda_cajas, frecuencia,
                                                clasificacion }, ...] }],
        }
      }
    }
    """
    rng = random.Random(SEED ^ 0xDEADBEEF)

    # Pick a deterministic "depot" near the geographic centroid so the routes
    # spoke out from it.
    centroid_lat = sum(s["la"] for s in stores) / len(stores)
    centroid_lng = sum(s["ln"] for s in stores) / len(stores)
    depot = {"nombre": "CEDIS-DEMO", "lat": round(centroid_lat, 6), "lng": round(centroid_lng, 6)}

    # Cluster stores by angular bearing from the depot (gives a sunburst of
    # routes that visually reads as "areas served by different trucks").
    def bearing(s: dict) -> float:
        return math.atan2(s["la"] - depot["lat"], s["ln"] - depot["lng"])

    by_bearing = sorted(stores, key=bearing)
    buckets: list[list[dict]] = [[] for _ in range(N_ROUTES)]
    bucket_size = len(by_bearing) / N_ROUTES
    for idx, s in enumerate(by_bearing):
        b = min(int(idx / bucket_size), N_ROUTES - 1)
        buckets[b].append(s)

    rutas_legacy = []
    routes_high = []
    grand_km = 0.0
    grand_min = 0.0
    grand_cajas = 0
    grand_costo = 0.0

    for r_idx, bucket in enumerate(buckets, start=1):
        bucket = bucket[:STOPS_PER_ROUTE_CAP]
        # Sort within bucket by distance from depot — produces a sensible
        # "go out, come back" path even without solving TSP.
        bucket.sort(key=lambda s: _haversine_km((depot["lat"], depot["lng"]), (s["la"], s["ln"])))

        # Tiendas in legacy shape.
        tiendas = []
        sequence = []
        total_km = 0.0
        prev = (depot["lat"], depot["lng"])
        for s in bucket:
            cur = (s["la"], s["ln"])
            total_km += _haversine_km(prev, cur)
            prev = cur
            demanda = rng.randint(8, 40)
            tiendas.append(
                {
                    "id_tienda": s["ti"],
                    "lat": s["la"],
                    "lng": s["ln"],
                    "nombre": s["nm"],
                    "zona": s["es"] or "ZONA-DEMO",
                    "municipio": s["es"] or "Demo",
                    "estado": s["es"] or "DEMO",
                    "demanda_cajas": demanda,
                    "frecuencia": rng.choice(["diaria", "lunes-mier-vier", "mar-jue"]),
                    "clasificacion": rng.choice(["A", "B", "C"]),
                }
            )
            sequence.append({"store_id": s["ti"], "demanda_cajas": demanda})

        # Close back to depot.
        total_km += _haversine_km(prev, (depot["lat"], depot["lng"]))
        # Toy time/cost model: 35 km/h avg + 4 min/stop, 13 MXN/km.
        total_min = round((total_km / 35.0) * 60.0 + 4.0 * len(bucket))
        total_cajas = sum(t["demanda_cajas"] for t in tiendas)
        total_costo = round(total_km * 13.0, 2)
        grand_km += total_km
        grand_min += total_min
        grand_cajas += total_cajas
        grand_costo += total_costo

        ruta_id = f"R{r_idx:02d}"
        rutas_legacy.append({"ruta_id": ruta_id, "cedis": "CEDIS-DEMO", "tiendas": tiendas})
        routes_high.append(
            {
                "route_id": ruta_id,
                "truck_id": f"T-{r_idx:02d}",
                "day": "lun",
                "sequence": sequence,
                "restocks": 0,
                "total_km": round(total_km, 2),
                "total_min": total_min,
                "total_cajas": total_cajas,
                "total_costo": total_costo,
                "excede_8h": total_min > 480,
                "tiene_restock": False,
            }
        )

    return {
        "run_id": "demo-run-0001",
        "algorithm": "demo-sunburst",
        "result": {
            "algorithm": "demo-sunburst",
            "runtime_sec": 0.0,
            "kpis": {
                "total_km": round(grand_km, 2),
                "total_costo": round(grand_costo, 2),
                "total_min": round(grand_min),
                "n_rutas": len(routes_high),
                "n_restocks": 0,
                "ocupacion_promedio": 0.91,
                "n_excede_8h": sum(1 for r in routes_high if r["excede_8h"]),
                "porc_excede_8h": round(
                    100.0 * sum(1 for r in routes_high if r["excede_8h"]) / len(routes_high), 1
                ),
            },
            "routes": routes_high,
            "unrouted": [],
            "legacy_vrp_output": {
                "rutas": rutas_legacy,
                "cedis": [
                    {
                        "nombre": "CEDIS-DEMO",
                        "lat": depot["lat"],
                        "lng": depot["lng"],
                        "la": depot["lat"],
                        "ln": depot["lng"],
                    }
                ],
            },
        },
    }


def main() -> None:
    raw = json.loads(SRC_STORES.read_text(encoding="utf-8"))
    anon = anonymize_stores(raw)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_STORES.write_text(json.dumps(anon, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[anonymize] wrote {OUT_STORES.relative_to(ROOT)}  ({len(anon)} stores)")

    run = synthesize_demo_run(anon)
    OUT_RUN.write_text(json.dumps(run, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"[anonymize] wrote {OUT_RUN.relative_to(ROOT)}  "
        f"({len(run['result']['routes'])} routes, "
        f"{run['result']['kpis']['total_km']:.1f} km total)"
    )


if __name__ == "__main__":
    main()

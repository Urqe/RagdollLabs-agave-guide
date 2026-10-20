"""Build assets/geo/mexico-states.svg from Natural Earth admin-1 geometry.

Source: Natural Earth 10m Admin 1 - States, Provinces (public domain),
Mexico subset. Uses a simple equirectangular projection with a cosine
latitude scale factor, so shapes are geographically positioned relative
to each other (unlike per-state normalized SVGs).

Usage:
    python3 scripts/build-map.py [input.geojson]

Without an input path the Natural Earth GeoJSON is downloaded from its
documented raw URL. The generated SVG keeps one <path data-state="...">
per state with the app's stable state IDs.
"""

import json
import re
import sys
import urllib.request

DEFAULT_SOURCE_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/"
    "geojson/ne_10m_admin_1_states_provinces.geojson"
)
OUT = "assets/geo/mexico-states.svg"

ISO_TO_CODE = {
    "MX-AGU": "ags", "MX-BCN": "bc", "MX-BCS": "bcs", "MX-CAM": "camp",
    "MX-CHP": "chis", "MX-CHH": "chih", "MX-COA": "coah", "MX-COL": "col",
    "MX-DUR": "dgo", "MX-MEX": "edomex", "MX-GUA": "gto", "MX-GRO": "gro",
    "MX-HID": "hgo", "MX-JAL": "jal", "MX-MIC": "mich", "MX-MOR": "mor",
    "MX-NAY": "nay", "MX-NLE": "nl", "MX-OAX": "oax", "MX-PUE": "pue",
    "MX-QUE": "qro", "MX-ROO": "qroo", "MX-SLP": "slp", "MX-SIN": "sin",
    "MX-SON": "son", "MX-TAB": "tab", "MX-TAM": "tamps", "MX-TLA": "tlax",
    "MX-VER": "ver", "MX-YUC": "yuc", "MX-ZAC": "zac", "MX-DIF": "cdmx",
}

CODE_NAMES = {
    "ags": "Aguascalientes", "bc": "Baja California", "bcs": "Baja California Sur",
    "camp": "Campeche", "cdmx": "Ciudad de M\u00e9xico", "chih": "Chihuahua",
    "chis": "Chiapas", "coah": "Coahuila", "col": "Colima", "dgo": "Durango",
    "edomex": "Estado de M\u00e9xico", "gto": "Guanajuato", "gro": "Guerrero",
    "hgo": "Hidalgo", "jal": "Jalisco", "mich": "Michoac\u00e1n", "mor": "Morelos",
    "nay": "Nayarit", "nl": "Nuevo Le\u00f3n", "oax": "Oaxaca", "pue": "Puebla",
    "qro": "Quer\u00e9taro", "qroo": "Quintana Roo", "slp": "San Luis Potos\u00ed",
    "sin": "Sinaloa", "son": "Sonora", "tab": "Tabasco", "tamps": "Tamaulipas",
    "tlax": "Tlaxcala", "ver": "Veracruz", "yuc": "Yucat\u00e1n", "zac": "Zacatecas",
}

# Mid-latitude cosine correction for the equirectangular projection.
LAT_SCALE = 0.917
DECIMALS = 2


def project(lon, lat):
    return (round(lon * LAT_SCALE, DECIMALS), round(-lat, DECIMALS))


def ring_to_path(ring):
    pts = [project(lon, lat) for lon, lat in ring]
    d = [f"M{pts[0][0]} {pts[0][1]}"]
    last = pts[0]
    for x, y in pts[1:]:
        if (x, y) != last:
            d.append(f"L{x} {y}")
            last = (x, y)
    d.append("Z")
    return "".join(d)


def polygon_to_path(coords):
    return "".join(ring_to_path(ring) for ring in coords)


def geometry_to_path(geom):
    if geom["type"] == "Polygon":
        return polygon_to_path(geom["coordinates"])
    if geom["type"] == "MultiPolygon":
        return "".join(polygon_to_path(poly) for poly in geom["coordinates"])
    raise ValueError(f"Unsupported geometry type {geom['type']}")


def load_features(path):
    if path:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    else:
        with urllib.request.urlopen(DEFAULT_SOURCE_URL) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    features = [
        f for f in data["features"]
        if f["properties"].get("admin") == "Mexico"
        and f["properties"].get("iso_3166_2") in ISO_TO_CODE
    ]
    return features


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else None
    features = load_features(src)
    if len(features) != 32:
        raise SystemExit(f"Expected 32 Mexican states, found {len(features)}")

    paths = []
    for f in features:
        code = ISO_TO_CODE[f["properties"]["iso_3166_2"]]
        d = geometry_to_path(f["geometry"])
        paths.append((code, CODE_NAMES[code], d))

    xs, ys = [], []
    for _, _, d in paths:
        for num_x, num_y in re.findall(r"(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)", d):
            xs.append(float(num_x))
            ys.append(float(num_y))
    min_x, min_y = min(xs), min(ys)
    max_x, max_y = max(xs), max(ys)

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x - 0.5:.2f} {min_y - 0.5:.2f} '
        f'{max_x - min_x + 1:.2f} {max_y - min_y + 1:.2f}" '
        'role="img" aria-label="Map of Mexico with state boundaries">',
        "<title>Mexico \u2014 states</title>",
    ]
    for code, name, d in sorted(paths):
        parts.append(
            f'<path id="state-{code}" data-state="{code}" fill="currentColor" '
            f'stroke="#3a352f" stroke-width="0.05" d="{d}">'
            f"<title>{name}</title></path>"
        )
    parts.append("</svg>")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(parts))
    print(f"wrote {OUT} ({len(features)} states, {sum(len(d) for _, _, d in paths)} path bytes)")


if __name__ == "__main__":
    main()

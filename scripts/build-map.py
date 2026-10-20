"""Combine per-state Mexico SVGs (midir99/mexico-states-in-svg, MIT) into one
composite map with one <path> per state, positioned on a shared canvas."""
import re
import xml.etree.ElementTree as ET
from pathlib import Path

SRC = Path("/tmp/mexico-svg-test/svg")
OUT = Path(__file__).resolve().parent.parent / "assets" / "geo" / "mexico-states.svg"

CODES = {
    "ags": "Aguascalientes", "bc": "Baja California", "bcs": "Baja California Sur",
    "camp": "Campeche", "chis": "Chiapas", "chih": "Chihuahua", "cdmx": "Ciudad de México",
    "coah": "Coahuila", "col": "Colima", "dgo": "Durango", "gto": "Guanajuato",
    "gro": "Guerrero", "hgo": "Hidalgo", "jal": "Jalisco", "edomex": "Estado de México",
    "mich": "Michoacán", "mor": "Morelos", "nay": "Nayarit", "nl": "Nuevo León",
    "oax": "Oaxaca", "pue": "Puebla", "qro": "Querétaro", "qroo": "Quintana Roo",
    "slp": "San Luis Potosí", "sin": "Sinaloa", "son": "Sonora", "tab": "Tabasco",
    "tamps": "Tamaulipas", "tlax": "Tlaxcala", "ver": "Veracruz", "yuc": "Yucatán",
    "zac": "Zacatecas",
}

def path_bbox(d):
    nums = [float(x) for x in re.findall(r"-?\d+(?:\.\d+)?", d)]
    xs, ys = nums[0::2], nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)

states = []
for code, name in CODES.items():
    tree = ET.parse(SRC / f"{code}.svg")
    root = tree.getroot()
    vb = [float(v) for v in root.get("viewBox").split()]
    paths = [el for el in root.iter() if el.tag.endswith("path")]
    d = " ".join(p.get("d") for p in paths)
    minx, miny, maxx, maxy = path_bbox(d)
    states.append({
        "code": code, "name": name, "d": d,
        "x": minx, "y": miny, "w": maxx - minx, "h": maxy - miny,
        "vb": vb,
    })

all_min_x = min(s["x"] for s in states)
all_min_y = min(s["y"] for s in states)
all_max_x = max(s["x"] + s["w"] for s in states)
all_max_y = max(s["y"] + s["h"] for s in states)
pad = 1.0
canvas_w = (all_max_x - all_min_x) + 2 * pad
canvas_h = (all_max_y - all_min_y) + 2 * pad

parts = [
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_w:.3f} {canvas_h:.3f}" role="img" aria-label="Map of Mexico with state boundaries">',
    '<title>Mexico — states</title>',
]
for s in states:
    tx = pad - s["x"]
    ty = pad - s["y"]
    parts.append(
        f'<path id="state-{s["code"]}" data-state="{s["code"]}" role="button" tabindex="0" '
        f'aria-label="{s["name"]}" fill="currentColor" stroke="#3a352f" stroke-width="0.35" '
        f'transform="translate({tx:.3f} {ty:.3f})" d="{s["d"]}">'
        f"<title>{s['name']}</title></path>"
    )
parts.append("</svg>")
OUT.write_text("\n".join(parts), encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size} bytes, {len(states)} states)")

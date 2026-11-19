"""Create tables and seed fictional demo data (German)."""
import json
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, title TEXT NOT NULL, phone TEXT NOT NULL,
    email TEXT NOT NULL, photo TEXT NOT NULL, city TEXT NOT NULL, sales INTEGER NOT NULL, bio TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY, title TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL,
    type TEXT NOT NULL, price INTEGER NOT NULL, beds INTEGER NOT NULL, baths REAL NOT NULL,
    sqft INTEGER NOT NULL, year_built INTEGER NOT NULL, image TEXT NOT NULL, gallery TEXT NOT NULL,
    description TEXT NOT NULL, features TEXT NOT NULL, agent_id INTEGER NOT NULL REFERENCES agents(id),
    listed_days_ago INTEGER NOT NULL, featured INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS viewings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, listing_id INTEGER NOT NULL REFERENCES listings(id),
    name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL,
    message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS valuations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
    address TEXT NOT NULL, property_type TEXT NOT NULL, beds INTEGER NOT NULL, message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

AGENTS = [
    (1, "Charlotte von Arnim", "Geschäftsführende Maklerin", "Ihre Telefonnummer hier", "charlotte@skyline.example",
     "/images/agent-1.jpg", "München", 214,
     "Seit fünfzehn Jahren vermittelt sie Villen und Stadtpalais in Bogenhausen, Grünwald und am Herzogpark."),
    (2, "Maximilian Hartmann", "Spezialist für Luxusimmobilien", "Ihre Telefonnummer hier", "maximilian@skyline.example",
     "/images/agent-2.jpg", "Hamburg", 168,
     "Vom Architekten zum Makler – mit einem feinen Gespür für moderne Häuser an Elbe und Rhein."),
    (3, "Sophie Lindner", "Senior-Maklerin", "Ihre Telefonnummer hier", "sophie@skyline.example",
     "/images/agent-3.jpg", "Berlin", 139,
     "Begleitet Familien und Erstkäufer mit Ruhe und Klarheit auf dem Weg ins eigene Zuhause in Berlin."),
    (4, "Jonas Weber", "Käuferberater", "Ihre Telefonnummer hier", "jonas@skyline.example",
     "/images/agent-4.jpg", "Frankfurt", 97,
     "Bekannt für souveräne Verhandlungsführung und gelassene Begleitung bei jedem Angebot."),
]

INTERIORS = ["/images/interior-1.jpg", "/images/interior-2.jpg", "/images/interior-3.jpg",
             "/images/interior-4.jpg", "/images/interior-5.jpg", "/images/interior-6.jpg"]
FEATURES = ["Smart-Home-System", "Designerküche", "Ankleidezimmer", "Doppelgarage",
            "Eichenparkett", "Dachterrasse", "Beheizter Pool", "Arbeitszimmer", "Weinkeller", "Wallbox für E-Autos"]
TYPE_PHRASES = {"house": "ein Haus", "villa": "eine Villa", "apartment": "eine Wohnung", "townhouse": "ein Stadthaus"}

# id, title, address, city, type, price (EUR), bedrooms, bathrooms, living area (m², stored in `sqft`),
# year, image no., agent, days ago, featured
LISTINGS = [
    (1, "Villa am Isarhochufer", "Musterstraße 1", "München", "villa", 6450000, 5, 4.0, 480, 2021, 1, 1, 3, 1),
    (2, "Haus Elbhang", "Musterstraße 2", "Hamburg", "house", 3950000, 4, 3.0, 320, 2019, 2, 2, 9, 1),
    (3, "Residenz Herzogpark", "Musterstraße 3", "München", "villa", 8900000, 6, 5.0, 610, 2022, 3, 1, 14, 1),
    (4, "Stadtvilla Grunewald", "Musterstraße 4", "Berlin", "house", 2850000, 4, 3.0, 290, 2018, 4, 3, 2, 0),
    (5, "Loft-Stadthaus Prenzlauer Berg", "Musterstraße 5", "Berlin", "townhouse", 1390000, 3, 2.0, 185, 2020, 5, 3, 21, 0),
    (6, "Villa Westend", "Musterstraße 6", "Frankfurt", "house", 3490000, 5, 4.0, 410, 1998, 6, 4, 6, 1),
    (7, "Gartenhaus Solln", "Musterstraße 7", "München", "house", 2450000, 4, 3.0, 260, 2015, 7, 1, 30, 0),
    (8, "Villa Rheinblick", "Musterstraße 8", "Düsseldorf", "villa", 5200000, 5, 5.0, 520, 2023, 8, 2, 1, 1),
    (9, "Landhaus Sachsenhausen", "Musterstraße 9", "Frankfurt", "house", 1650000, 4, 2.0, 230, 2008, 9, 4, 12, 0),
    (10, "Skyline Penthouse 42", "Musterstraße 10", "Frankfurt", "apartment", 3250000, 3, 3.0, 240, 2020, 1, 4, 5, 0),
    (11, "Gartenwohnung Harvestehude", "Musterstraße 11", "Hamburg", "apartment", 1180000, 2, 2.0, 125, 2012, 6, 2, 18, 0),
    (12, "Stadthaus Oberkassel", "Musterstraße 12", "Düsseldorf", "townhouse", 1490000, 3, 2.0, 175, 2017, 2, 2, 25, 0),
]


def _area(value: int) -> str:
    return f"{value:,}".replace(",", ".")


def _listing_row(item: tuple) -> tuple:
    lid, title, address, city, kind, price, beds, baths, area, year, img, agent, days, featured = item
    cover = "/images/interior-1.jpg" if kind == "apartment" and lid == 10 else f"/images/home-{img}.jpg"
    rotated = [INTERIORS[(lid + k) % len(INTERIORS)] for k in range(len(INTERIORS))]
    gallery = [cover] + [img_ for img_ in rotated if img_ != cover][:3]
    features = [FEATURES[(lid + k * 3) % len(FEATURES)] for k in range(5)]
    description = (
        f"{title} ist {TYPE_PHRASES[kind]} in {city} mit {_area(area)} m² lichtdurchfluteter Wohnfläche "
        f"und {beds} Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen "
        "sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste."
    )
    return (lid, title, address, city, kind, price, beds, baths, area, year, cover, json.dumps(gallery),
            description, json.dumps(features), agent, days, featured)


def seed(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA)
    if conn.execute("SELECT COUNT(*) FROM agents").fetchone()[0] == 0:
        conn.executemany("INSERT INTO agents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", AGENTS)
        conn.executemany(
            "INSERT INTO listings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [_listing_row(item) for item in LISTINGS],
        )
    conn.commit()

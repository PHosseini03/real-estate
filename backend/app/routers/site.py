"""Real-estate endpoints."""
import json
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request

from ..config import settings
from ..db import fetch_all, insert
from ..responses import ok
from ..schemas import PropertyType, SortOption, ValuationRequest, ViewingRequest
from ..security import limiter

router = APIRouter()

WEEKDAYS = ("Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag")
MONTHS = ("Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September",
          "Oktober", "November", "Dezember")

MAX_PRICE = 100_000_000
SORT_SQL = {
    "newest": "listed_days_ago ASC",
    "price_asc": "price ASC",
    "price_desc": "price DESC",
    "sqft_desc": "sqft DESC",
}
LISTING_COLUMNS = (
    "l.id, l.title, l.address, l.city, l.type, l.price, l.beds, l.baths, l.sqft, l.year_built, "
    "l.image, l.gallery, l.description, l.features, l.agent_id, l.listed_days_ago, l.featured"
)


def _listing(row: dict) -> dict:
    return {**row, "gallery": json.loads(row["gallery"]), "features": json.loads(row["features"]),
            "featured": bool(row["featured"])}


@router.get("/listings")
def list_listings(
    city: Annotated[str | None, Query(max_length=40, pattern=r"^[A-Za-zÄÖÜäöüß .'-]+$")] = None,
    type: Annotated[PropertyType | None, Query()] = None,
    min_price: Annotated[int, Query(ge=0, le=MAX_PRICE)] = 0,
    max_price: Annotated[int, Query(ge=0, le=MAX_PRICE)] = MAX_PRICE,
    beds: Annotated[int, Query(ge=0, le=20)] = 0,
    sort: Annotated[SortOption, Query()] = "newest",
    featured: Annotated[bool, Query()] = False,
    limit: Annotated[int, Query(ge=1, le=50)] = 50,
):
    if min_price > max_price:
        raise HTTPException(status_code=422, detail="Der Mindestpreis (min_price) darf den Höchstpreis (max_price) nicht übersteigen.")
    clauses = ["l.price BETWEEN ? AND ?", "l.beds >= ?"]
    params: list = [min_price, max_price, beds]
    if city:
        clauses.append("LOWER(l.city) = LOWER(?)")
        params.append(city)
    if type:
        clauses.append("l.type = ?")
        params.append(type)
    if featured:
        clauses.append("l.featured = 1")
    # ORDER BY comes from a fixed whitelist, never from user text.
    sql = f"SELECT {LISTING_COLUMNS} FROM listings l WHERE {' AND '.join(clauses)} ORDER BY {SORT_SQL[sort]} LIMIT ?"  # nosec B608
    params.append(limit)
    return ok([_listing(r) for r in fetch_all(sql, tuple(params))])


@router.get("/listings/{listing_id}")
def get_listing(listing_id: int):
    rows = fetch_all(f"SELECT {LISTING_COLUMNS} FROM listings l WHERE l.id = ?", (listing_id,))  # nosec B608
    if not rows:
        raise HTTPException(status_code=404, detail="Objekt nicht gefunden.")
    agent = fetch_all("SELECT * FROM agents WHERE id = ?", (rows[0]["agent_id"],))
    return ok({**_listing(rows[0]), "agent": agent[0] if agent else None})


@router.get("/agents")
def list_agents():
    return ok(fetch_all("SELECT * FROM agents ORDER BY sales DESC"))


@router.get("/meta")
def meta():
    cities = [r["city"] for r in fetch_all("SELECT DISTINCT city FROM listings ORDER BY city")]
    return ok({"cities": cities, "types": ["house", "villa", "apartment", "townhouse"]})


@router.post("/viewings", status_code=201)
@limiter.limit(settings.rate_limit)
def create_viewing(request: Request, body: ViewingRequest):
    listing = fetch_all("SELECT title FROM listings WHERE id = ?", (body.listing_id,))
    if not listing:
        raise HTTPException(status_code=404, detail="Objekt nicht gefunden.")
    viewing_id = insert(
        "INSERT INTO viewings (listing_id, name, email, phone, date, time, message) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (body.listing_id, body.name, str(body.email), body.phone, body.date.isoformat(), body.time, body.message),
    )
    when = f"{WEEKDAYS[body.date.weekday()]}, den {body.date.day}. {MONTHS[body.date.month - 1]}"
    return ok({"id": viewing_id, "message": f"Ihre private Besichtigung von {listing[0]['title']} ist für {when} um {body.time} Uhr angefragt."})


@router.post("/valuations", status_code=201)
@limiter.limit(settings.rate_limit)
def create_valuation(request: Request, body: ValuationRequest):
    valuation_id = insert(
        "INSERT INTO valuations (name, email, phone, address, property_type, beds, message) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (body.name, str(body.email), body.phone, body.address, body.property_type, body.beds, body.message),
    )
    return ok({"id": valuation_id, "message": f"Vielen Dank, {body.name}. Ihre kostenfreie Bewertung erhalten Sie innerhalb von 48 Stunden."})

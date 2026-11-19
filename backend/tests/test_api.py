from datetime import date, timedelta

TOMORROW = (date.today() + timedelta(days=1)).isoformat()
VIEWING = {
    "listing_id": 1, "name": "Lena Hoffmann", "email": "lena@example.com", "phone": "+49 89 5550 0100",
    "date": TOMORROW, "time": "10:30", "message": "Ich freue mich auf den Termin.",
}
VALUATION = {
    "name": "Lena Hoffmann", "email": "lena@example.com", "phone": "(089) 5550-0100",
    "address": "Prinzregentenstraße 22, 81675 München", "property_type": "villa", "beds": 4, "message": "",
}


def test_health_and_headers(client):
    res = client.get("/api/health")
    assert res.json()["data"]["site"] == "Skyline Immobilien"
    assert res.headers["x-frame-options"] == "DENY"
    assert res.headers["x-content-type-options"] == "nosniff"


def test_cors_allow_list(client):
    good = client.get("/api/health", headers={"Origin": "http://localhost:5176"})
    bad = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert good.headers.get("access-control-allow-origin") == "http://localhost:5176"
    assert "access-control-allow-origin" not in bad.headers


def test_list_all_listings_parses_json(client):
    data = client.get("/api/listings").json()["data"]
    assert len(data) == 12
    assert isinstance(data[0]["gallery"], list) and len(data[0]["gallery"]) == 4
    assert isinstance(data[0]["features"], list)
    assert data[0]["listed_days_ago"] == min(d["listed_days_ago"] for d in data)


def test_filters_city_type_beds_price(client):
    data = client.get("/api/listings", params={"city": "münchen", "type": "villa", "beds": 5, "min_price": 6500000}).json()["data"]
    assert [d["id"] for d in data] == [3]


def test_sorting(client):
    asc = [d["price"] for d in client.get("/api/listings?sort=price_asc").json()["data"]]
    desc = [d["price"] for d in client.get("/api/listings?sort=price_desc").json()["data"]]
    sqft = [d["sqft"] for d in client.get("/api/listings?sort=sqft_desc").json()["data"]]
    assert asc == sorted(asc) and desc == sorted(desc, reverse=True) and sqft == sorted(sqft, reverse=True)


def test_featured_and_limit(client):
    data = client.get("/api/listings?featured=true&limit=2").json()["data"]
    assert len(data) == 2 and all(d["featured"] for d in data)


def test_invalid_query_params_rejected(client):
    for qs in ["sort=evil", "type=castle", "beds=-1", "min_price=-5", "limit=500", "city=<script>"]:
        res = client.get(f"/api/listings?{qs}")
        assert res.status_code == 422, qs
        assert res.json()["success"] is False


def test_min_price_above_max_rejected(client):
    res = client.get("/api/listings?min_price=5000000&max_price=1000")
    assert res.status_code == 422
    assert "Mindestpreis" in res.json()["error"]


def test_sql_injection_in_city_rejected(client):
    assert client.get("/api/listings", params={"city": "x' OR 1=1 --"}).status_code == 422


def test_listing_detail_with_agent(client):
    data = client.get("/api/listings/2").json()["data"]
    assert data["title"] == "Haus Elbhang"
    assert data["agent"]["name"] == "Maximilian Hartmann"


def test_listing_not_found(client):
    res = client.get("/api/listings/999")
    assert res.status_code == 404
    assert res.json() == {"success": False, "data": None, "error": "Objekt nicht gefunden."}


def test_agents_and_meta(client):
    agents = client.get("/api/agents").json()["data"]
    assert agents[0]["sales"] >= agents[-1]["sales"] and len(agents) == 4
    meta = client.get("/api/meta").json()["data"]
    assert meta["cities"] == ["Berlin", "Düsseldorf", "Frankfurt", "Hamburg", "München"]


def test_create_viewing(client):
    res = client.post("/api/viewings", json=VIEWING)
    assert res.status_code == 201
    message = res.json()["data"]["message"]
    assert "Villa am Isarhochufer" in message and "um 10:30 Uhr" in message


def test_viewing_unknown_listing_404(client):
    res = client.post("/api/viewings", json={**VIEWING, "listing_id": 404})
    assert res.status_code == 404


def test_viewing_rejects_past_and_far_dates(client):
    past = client.post("/api/viewings", json={**VIEWING, "date": date.today().isoformat()})
    far = client.post("/api/viewings", json={**VIEWING, "date": (date.today() + timedelta(days=400)).isoformat()})
    assert past.status_code == 422 and "Zukunft" in past.json()["error"]
    assert far.status_code == 422


def test_viewing_rejects_bad_slot_and_extra_fields(client):
    assert client.post("/api/viewings", json={**VIEWING, "time": "03:00"}).status_code == 422
    assert client.post("/api/viewings", json={**VIEWING, "role": "admin"}).status_code == 422


def test_viewing_rejects_bad_contact(client):
    assert client.post("/api/viewings", json={**VIEWING, "email": "nope"}).status_code == 422
    assert client.post("/api/viewings", json={**VIEWING, "phone": "call me"}).status_code == 422
    assert client.post("/api/viewings", json={**VIEWING, "name": "<img src=x>"}).status_code == 422
    assert client.post("/api/viewings", json={**VIEWING, "message": "<b>hi</b>"}).status_code == 422


def test_create_valuation_and_injection_as_text(client):
    res = client.post("/api/valuations", json={**VALUATION, "address": "1 Main St'); DROP TABLE valuations; --"})
    assert res.status_code == 201
    assert client.post("/api/valuations", json=VALUATION).json()["data"]["id"] == 2


def test_valuation_validation(client):
    res = client.post("/api/valuations", json={**VALUATION, "beds": 99})
    assert res.status_code == 422
    assert res.json()["error"] == "Schlafzimmer: darf höchstens 20 sein"
    assert client.post("/api/valuations", json={**VALUATION, "property_type": "castle"}).status_code == 422


def test_body_too_large(client):
    res = client.post("/api/valuations", content=b"x" * 20000, headers={"Content-Type": "application/json"})
    assert res.status_code == 413


def test_bad_content_length(client):
    res = client.post("/api/valuations", content=b"{}", headers={"Content-Type": "application/json", "Content-Length": "abc"})
    assert res.status_code in (400, 422)


def test_rate_limit(client):
    codes = [client.post("/api/valuations", json=VALUATION).status_code for _ in range(12)]
    assert 429 in codes
    assert "Zu viele Anfragen" in client.post("/api/valuations", json=VALUATION).json()["error"]


def test_validation_messages_are_german(client):
    res = client.post("/api/viewings", json={**VIEWING, "email": "nope", "name": "A", "role": "admin"})
    error = res.json()["error"]
    assert "E-Mail: muss eine gültige E-Mail-Adresse sein" in error
    assert "Name: muss mindestens 2 Zeichen lang sein" in error
    assert "role: ist nicht erlaubt" in error
    missing = client.post("/api/viewings", json={k: v for k, v in VIEWING.items() if k != "phone"})
    assert missing.json()["error"] == "Telefon: Pflichtangabe"
    assert client.get("/api/listings?beds=abc").json()["error"] == "Schlafzimmer: muss eine ganze Zahl sein"


def test_unknown_route_german(client):
    assert client.get("/api/nothing").json()["error"] == "Nicht gefunden."


def test_valuation_message_german(client):
    message = client.post("/api/valuations", json=VALUATION).json()["data"]["message"]
    assert message.startswith("Vielen Dank, Lena Hoffmann.")

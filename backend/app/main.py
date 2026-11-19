"""FastAPI application factory."""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings
from .db import get_connection
from .responses import fail, ok
from .routers import site
from .security import BodySizeLimitMiddleware, SecurityHeadersMiddleware, limiter
from .seed import seed

logger = logging.getLogger("demo")


FIELD_LABELS = {
    "name": "Name", "email": "E-Mail", "phone": "Telefon", "message": "Nachricht", "date": "Datum",
    "time": "Uhrzeit", "address": "Adresse", "beds": "Schlafzimmer", "property_type": "Objektart",
    "listing_id": "Objekt", "city": "Stadt", "type": "Objektart", "min_price": "Mindestpreis",
    "max_price": "Höchstpreis", "sort": "Sortierung", "limit": "Anzahl", "featured": "Empfohlen",
}
HTTP_DETAILS = {"Not Found": "Nicht gefunden.", "Method Not Allowed": "Methode nicht erlaubt."}


def _german_message(err: dict) -> str:
    """Translate a Pydantic error into a short German message for the UI."""
    kind = err.get("type", "")
    ctx = err.get("ctx") or {}
    msg = str(err.get("msg", "")).removeprefix("Value error, ")
    simple = {
        "missing": "Pflichtangabe",
        "string_pattern_mismatch": "enthält ungültige Zeichen",
        "literal_error": "ungültiger Wert",
        "enum": "ungültiger Wert",
        "int_parsing": "muss eine ganze Zahl sein",
        "int_type": "muss eine ganze Zahl sein",
        "int_from_float": "muss eine ganze Zahl sein",
        "bool_parsing": "muss wahr oder falsch sein",
        "date_parsing": "muss ein gültiges Datum sein",
        "date_from_datetime_parsing": "muss ein gültiges Datum sein",
        "date_type": "muss ein gültiges Datum sein",
        "extra_forbidden": "ist nicht erlaubt",
        "json_invalid": "ungültiges JSON",
        "string_type": "muss Text sein",
    }
    if kind in simple:
        return simple[kind]
    if kind == "string_too_short":
        return f"muss mindestens {ctx.get('min_length')} Zeichen lang sein"
    if kind == "string_too_long":
        return f"darf höchstens {ctx.get('max_length')} Zeichen lang sein"
    if kind == "greater_than_equal":
        return f"muss mindestens {ctx.get('ge')} sein"
    if kind == "less_than_equal":
        return f"darf höchstens {ctx.get('le')} sein"
    if kind == "value_error":
        return "muss eine gültige E-Mail-Adresse sein" if "email" in msg.lower() else msg
    return "ungültiger Wert"


def _format_validation(exc: RequestValidationError) -> str:
    messages = []
    for err in exc.errors():
        parts = [str(p) for p in err.get("loc", ()) if p not in ("body", "query", "path")]
        field = ".".join(FIELD_LABELS.get(p, p) for p in parts)
        msg = _german_message(err)
        messages.append(f"{field}: {msg}" if field else msg)
    return "; ".join(messages) or "Ungültige Anfrage."


def create_app() -> FastAPI:
    app = FastAPI(title=f"{settings.site_name} API", version="1.0.0")
    app.state.limiter = limiter

    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(BodySizeLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
        allow_credentials=False,
    )

    @app.exception_handler(RequestValidationError)
    async def on_validation(_: Request, exc: RequestValidationError):
        return JSONResponse(fail(_format_validation(exc)), status_code=422)

    @app.exception_handler(RateLimitExceeded)
    async def on_rate_limit(_: Request, __: RateLimitExceeded):
        return JSONResponse(fail("Zu viele Anfragen. Bitte versuchen Sie es gleich noch einmal."), status_code=429)

    @app.exception_handler(StarletteHTTPException)
    async def on_http(_: Request, exc: StarletteHTTPException):
        detail = HTTP_DETAILS.get(exc.detail, exc.detail) if isinstance(exc.detail, str) else "Anfrage fehlgeschlagen."
        return JSONResponse(fail(detail), status_code=exc.status_code)

    @app.exception_handler(Exception)
    async def on_error(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s", request.url.path, exc_info=exc)
        return JSONResponse(fail("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."), status_code=500)

    @app.get("/api/health")
    def health():
        return ok({"status": "ok", "site": settings.site_name})

    app.include_router(site.router, prefix="/api")
    seed(get_connection())
    return app


app = create_app()

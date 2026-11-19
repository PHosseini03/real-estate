"""Request models with strict validation."""
from datetime import date, timedelta
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .validators import check_name, check_phone, clean_text

PropertyType = Literal["house", "villa", "apartment", "townhouse"]
SortOption = Literal["newest", "price_asc", "price_desc", "sqft_desc"]
TIME_SLOTS = ("09:00", "10:30", "12:00", "14:00", "15:30", "17:00")
MAX_DAYS_AHEAD = 180


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Contact(Strict):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20)
    message: str = Field(default="", max_length=1000)

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        return check_name(v)

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        return check_phone(v)

    @field_validator("message")
    @classmethod
    def _message(cls, v: str) -> str:
        return clean_text(v) if v else v


class ViewingRequest(Contact):
    listing_id: int = Field(ge=1)
    date: date
    time: Literal["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"]

    @field_validator("date")
    @classmethod
    def _future(cls, v: date) -> date:
        today = date.today()
        if v <= today:
            raise ValueError("muss ein Datum in der Zukunft sein")
        if v > today + timedelta(days=MAX_DAYS_AHEAD):
            raise ValueError(f"muss innerhalb der nächsten {MAX_DAYS_AHEAD} Tage liegen")
        return v


class ValuationRequest(Contact):
    address: str = Field(min_length=5, max_length=160)
    property_type: PropertyType = "house"
    beds: int = Field(ge=0, le=20)

    @field_validator("address")
    @classmethod
    def _address(cls, v: str) -> str:
        return clean_text(v)

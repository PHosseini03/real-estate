// Fictional demo data, generated from backend/app/seed.py (German) so the site works offline.
export type PropertyType = "house" | "villa" | "apartment" | "townhouse";

export interface Agent {
  id: number;
  name: string;
  title: string;
  phone: string;
  email: string;
  photo: string;
  city: string;
  sales: number;
  bio: string;
}

export interface Listing {
  id: number;
  title: string;
  address: string;
  city: string;
  type: PropertyType;
  price: number;
  beds: number;
  baths: number;
  /** Living area in m² (field name kept for API compatibility). */
  sqft: number;
  year_built: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  agent_id: number;
  listed_days_ago: number;
  featured: boolean;
}

export interface ListingDetail extends Listing {
  agent: Agent | null;
}

export const DEMO_AGENTS: Agent[] = [
  {
    "id": 1,
    "name": "Charlotte von Arnim",
    "title": "Geschäftsführende Maklerin",
    "phone": "Ihre Telefonnummer hier",
    "email": "charlotte@skyline.example",
    "photo": "/images/agent-1.jpg",
    "city": "München",
    "sales": 214,
    "bio": "Seit fünfzehn Jahren vermittelt sie Villen und Stadtpalais in Bogenhausen, Grünwald und am Herzogpark."
  },
  {
    "id": 2,
    "name": "Maximilian Hartmann",
    "title": "Spezialist für Luxusimmobilien",
    "phone": "Ihre Telefonnummer hier",
    "email": "maximilian@skyline.example",
    "photo": "/images/agent-2.jpg",
    "city": "Hamburg",
    "sales": 168,
    "bio": "Vom Architekten zum Makler – mit einem feinen Gespür für moderne Häuser an Elbe und Rhein."
  },
  {
    "id": 3,
    "name": "Sophie Lindner",
    "title": "Senior-Maklerin",
    "phone": "Ihre Telefonnummer hier",
    "email": "sophie@skyline.example",
    "photo": "/images/agent-3.jpg",
    "city": "Berlin",
    "sales": 139,
    "bio": "Begleitet Familien und Erstkäufer mit Ruhe und Klarheit auf dem Weg ins eigene Zuhause in Berlin."
  },
  {
    "id": 4,
    "name": "Jonas Weber",
    "title": "Käuferberater",
    "phone": "Ihre Telefonnummer hier",
    "email": "jonas@skyline.example",
    "photo": "/images/agent-4.jpg",
    "city": "Frankfurt",
    "sales": 97,
    "bio": "Bekannt für souveräne Verhandlungsführung und gelassene Begleitung bei jedem Angebot."
  }
];

export const DEMO_LISTINGS: Listing[] = [
  {
    "id": 1,
    "title": "Villa am Isarhochufer",
    "address": "Musterstraße 1",
    "city": "München",
    "type": "villa",
    "price": 6450000,
    "beds": 5,
    "baths": 4,
    "sqft": 480,
    "year_built": 2021,
    "image": "/images/home-1.jpg",
    "gallery": [
      "/images/home-1.jpg",
      "/images/interior-2.jpg",
      "/images/interior-3.jpg",
      "/images/interior-4.jpg"
    ],
    "description": "Villa am Isarhochufer ist eine Villa in München mit 480 m² lichtdurchfluteter Wohnfläche und 5 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Designerküche",
      "Eichenparkett",
      "Arbeitszimmer",
      "Smart-Home-System",
      "Doppelgarage"
    ],
    "agent_id": 1,
    "listed_days_ago": 3,
    "featured": true
  },
  {
    "id": 2,
    "title": "Haus Elbhang",
    "address": "Musterstraße 2",
    "city": "Hamburg",
    "type": "house",
    "price": 3950000,
    "beds": 4,
    "baths": 3,
    "sqft": 320,
    "year_built": 2019,
    "image": "/images/home-2.jpg",
    "gallery": [
      "/images/home-2.jpg",
      "/images/interior-3.jpg",
      "/images/interior-4.jpg",
      "/images/interior-5.jpg"
    ],
    "description": "Haus Elbhang ist ein Haus in Hamburg mit 320 m² lichtdurchfluteter Wohnfläche und 4 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Ankleidezimmer",
      "Dachterrasse",
      "Weinkeller",
      "Designerküche",
      "Eichenparkett"
    ],
    "agent_id": 2,
    "listed_days_ago": 9,
    "featured": true
  },
  {
    "id": 3,
    "title": "Residenz Herzogpark",
    "address": "Musterstraße 3",
    "city": "München",
    "type": "villa",
    "price": 8900000,
    "beds": 6,
    "baths": 5,
    "sqft": 610,
    "year_built": 2022,
    "image": "/images/home-3.jpg",
    "gallery": [
      "/images/home-3.jpg",
      "/images/interior-4.jpg",
      "/images/interior-5.jpg",
      "/images/interior-6.jpg"
    ],
    "description": "Residenz Herzogpark ist eine Villa in München mit 610 m² lichtdurchfluteter Wohnfläche und 6 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Doppelgarage",
      "Beheizter Pool",
      "Wallbox für E-Autos",
      "Ankleidezimmer",
      "Dachterrasse"
    ],
    "agent_id": 1,
    "listed_days_ago": 14,
    "featured": true
  },
  {
    "id": 4,
    "title": "Stadtvilla Grunewald",
    "address": "Musterstraße 4",
    "city": "Berlin",
    "type": "house",
    "price": 2850000,
    "beds": 4,
    "baths": 3,
    "sqft": 290,
    "year_built": 2018,
    "image": "/images/home-4.jpg",
    "gallery": [
      "/images/home-4.jpg",
      "/images/interior-5.jpg",
      "/images/interior-6.jpg",
      "/images/interior-1.jpg"
    ],
    "description": "Stadtvilla Grunewald ist ein Haus in Berlin mit 290 m² lichtdurchfluteter Wohnfläche und 4 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Eichenparkett",
      "Arbeitszimmer",
      "Smart-Home-System",
      "Doppelgarage",
      "Beheizter Pool"
    ],
    "agent_id": 3,
    "listed_days_ago": 2,
    "featured": false
  },
  {
    "id": 5,
    "title": "Loft-Stadthaus Prenzlauer Berg",
    "address": "Musterstraße 5",
    "city": "Berlin",
    "type": "townhouse",
    "price": 1390000,
    "beds": 3,
    "baths": 2,
    "sqft": 185,
    "year_built": 2020,
    "image": "/images/home-5.jpg",
    "gallery": [
      "/images/home-5.jpg",
      "/images/interior-6.jpg",
      "/images/interior-1.jpg",
      "/images/interior-2.jpg"
    ],
    "description": "Loft-Stadthaus Prenzlauer Berg ist ein Stadthaus in Berlin mit 185 m² lichtdurchfluteter Wohnfläche und 3 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Dachterrasse",
      "Weinkeller",
      "Designerküche",
      "Eichenparkett",
      "Arbeitszimmer"
    ],
    "agent_id": 3,
    "listed_days_ago": 21,
    "featured": false
  },
  {
    "id": 6,
    "title": "Villa Westend",
    "address": "Musterstraße 6",
    "city": "Frankfurt",
    "type": "house",
    "price": 3490000,
    "beds": 5,
    "baths": 4,
    "sqft": 410,
    "year_built": 1998,
    "image": "/images/home-6.jpg",
    "gallery": [
      "/images/home-6.jpg",
      "/images/interior-1.jpg",
      "/images/interior-2.jpg",
      "/images/interior-3.jpg"
    ],
    "description": "Villa Westend ist ein Haus in Frankfurt mit 410 m² lichtdurchfluteter Wohnfläche und 5 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Beheizter Pool",
      "Wallbox für E-Autos",
      "Ankleidezimmer",
      "Dachterrasse",
      "Weinkeller"
    ],
    "agent_id": 4,
    "listed_days_ago": 6,
    "featured": true
  },
  {
    "id": 7,
    "title": "Gartenhaus Solln",
    "address": "Musterstraße 7",
    "city": "München",
    "type": "house",
    "price": 2450000,
    "beds": 4,
    "baths": 3,
    "sqft": 260,
    "year_built": 2015,
    "image": "/images/home-7.jpg",
    "gallery": [
      "/images/home-7.jpg",
      "/images/interior-2.jpg",
      "/images/interior-3.jpg",
      "/images/interior-4.jpg"
    ],
    "description": "Gartenhaus Solln ist ein Haus in München mit 260 m² lichtdurchfluteter Wohnfläche und 4 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Arbeitszimmer",
      "Smart-Home-System",
      "Doppelgarage",
      "Beheizter Pool",
      "Wallbox für E-Autos"
    ],
    "agent_id": 1,
    "listed_days_ago": 30,
    "featured": false
  },
  {
    "id": 8,
    "title": "Villa Rheinblick",
    "address": "Musterstraße 8",
    "city": "Düsseldorf",
    "type": "villa",
    "price": 5200000,
    "beds": 5,
    "baths": 5,
    "sqft": 520,
    "year_built": 2023,
    "image": "/images/home-8.jpg",
    "gallery": [
      "/images/home-8.jpg",
      "/images/interior-3.jpg",
      "/images/interior-4.jpg",
      "/images/interior-5.jpg"
    ],
    "description": "Villa Rheinblick ist eine Villa in Düsseldorf mit 520 m² lichtdurchfluteter Wohnfläche und 5 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Weinkeller",
      "Designerküche",
      "Eichenparkett",
      "Arbeitszimmer",
      "Smart-Home-System"
    ],
    "agent_id": 2,
    "listed_days_ago": 1,
    "featured": true
  },
  {
    "id": 9,
    "title": "Landhaus Sachsenhausen",
    "address": "Musterstraße 9",
    "city": "Frankfurt",
    "type": "house",
    "price": 1650000,
    "beds": 4,
    "baths": 2,
    "sqft": 230,
    "year_built": 2008,
    "image": "/images/home-9.jpg",
    "gallery": [
      "/images/home-9.jpg",
      "/images/interior-4.jpg",
      "/images/interior-5.jpg",
      "/images/interior-6.jpg"
    ],
    "description": "Landhaus Sachsenhausen ist ein Haus in Frankfurt mit 230 m² lichtdurchfluteter Wohnfläche und 4 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Wallbox für E-Autos",
      "Ankleidezimmer",
      "Dachterrasse",
      "Weinkeller",
      "Designerküche"
    ],
    "agent_id": 4,
    "listed_days_ago": 12,
    "featured": false
  },
  {
    "id": 10,
    "title": "Skyline Penthouse 42",
    "address": "Musterstraße 10",
    "city": "Frankfurt",
    "type": "apartment",
    "price": 3250000,
    "beds": 3,
    "baths": 3,
    "sqft": 240,
    "year_built": 2020,
    "image": "/images/interior-1.jpg",
    "gallery": [
      "/images/interior-1.jpg",
      "/images/interior-5.jpg",
      "/images/interior-6.jpg",
      "/images/interior-2.jpg"
    ],
    "description": "Skyline Penthouse 42 ist eine Wohnung in Frankfurt mit 240 m² lichtdurchfluteter Wohnfläche und 3 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Smart-Home-System",
      "Doppelgarage",
      "Beheizter Pool",
      "Wallbox für E-Autos",
      "Ankleidezimmer"
    ],
    "agent_id": 4,
    "listed_days_ago": 5,
    "featured": false
  },
  {
    "id": 11,
    "title": "Gartenwohnung Harvestehude",
    "address": "Musterstraße 11",
    "city": "Hamburg",
    "type": "apartment",
    "price": 1180000,
    "beds": 2,
    "baths": 2,
    "sqft": 125,
    "year_built": 2012,
    "image": "/images/home-6.jpg",
    "gallery": [
      "/images/home-6.jpg",
      "/images/interior-6.jpg",
      "/images/interior-1.jpg",
      "/images/interior-2.jpg"
    ],
    "description": "Gartenwohnung Harvestehude ist eine Wohnung in Hamburg mit 125 m² lichtdurchfluteter Wohnfläche und 2 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Designerküche",
      "Eichenparkett",
      "Arbeitszimmer",
      "Smart-Home-System",
      "Doppelgarage"
    ],
    "agent_id": 2,
    "listed_days_ago": 18,
    "featured": false
  },
  {
    "id": 12,
    "title": "Stadthaus Oberkassel",
    "address": "Musterstraße 12",
    "city": "Düsseldorf",
    "type": "townhouse",
    "price": 1490000,
    "beds": 3,
    "baths": 2,
    "sqft": 175,
    "year_built": 2017,
    "image": "/images/home-2.jpg",
    "gallery": [
      "/images/home-2.jpg",
      "/images/interior-1.jpg",
      "/images/interior-2.jpg",
      "/images/interior-3.jpg"
    ],
    "description": "Stadthaus Oberkassel ist ein Stadthaus in Düsseldorf mit 175 m² lichtdurchfluteter Wohnfläche und 3 Schlafzimmern. Bodentiefe Verglasung, fließende Übergänge zwischen Innen und Außen sowie hochwertige Materialien machen das Anwesen ideal für den Alltag ebenso wie für Gäste.",
    "features": [
      "Ankleidezimmer",
      "Dachterrasse",
      "Weinkeller",
      "Designerküche",
      "Eichenparkett"
    ],
    "agent_id": 2,
    "listed_days_ago": 25,
    "featured": false
  }
];

export const CITIES = ["Berlin", "Düsseldorf", "Frankfurt", "Hamburg", "München"];
export const TYPES: PropertyType[] = ["house", "villa", "apartment", "townhouse"];

export const CONTACT = {
  phone: "Ihre Telefonnummer hier",
  email: "concierge@skyline.example",
  address: "Ihre Adresse hier",
};

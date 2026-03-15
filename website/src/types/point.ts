export interface Point {
  author?: string;
  slug: string;
  name: string;
  km: number;
  gps_coordinates?: number;
  elevation?: number;
  category: PointCategory;
  type:
    | AccomodationTypes
    | FoodTypes
    | NavigationTypes
    | TransportTypes
    | TuristicGoalTypes
    | OtherServiceTypes;
  website?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  routeMarking?: RouteMarking;
  note?: string;
}

export type PointCategory =
  | "ubytovani"
  | "obcerstveni"
  | "navigace"
  | "doprava"
  | "turisticke_cile"
  | "ostatni";

export type RouteMarking = "cervena" | "modra" | "zelena" | "zluta";

export type AccomodationTypes =
  | "hotel"
  | "penzion"
  | "turisticka_chata"
  | "kemp"
  | "nouzove_nocoviste"
  | "trail_angel";
export type FoodTypes =
  | "restaurace"
  | "bufet"
  | "obchod"
  | "vecerka"
  | "kavarna"
  | "pekarna"
  | "zdroj_vody";
export type NavigationTypes =
  | "rozcestnik"
  | "milnik"
  | "mapa"
  | "zacatek_etapy"
  | "konec_etapy"
  | "nouzovy bod"
  | "uzavirka"
  | "turisticky_pristresek"
  | "vrchol";
export type TransportTypes = "vlakova_zastavka" | "autobusova_zastavka" | "prevoz" | "parkoviste";
export type TuristicGoalTypes =
  | "kostel"
  | "chapel"
  | "kulturni_pamatka"
  | "rozhledna"
  | "vyhlidka"
  | "pamatny_strom"
  | "turisticke_informacni_centrum"
  | "ostatni";
export type OtherServiceTypes = "razitko" | "zasilkovna" | "bankomat";

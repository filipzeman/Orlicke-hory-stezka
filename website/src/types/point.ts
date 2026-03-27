export interface Point {
  id: string;
  km: number;
  crossroad_number?: string | null;
  category: PointCategory;
  type:
    | AccomodationTypes
    | FoodTypes
    | NavigationTypes
    | TransportTypes
    | TuristicGoalTypes
    | OtherServiceTypes;
  date: string;
  author?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  opening_info?: string | null;
  elevation?: number | null;
  latitude: number;
  longitude: number;
  navigation_color?: string | null;
  note?: string | null;
  hikers_welcome?: boolean | null;
  photos?: [string | null];
  created_at: string;
  active: boolean;
  location_id?: string | null;
  location_name?: string | null;
  point_name: string;
  slug: string;
  categoryKey?: PointCategory | null;
  typeKey?:
    | AccomodationTypes
    | FoodTypes
    | NavigationTypes
    | TransportTypes
    | TuristicGoalTypes
    | OtherServiceTypes
    | null;
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

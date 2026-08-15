import type { Point } from "../../types/point";

export const categoryTypes: Record<Point["category"], Point["type"][]> = {
  ubytovani: ["hotel", "penzion", "turisticka_chata", "kemp", "nouzove_nocoviste", "trail_angel"],

  obcerstveni: ["restaurace", "bufet", "obchod", "vecerka", "kavarna", "pekarna", "zdroj_vody"],

  navigace: [
    "rozcestnik",
    "milnik",
    "mapa",
    "zacatek_etapy",
    "konec_etapy",
    "nouzovy_bod",
    "uzavirka",
    "turisticky_pristresek",
    "vrchol",
    "hranicni_prechod",
  ],

  doprava: ["vlakova_zastavka", "autobusova_zastavka", "prevoz", "parkoviste", "nabijeci_stanice"],

  turisticke_cile: [
    "kostel",
    "chapel",
    "kulturni_pamatka",
    "rozhledna",
    "vyhlidka",
    "pamatny_strom",
    "turisticke_informacni_centrum",
    "muzeum",
    "kriz",
    "ostatni",
    "pechotni_srub",
    "ruina",
  ],

  ostatni: ["obec", "razitko", "zasilkovna", "bankomat"],
};

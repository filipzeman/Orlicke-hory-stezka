import type { Point } from "../types/point";
import type { IconName } from "../types/icons";

export function getPointIcons(point: Point): IconName[] {
  const icons: IconName[] = [];

  // --- TYPE MAPPING ---
  const categoryMap: Record<string, IconName> = {
    ubytovani: "Bed",
    obcerstveni: "Utensils",
    navigace: "Signpost",
    doprava: "BusFront",
    turisticke_cile: "Mountain",
    ostatni: "Info",
  };

  if (point.categoryKey && categoryMap[point.categoryKey]) {
    icons.push(categoryMap[point.categoryKey]);
  }

  return icons;
}

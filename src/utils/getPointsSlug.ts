import { slugify } from "./slugify";
import type { Point } from "../types/point";

export function getPointSlug(point: Point) {
  if (point.location_id) {
    return slugify(point.location_id);
  }

  const numericId = point.id.replace(/^pt_/, "");

  return `${numericId}-${slugify(point.point_name)}`;
}

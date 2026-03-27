import type { Point } from "../types/point";
import type { LocationGroup } from "../types/locationGroup";

export function groupPointsByLocation(points: Point[]): LocationGroup[] {
  const groups: Record<string, LocationGroup> = {};

  for (const point of points) {
    const key = point.location_id?.trim() || point.id;

    if (!groups[key]) {
      groups[key] = {
        location_id: key,
        location_name: point.location_name ?? point.point_name,
        km: point.km,
        points: [],
      };
    }

    groups[key].points.push(point);
  }

  return Object.values(groups);
}

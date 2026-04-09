import type { Point } from "../types/point";
import type { LocationGroup } from "../types/locationGroup";

export function groupPointsByLocation(points: Point[]): Array<Point | LocationGroup> {
  const groups: Record<string, LocationGroup> = {};
  const singles: Point[] = [];

  for (const point of points) {
    const locationId = point.location_id?.trim();
    const locationName = point.location_name?.trim();

    if (locationId && locationName) {
      if (!groups[locationId]) {
        groups[locationId] = {
          location_id: locationId,
          location_name: locationName,
          km: point.km,
          points: [],
        };
      }

      groups[locationId].points.push(point);
    } else {
      singles.push(point);
    }
  }

  return [...Object.values(groups), ...singles];
}

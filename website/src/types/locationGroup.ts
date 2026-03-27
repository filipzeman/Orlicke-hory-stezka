import type { Point } from "./point";

export interface LocationGroup {
  location_id: string;
  location_name: string | null;
  km: number;
  points: Point[];
}

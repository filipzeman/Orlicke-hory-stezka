import type { Point } from "../types/point";
import type { IconName } from "../types/icons";
import { pointMetadata } from "../config/pointMetadata";

export function getPointCategoryIcons(point: Point): IconName[] {
  const icon = pointMetadata.categories[point.category]?.icon;

  return icon ? [icon as IconName] : [];
}

export function getPointTypeIcons(point: Point): IconName[] {
  const icon = pointMetadata.types[point.type]?.icon;

  return icon ? [icon as IconName] : [];
}

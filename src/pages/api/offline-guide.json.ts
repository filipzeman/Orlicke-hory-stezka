import { getSupabase } from "../../lib/supabase";
import { getPointSlug } from "../../utils/getPointsSlug";
import type { Point } from "../../types/point";
import type { PointDetails } from "../../types/pointDetails";

export interface OfflineGuidePayload {
  version: string;
  generatedAt: string;
  points: Point[];
  detailsByPointId: Record<string, PointDetails>;
  locationsBySlug: Record<string, { pointIds: string[] }>;
}

export async function GET() {
  const supabase = getSupabase();

  const [pointsResult, detailsResult] = await Promise.all([
    supabase.from("points").select("*").eq("active", true),
    supabase.from("point_details").select("*").eq("active", true),
  ]);

  if (pointsResult.error) {
    throw new Error(`Failed to load points for offline guide: ${pointsResult.error.message}`);
  }

  if (detailsResult.error) {
    throw new Error(`Failed to load point details for offline guide: ${detailsResult.error.message}`);
  }

  const points = (pointsResult.data ?? []) as Point[];
  const details = (detailsResult.data ?? []) as PointDetails[];

  const detailsByPointId = Object.fromEntries(
    details.map((detail) => [detail.point_id, detail]),
  ) as Record<string, PointDetails>;

  const locationsBySlug: Record<string, { pointIds: string[] }> = {};

  for (const point of points) {
    const slug = getPointSlug(point);

    if (!locationsBySlug[slug]) {
      locationsBySlug[slug] = { pointIds: [] };
    }

    locationsBySlug[slug].pointIds.push(point.id);
  }

  const payload: OfflineGuidePayload = {
    version: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    points,
    detailsByPointId,
    locationsBySlug,
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

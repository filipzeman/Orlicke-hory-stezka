import { useCallback, useEffect, useState } from "react";
import type { Point } from "../types/point";
import { pointMetadata } from "../config/pointMetadata";
import { getOfflineGuideRuntimeState, normalizeGuideSlug } from "../lib/offlineGuide";
import { getPointSlug } from "../utils/getPointsSlug";

interface GroupedLocation {
  key: string;
  km: number | null;
  points: Point[];
}

function groupByLocation(points: Point[]): GroupedLocation[] {
  const groups = new Map<string, GroupedLocation>();

  for (const point of points) {
    const key =
      point.location_id ||
      point.location_name ||
      point.point_name ||
      `${point.km ?? "-"}-${point.id}`;
    const existing = groups.get(key);

    if (existing) {
      existing.km = existing.km ?? point.km;
      existing.points.push(point);
      continue;
    }

    groups.set(key, { key, km: point.km, points: [point] });
  }

  return [...groups.values()].sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
}

function TypeBadge({ type }: { type: string }) {
  const label = pointMetadata.types[type as keyof typeof pointMetadata.types]?.label || type;
  return <span className="offline-guide-pill">{label}</span>;
}

function OfflineItem({ group, isLast }: { group: GroupedLocation; isLast: boolean }) {
  const representative = group.points[0];
  if (!representative) return null;

  const displayName = representative.location_name || representative.point_name || "Bod trasy";
  const href = `/bod/${normalizeGuideSlug(getPointSlug(representative))}`;
  const types = [...new Set(group.points.map((point) => point.type).filter(Boolean))] as string[];

  return (
    <div
      className={`item ${isLast ? "last" : ""}`}
      data-lat={representative.latitude ?? ""}
      data-lng={representative.longitude ?? ""}
    >
      <div className="km">
        <span>{group.km ?? ""}</span>
      </div>
      <div className="content default">
        <a href={href} className="name">
          {displayName}
        </a>
        <div className="offline-guide-badges">
          {types.slice(0, 3).map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
}

function currentFilter(): string {
  return new URLSearchParams(window.location.search).get("filtr") || "vse";
}

function setActiveFilterLink(filterKey: string) {
  document.querySelectorAll<HTMLAnchorElement>(".filter-icon").forEach((link) => {
    const linkFilter =
      new URL(link.href, window.location.origin).searchParams.get("filtr") || "vse";
    link.classList.toggle("active", linkFilter === filterKey);
  });
}

/**
 * Replaces the server-rendered points list with one built from the downloaded
 * offline guide, once installed as a PWA with a guide saved in IndexedDB.
 */
export default function OfflineItineraryList() {
  const [enabled, setEnabled] = useState(false);
  const [filter, setFilter] = useState(currentFilter);
  const [groups, setGroups] = useState<GroupedLocation[] | null>(null);

  const refresh = useCallback(async () => {
    const state = await getOfflineGuideRuntimeState();
    const shouldUseFallback = state.shouldUseOfflineFallback && state.pwaInstalled;
    setEnabled(shouldUseFallback);

    if (!shouldUseFallback || !state.guide) {
      setGroups(null);
      return;
    }

    const activeFilter = currentFilter();
    setFilter(activeFilter);

    const filtered = (state.guide.points ?? []).filter((point) => {
      if (!point) return false;
      return activeFilter === "vse" ? true : point.category === activeFilter;
    });

    setGroups(groupByLocation(filtered));
  }, []);

  useEffect(() => {
    refresh();

    document.addEventListener("astro:page-load", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("online", async () => {
      const state = await getOfflineGuideRuntimeState();
      if (!(state.shouldUseOfflineFallback && state.pwaInstalled)) {
        window.location.reload();
      }
    });

    return () => {
      document.removeEventListener("astro:page-load", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".filter-icon"));

    const onClick = (link: HTMLAnchorElement) => (event: MouseEvent) => {
      // preventDefault must run synchronously, before any await, or the browser
      // will already have started navigating by the time we decide to intercept it.
      event.preventDefault();

      void (async () => {
        const state = await getOfflineGuideRuntimeState();
        if (!(state.shouldUseOfflineFallback && state.pwaInstalled)) {
          window.location.href = link.href;
          return;
        }

        const linkUrl = new URL(link.href, window.location.origin);
        const filterKey = linkUrl.searchParams.get("filtr") || "vse";

        window.history.pushState({}, "", linkUrl.toString());
        setActiveFilterLink(filterKey);
        await refresh();
      })();
    };

    const handlers = links.map((link) => {
      const handler = onClick(link);
      link.addEventListener("click", handler);
      return { link, handler };
    });

    const onPopState = () => refresh();
    window.addEventListener("popstate", onPopState);

    return () => {
      handlers.forEach(({ link, handler }) => link.removeEventListener("click", handler));
      window.removeEventListener("popstate", onPopState);
    };
  }, [refresh]);

  useEffect(() => {
    setActiveFilterLink(filter);
  }, [filter]);

  useEffect(() => {
    const ssrList = document.querySelector<HTMLElement>(".points-ssr");
    if (ssrList) ssrList.style.display = enabled ? "none" : "";
  }, [enabled]);

  if (!enabled || !groups) return null;

  if (!groups.length) {
    return (
      <p className="text-center text-muted">
        Offline průvodce neobsahuje žádné body pro tento filtr.
      </p>
    );
  }

  return (
    <>
      {groups.map((group, index) => (
        <OfflineItem key={group.key} group={group} isLast={index === groups.length - 1} />
      ))}
    </>
  );
}

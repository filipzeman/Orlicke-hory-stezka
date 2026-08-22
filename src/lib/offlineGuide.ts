import type { Point } from "../types/point";
import type { PointDetails } from "../types/pointDetails";
import { slugify } from "../utils/slugify";

export interface OfflineGuidePayload {
  version: string;
  generatedAt: string;
  points: Point[];
  detailsByPointId: Record<string, PointDetails>;
  locationsBySlug: Record<string, { pointIds: string[] }>;
}

export type OfflineGuideStatus =
  | "not-downloaded"
  | "downloading"
  | "ready"
  | "update-available"
  | "error";

const DB_NAME = "na-stezce-offline";
const STORE_NAME = "guide";

function isIndexedDbAvailable() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openGuideDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

export async function saveOfflineGuide(guide: OfflineGuidePayload): Promise<void> {
  const db = await openGuideDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(guide, "current");

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to save guide."));
  });

  db.close();
}

export async function loadOfflineGuide(): Promise<OfflineGuidePayload | null> {
  const db = await openGuideDatabase();

  const result = await new Promise<OfflineGuidePayload | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get("current");

    request.onsuccess = () => {
      const value = request.result as OfflineGuidePayload | undefined;
      resolve(value ?? null);
    };

    request.onerror = () => reject(request.error ?? new Error("Failed to load guide."));
  });

  db.close();
  return result;
}

export async function deleteOfflineGuide(): Promise<void> {
  const db = await openGuideDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete("current");

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to delete guide."));
  });

  db.close();
}

export async function getOfflineGuideStatus(): Promise<OfflineGuideStatus> {
  try {
    const guide = await loadOfflineGuide();
    return guide ? "ready" : "not-downloaded";
  } catch (error) {
    console.error("Unable to determine offline guide status", error);
    return "error";
  }
}

export function isInstalledPwa(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator && Boolean((window.navigator as any).standalone);
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  return (standaloneMatch || iosStandalone) && !isLocalhost;
}

export async function getOfflineGuideRuntimeState() {
  const guide = await loadOfflineGuide().catch(() => null);
  const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
  const pwaInstalled = isInstalledPwa();

  return {
    guide,
    isOffline,
    hasGuide: !!guide,
    pwaInstalled,
    shouldUseOfflineFallback: !!guide && pwaInstalled,
    status: guide ? "ready" : "not-downloaded",
  };
}

export async function cacheOfflineGuideRoutes(guide: OfflineGuidePayload): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  const cacheNames = await caches.keys();
  const appShellCacheName = cacheNames.find((name) => name.startsWith("stezka-app-shell"));

  if (!appShellCacheName) {
    return;
  }

  const cache = await caches.open(appShellCacheName);
  const routeUrls = new Set<string>();

  for (const point of guide.points) {
    const rawSlug =
      point.location_id || `${point.id.replace(/^pt_/, "")}-${point.point_name || "bod"}`;
    const normalized = normalizeGuideSlug(rawSlug);

    if (normalized) {
      routeUrls.add(`/bod/${normalized}`);
    }
  }

  await Promise.all(
    [...routeUrls].map(async (url) => {
      try {
        const response = await fetch(url, { cache: "no-store" });

        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (error) {
        console.warn(`Unable to cache offline detail route: ${url}`, error);
      }
    })
  );
}

export async function downloadOfflineGuide(
  url = "/api/offline-guide.json"
): Promise<OfflineGuidePayload> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Offline guide failed to download (${response.status}).`);
  }

  const guide = (await response.json()) as OfflineGuidePayload;

  if (!guide?.version || !Array.isArray(guide.points) || !guide.detailsByPointId) {
    throw new Error("Downloaded offline guide is missing required data.");
  }

  await saveOfflineGuide(guide);
  await cacheOfflineGuideRoutes(guide);
  return guide;
}

export function normalizeGuideSlug(value?: string | null): string {
  return slugify(value ?? "");
}

export function getGuideRoutePoints(guide: OfflineGuidePayload, slug: string) {
  const normalizedSlug = normalizeGuideSlug(slug);

  if (!normalizedSlug) {
    return [] as Point[];
  }

  const directMatches = guide.points.filter((point) => {
    const generatedSlug = normalizeGuideSlug(
      point.location_id || `${point.id.replace(/^pt_/, "")}-${point.point_name}`
    );

    if (generatedSlug === normalizedSlug) {
      return true;
    }

    if (point.location_id) {
      return normalizeGuideSlug(point.location_id) === normalizedSlug;
    }

    return false;
  });

  if (directMatches.length) {
    if (directMatches[0]?.location_id) {
      return guide.points.filter((point) => point.location_id === directMatches[0].location_id);
    }

    return directMatches;
  }

  const pointIdMatch = normalizedSlug.match(/^(\d+)/);
  if (pointIdMatch) {
    const pointId = `pt_${pointIdMatch[1]}`;
    return guide.points.filter((point) => point.id === pointId);
  }

  return guide.points.filter((point) => normalizeGuideSlug(point.location_id) === normalizedSlug);
}

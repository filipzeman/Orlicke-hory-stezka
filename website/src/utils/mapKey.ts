export function mapKey<T extends Record<string, string>>(map: T, value?: string) {
  if (!value) return null;
  return map[value] ?? null;
}

type NavItem = {
  name: string;
  slug: string;
};

export function slugify(text: string): string {
  return text
    .normalize("NFD") // separate diacritics
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces -> hyphen
    .replace(/[^a-z0-9-]/g, "") // remove remaining special chars
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

export function createNavItems(names: string[]): NavItem[] {
  return names.map((name) => ({
    name,
    slug: slugify(name),
  }));
}
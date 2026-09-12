import { groupListings, type ProductGroup, type ProductListing } from "@/lib/search";

const browseListingsCacheKey = "kitne-rupay:browse-listings";

function isListing(value: unknown): value is ProductListing {
  if (!value || typeof value !== "object") {
    return false;
  }

  const listing = value as Partial<ProductListing>;
  return typeof listing.id === "string" && typeof listing.title === "string" && typeof listing.link === "string";
}

export function readBrowseListingsCache() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const cached = window.sessionStorage.getItem(browseListingsCacheKey);
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.filter(isListing) : [];
  } catch {
    return [];
  }
}

export function writeBrowseListingsCache(listings: ProductListing[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(browseListingsCacheKey, JSON.stringify(listings));
  } catch {
    // Session storage is a convenience cache; the app still works without it.
  }
}

export function findCachedProductGroup(slug: string, listings: ProductListing[]): ProductGroup | undefined {
  return groupListings(listings).find((group) => group.id === slug);
}

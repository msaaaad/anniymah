import {
  MAX_COLLECTION_ITEMS,
  MAX_FEATURES,
  type CollectionItem,
  type FeatureItem,
} from "@/lib/types";

export function parseCollectionItems(raw: unknown): CollectionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_COLLECTION_ITEMS).map((item) => ({
    name: typeof item?.name === "string" ? item.name : "",
    description: typeof item?.description === "string" ? item.description : "",
    imageUrl: typeof item?.imageUrl === "string" ? item.imageUrl : "",
  }));
}

export function parseFeatures(raw: unknown): FeatureItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_FEATURES).map((item) => ({
    title: typeof item?.title === "string" ? item.title : "",
    description: typeof item?.description === "string" ? item.description : "",
  }));
}

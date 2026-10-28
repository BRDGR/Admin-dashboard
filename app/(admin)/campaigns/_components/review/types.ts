export type ReviewTab = "materials" | "commercials" | "targeting" | "decision";

export interface NormalizedMaterial {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "archive" | "copy" | "link";
  url?: string;
  thumbnailUrl?: string;
  fileSize?: string | number;
  format?: string;
  duration?: number;
  snippet?: string;
  isReviewed?: boolean;
}

export interface MediaPreviewItem {
  url: string;
  name: string;
  type: "image" | "video" | "document";
}

/**
 * CC-14's complaint categories, for the UI (CC-27).
 *
 * The values MUST match `campus_cure_backend/src/services/intake/rules.ts`.
 * Routing matches a staff member's `handlesCategories` against the category
 * intake assigned, so a label drifting from a value here is a routing dead end
 * that matches nothing and explains nothing — which is why the backend
 * validates every value it is sent rather than trusting this list.
 */
export const COMPLAINT_CATEGORIES = [
  "FAN",
  "LIGHT",
  "SMART_BOARD",
  "NETWORK",
  "SEATING",
  "FURNITURE",
  "OTHER",
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<string, string> = {
  FAN: "Fans",
  LIGHT: "Lights",
  SMART_BOARD: "Projectors & smart boards",
  NETWORK: "Wifi & network",
  SEATING: "Chairs & benches",
  FURNITURE: "Desks, doors & windows",
  OTHER: "Anything else",
};

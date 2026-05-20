export const SUBSCRIPTION_TIERS = {
  free: {
    maxTrips: 3,
    maxItemsPerTrip: 20,
    maxStorageMB: 10,
    weatherDays: 1,
    globeInteractive: false,
    csvExport: false,
    calendarExport: false,
    maxTemplates: 3,
    sharePoster: false,
    aiSuggestions: false,
    noAds: false,
    prioritySupport: false,
  },
  pro: {
    maxTrips: Infinity,
    maxItemsPerTrip: Infinity,
    maxStorageMB: 1024,
    weatherDays: 7,
    globeInteractive: true,
    csvExport: true,
    calendarExport: true,
    maxTemplates: Infinity,
    sharePoster: true,
    aiSuggestions: false,
    noAds: true,
    prioritySupport: false,
  },
  plus: {
    maxTrips: Infinity,
    maxItemsPerTrip: Infinity,
    maxStorageMB: 5120,
    weatherDays: 15,
    globeInteractive: true,
    csvExport: true,
    calendarExport: true,
    maxTemplates: Infinity,
    sharePoster: true,
    aiSuggestions: true,
    noAds: true,
    prioritySupport: true,
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const ITEM_TYPES = [
  "flight",
  "hotel",
  "activity",
  "restaurant",
  "transport",
  "note",
] as const;

export const ITEM_TYPE_CONFIG = {
  flight: { label: "航班", color: "#007AFF", icon: "plane" },
  hotel: { label: "住宿", color: "#AF52DE", icon: "building" },
  activity: { label: "活动", color: "#FF9500", icon: "ticket" },
  restaurant: { label: "餐饮", color: "#FF3B30", icon: "utensils-crossed" },
  transport: { label: "交通", color: "#007AFF", icon: "train" },
  note: { label: "备注", color: "#34C759", icon: "sticky-note" },
} as const;

export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "accommodation",
  "activity",
  "shopping",
  "other",
] as const;

export const DOCUMENT_CATEGORIES = [
  "ticket",
  "passport",
  "visa",
  "insurance",
  "other",
] as const;

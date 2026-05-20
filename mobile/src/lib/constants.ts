// ====== Luxury/Editorial Design System ======
// Aesthetic: Vogue Travel × Apple HIG. Deep navy + champagne gold. Generous whitespace. Serif display.

export const Colors = {
  light: {
    background: "#FAF8F5",        // warm cream — like premium paper stock
    surface: "#FFFFFF",
    surfaceSecondary: "#F5F3EF",
    textPrimary: "#1A1A1A",
    textSecondary: "#6B6B6B",
    textTertiary: "#9E9E9E",
    separator: "#E8E5DF",
    tint: "#1A2744",             // deep navy — authoritative, luxurious
    accent: "#C9A96E",           // champagne gold — first-class accent
    glass: "rgba(255,255,255,0.78)",
    glassBorder: "rgba(0,0,0,0.06)",
  },
  dark: {
    background: "#0D1117",
    surface: "#161B22",
    surfaceSecondary: "#1C2333",
    textPrimary: "#EAE6DD",
    textSecondary: "#8B8D91",
    textTertiary: "#5A5D62",
    separator: "#21262D",
    tint: "#3B5F8C",
    accent: "#D4AF37",
    glass: "rgba(22,27,34,0.82)",
    glassBorder: "rgba(255,255,255,0.06)",
  },
} as const;

export const ItemColors = {
  flight:    { bg: "#E8ECF1", fg: "#5B7A9E" },
  hotel:     { bg: "#EDE4F0", fg: "#8B6B9E" },
  activity:  { bg: "#FDF0E4", fg: "#B8845C" },
  restaurant:{ bg: "#F3E8E7", fg: "#B86767" },
  transport: { bg: "#E8ECF1", fg: "#5B7A9E" },
  note:      { bg: "#E4EDE8", fg: "#5E8B6F" },
} as const;

export const ItemLabels: Record<string, string> = {
  flight: "航班", hotel: "住宿", activity: "活动",
  restaurant: "餐饮", transport: "交通", note: "备注",
};

export const API_BASE_URL = "http://localhost:3001";

// Typography tokens (loaded via Google Fonts on web)
export const Fonts = {
  display: "Playfair Display, Georgia, serif",
  body: "Cormorant Garamond, Georgia, serif",
};

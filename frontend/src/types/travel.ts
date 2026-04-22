export type TravelType = "business" | "leisure" | "outdoor";

export type Travel = {
  id:              number;
  destination:     string;
  city_code:       string;
  nights:          number;
  laundry:         boolean;
  travel_type:     TravelType;
  start_date:      string | null;
  end_date:        string | null;
  days_until_trip: number | null;
  created_at:      string;
  updated_at:      string;
};

export type PackingItemRecord = {
  id:         number;
  travel_id:  number;
  category:   string;
  name:       string;
  quantity:   number | null;
  note:       string | null;
  checked:    boolean;
  created_at: string;
  updated_at: string;
};

export type TravelDetail = Travel & {
  packing_items: PackingItemRecord[];
};

export const TRAVEL_TYPE_META: Record<TravelType, { label: string; emoji: string; color: string }> = {
  business: { label: "ビジネス",    emoji: "💼", color: "text-gray-700 bg-gray-100" },
  leisure:  { label: "観光",        emoji: "🏖️", color: "text-orange-700 bg-orange-100" },
  outdoor:  { label: "アウトドア",  emoji: "🏕️", color: "text-green-700 bg-green-100" },
};

export const CATEGORY_META: Record<string, { label: string; emoji: string; border: string; bg: string; badge: string }> = {
  clothing:    { label: "着替え",      emoji: "👕", border: "border-blue-200",   bg: "bg-blue-50",   badge: "bg-blue-100 text-blue-700" },
  outerwear:   { label: "服装",        emoji: "🧥", border: "border-indigo-200", bg: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-700" },
  rain_gear:   { label: "雨具",        emoji: "☔", border: "border-sky-200",    bg: "bg-sky-50",    badge: "bg-sky-100 text-sky-700" },
  medicine:    { label: "常備薬",      emoji: "💊", border: "border-green-200",  bg: "bg-green-50",  badge: "bg-green-100 text-green-700" },
  gadgets:     { label: "ガジェット",  emoji: "🔌", border: "border-purple-200", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700" },
  travel_type: { label: "旅行タイプ別", emoji: "✈️", border: "border-orange-200", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700" },
};

export const CATEGORY_ORDER = ["clothing", "outerwear", "rain_gear", "medicine", "gadgets", "travel_type"] as const;

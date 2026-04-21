export type PackingItem = {
  name: string;
  category: string;
  qty: number;
};

export type ChanceOfRain = {
  T00_06: number | null;
  T06_12: number | null;
  T12_18: number | null;
  T18_24: number | null;
};

export type WeatherSummary = {
  date: string;
  date_label: string;
  telop: string;
  temp_min: number | null;
  temp_max: number | null;
  chance_of_rain: ChanceOfRain;
};

export type PackingListResponse = {
  city_code: string;
  nights: number;
  items: PackingItem[];
  weather: WeatherSummary[];
};

export type City = {
  code: string;
  name: string;
  region: string;
};

export const CITIES: City[] = [
  { code: "016010", name: "札幌",   region: "北海道" },
  { code: "040010", name: "仙台",   region: "東北" },
  { code: "130010", name: "東京",   region: "関東" },
  { code: "150010", name: "新潟",   region: "中部" },
  { code: "170010", name: "金沢",   region: "中部" },
  { code: "230010", name: "名古屋", region: "東海" },
  { code: "260010", name: "京都",   region: "近畿" },
  { code: "270000", name: "大阪",   region: "近畿" },
  { code: "280010", name: "神戸",   region: "近畿" },
  { code: "340010", name: "広島",   region: "中国" },
  { code: "380010", name: "松山",   region: "四国" },
  { code: "400010", name: "福岡",   region: "九州" },
  { code: "471010", name: "那覇",   region: "沖縄" },
];

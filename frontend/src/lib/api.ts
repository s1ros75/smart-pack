import type { WeatherToday, PackingListResult } from "@/types/packing";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchHealth(): Promise<{ status: string; message: string; timestamp: string; database: string }> {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchWeather(cityCode: string): Promise<WeatherToday> {
  const res = await fetch(`${API_URL}/api/weather?city_code=${cityCode}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "天気情報の取得に失敗しました");
  }
  return res.json();
}

export async function createPackingList(params: {
  cityCode: string;
  nights:   number;
  laundry:  boolean;
}): Promise<PackingListResult> {
  const res = await fetch(`${API_URL}/api/packing_list`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      city_code: params.cityCode,
      nights:    params.nights,
      laundry:   params.laundry,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "リストの取得に失敗しました");
  }
  return res.json();
}

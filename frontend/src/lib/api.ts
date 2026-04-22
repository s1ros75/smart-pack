import type { WeatherToday, PackingListResult, PeriodForecast } from "@/types/packing";
import type { Travel, TravelDetail, PackingItemRecord } from "@/types/travel";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ---- Health ----

export async function fetchHealth(): Promise<{ status: string; message: string; timestamp: string; database: string }> {
  const res = await fetch(`${API_URL}/api/health`);
  return handleResponse(res);
}

// ---- Weather ----

export async function fetchWeather(cityCode: string): Promise<WeatherToday> {
  const res = await fetch(`${API_URL}/api/weather?city_code=${cityCode}`);
  return handleResponse(res);
}

export async function fetchWeatherPeriod(
  cityCode:  string,
  startDate: string,
  endDate:   string
): Promise<PeriodForecast> {
  const res = await fetch(
    `${API_URL}/api/weather?city_code=${cityCode}&start_date=${startDate}&end_date=${endDate}`
  );
  return handleResponse(res);
}

// ---- Packing list (stateless, legacy) ----

export async function createPackingList(params: {
  cityCode: string;
  nights:   number;
  laundry:  boolean;
}): Promise<PackingListResult> {
  const res = await fetch(`${API_URL}/api/packing_list`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ city_code: params.cityCode, nights: params.nights, laundry: params.laundry }),
  });
  return handleResponse(res);
}

// ---- Travels ----

export async function fetchTravels(): Promise<TravelDetail[]> {
  const res = await fetch(`${API_URL}/api/travels`);
  return handleResponse(res);
}

export async function fetchTravel(id: number): Promise<TravelDetail> {
  const res = await fetch(`${API_URL}/api/travels/${id}`);
  return handleResponse(res);
}

export async function createTravel(params: {
  cityCode:    string;
  nights:      number;
  laundry:     boolean;
  travelType:  string;
  startDate?:  string;
  endDate?:    string;
}): Promise<TravelDetail> {
  const res = await fetch(`${API_URL}/api/travels`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      city_code:   params.cityCode,
      nights:      params.nights,
      laundry:     params.laundry,
      travel_type: params.travelType,
      start_date:  params.startDate,
      end_date:    params.endDate,
    }),
  });
  return handleResponse(res);
}

export async function duplicateTravel(id: number): Promise<TravelDetail> {
  const res = await fetch(`${API_URL}/api/travels/${id}/duplicate`, { method: "POST" });
  return handleResponse(res);
}

export async function deleteTravel(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/travels/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ---- Packing items ----

export async function createPackingItem(
  travelId: number,
  params: { category: string; name: string; quantity?: number; note?: string }
): Promise<PackingItemRecord> {
  const res = await fetch(`${API_URL}/api/travels/${travelId}/packing_items`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function updatePackingItem(
  id: number,
  params: Partial<{ checked: boolean; name: string; quantity: number; note: string }>
): Promise<PackingItemRecord> {
  const res = await fetch(`${API_URL}/api/packing_items/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function deletePackingItem(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/packing_items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

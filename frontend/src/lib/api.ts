import type { PackingListResponse } from "@/types/packing";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchHealth(): Promise<{ status: string; timestamp: string }> {
  const res = await fetch(`${API_URL}/api/v1/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchPackingList(params: {
  cityCode: string;
  nights: number;
  laundry: boolean;
}): Promise<PackingListResponse> {
  const query = new URLSearchParams({
    city_code: params.cityCode,
    nights:    String(params.nights),
    laundry:   String(params.laundry),
  });
  const res = await fetch(`${API_URL}/api/v1/packing_list?${query}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "リストの取得に失敗しました");
  }
  return res.json();
}

"use client";

import { useState } from "react";
import { fetchPackingList } from "@/lib/api";
import { CITIES } from "@/types/packing";
import type { PackingListResponse, PackingItem } from "@/types/packing";

const CATEGORIES = ["衣類", "衛生用品", "電子機器", "貴重品", "その他"];

function groupByCategory(items: PackingItem[]): Record<string, PackingItem[]> {
  return items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    const key = CATEGORIES.includes(item.category) ? item.category : "その他";
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

function maxRain(cor: Record<string, number | null>): number | null {
  const vals = Object.values(cor).filter((v): v is number => v !== null);
  return vals.length ? Math.max(...vals) : null;
}

export default function Home() {
  const [cityCode, setCityCode] = useState(CITIES[2].code); // 東京をデフォルト
  const [nights,   setNights]   = useState(2);
  const [laundry,  setLaundry]  = useState(false);
  const [result,   setResult]   = useState<PackingListResponse | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPackingList({ cityCode, nights, laundry });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const grouped       = result ? groupByCategory(result.items) : {};
  const selectedCity  = CITIES.find(c => c.code === cityCode);

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-blue-700">
        Smart Pack
      </h1>
      <p className="text-center text-gray-500 mb-8 text-sm">
        旅行先・日程を選ぶと、天気予報に基づいた最適な持ち物リストを自動生成します
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">旅行先</label>
          <select
            value={cityCode}
            onChange={e => setCityCode(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {CITIES.map(city => (
              <option key={city.code} value={city.code}>
                {city.name}（{city.region}）
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">宿泊数</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={30}
              value={nights}
              onChange={e => setNights(Number(e.target.value))}
              required
              className="w-24 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-500">泊</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="laundry"
            checked={laundry}
            onChange={e => setLaundry(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          <label htmlFor="laundry" className="text-sm text-gray-700">旅行中に洗濯できる</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? "取得中..." : "持ち物リストを生成"}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedCity?.name} / {result.nights}泊 の持ち物リスト
          </h2>

          {result.weather.length > 0 && (
            <div className="bg-sky-50 rounded-xl p-4">
              <h3 className="font-semibold text-sky-700 mb-3">3日間の天気予報</h3>
              <div className="grid grid-cols-3 gap-2">
                {result.weather.map(w => {
                  const rain = maxRain(w.chance_of_rain);
                  return (
                    <div key={w.date} className="bg-white rounded-xl px-3 py-3 text-sm shadow-sm text-center">
                      <div className="text-xs text-gray-400 mb-0.5">{w.date}</div>
                      <div className="font-bold text-gray-700 mb-1">{w.date_label}</div>
                      <div className="text-blue-600 font-medium mb-1">{w.telop}</div>
                      <div className="text-gray-600 text-xs">
                        {w.temp_min !== null ? `${w.temp_min}°C` : "－"} 〜 {w.temp_max !== null ? `${w.temp_max}°C` : "－"}
                      </div>
                      {rain !== null && (
                        <div className={`text-xs mt-1 font-medium ${rain >= 50 ? "text-blue-600" : "text-gray-400"}`}>
                          🌧 最大 {rain}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {CATEGORIES.filter(cat => grouped[cat]?.length).map(category => (
            <div key={category} className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">{category}</h3>
              <ul className="space-y-2">
                {grouped[category].map(item => (
                  <li key={item.name} className="flex items-center justify-between">
                    <span className="text-gray-800">{item.name}</span>
                    <span className="text-sm bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                      × {item.qty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

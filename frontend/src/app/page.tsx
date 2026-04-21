"use client";

import { useState, useEffect } from "react";
import { fetchHealth, fetchWeather, createPackingList } from "@/lib/api";
import { CITIES } from "@/types/packing";
import type { WeatherToday, PackingListResult } from "@/types/packing";
import WeatherCard from "@/components/WeatherCard";
import PackingList from "@/components/PackingList";

// ---- Health badge ----

type HealthState =
  | { status: "loading" }
  | { status: "ok"; message: string; timestamp: string; database: string }
  | { status: "error" };

function HealthBadge({ health }: { health: HealthState }) {
  if (health.status === "loading") {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span className="inline-block w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        バックエンド確認中...
      </div>
    );
  }
  if (health.status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="font-semibold text-red-600 text-sm">✗ バックエンド接続失敗</p>
        <p className="text-red-400 text-xs mt-0.5">サーバーに接続できませんでした</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
      <p className="font-semibold text-green-700 text-sm">✓ バックエンド接続成功</p>
      <div className="mt-1 space-y-0.5 text-xs text-green-600">
        <p>status: {health.status} &nbsp;|&nbsp; database: {health.database}</p>
        <p>{health.message}</p>
        <p className="text-green-400">{health.timestamp}</p>
      </div>
    </div>
  );
}

// ---- Weather widget state ----

type WeatherWidgetState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: WeatherToday }
  | { status: "error"; message: string };

// ---- Page ----

export default function Home() {
  const [cityCode, setCityCode] = useState(CITIES[2].code);
  const [nights,   setNights]   = useState(2);
  const [laundry,  setLaundry]  = useState(false);
  const [health,   setHealth]   = useState<HealthState>({ status: "loading" });
  const [weather,  setWeather]  = useState<WeatherWidgetState>({ status: "idle" });
  const [result,   setResult]   = useState<PackingListResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    fetchHealth()
      .then(data => setHealth({ status: "ok", ...data }))
      .catch(() => setHealth({ status: "error" }));
  }, []);

  useEffect(() => {
    setWeather({ status: "loading" });
    setResult(null);
    fetchWeather(cityCode)
      .then(data => setWeather({ status: "ok", data }))
      .catch(err  => setWeather({ status: "error", message: err instanceof Error ? err.message : "エラー" }));
  }, [cityCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await createPackingList({ cityCode, nights, laundry });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const selectedCity = CITIES.find(c => c.code === cityCode);

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-blue-700">Smart Pack</h1>
      <p className="text-center text-gray-500 mb-6 text-sm">
        旅行先・日程を選ぶと、天気予報に基づいた最適な持ち物リストを自動生成します
      </p>

      {/* ヘルスチェック */}
      <div className="mb-4">
        <HealthBadge health={health} />
      </div>

      {/* 都市選択 */}
      <div className="bg-white rounded-2xl shadow p-5 mb-4">
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

      {/* 天気ウィジェット */}
      <div className="mb-4">
        <WeatherCard state={weather} />
      </div>

      {/* パッキングフォーム */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-5 space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">宿泊数</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={14}
                value={nights}
                onChange={e => setNights(Number(e.target.value))}
                required
                className="w-24 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-gray-500 text-sm">泊</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="laundry"
              checked={laundry}
              onChange={e => setLaundry(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="laundry" className="text-sm text-gray-700">旅行中に洗濯できる</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
        >
          {loading ? "生成中..." : "パッキングリストを生成"}
        </button>
      </form>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* パッキングリスト結果 */}
      {result && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {selectedCity?.name} / {nights}泊 のパッキングリスト
          </h2>
          <PackingList list={result.packing_list} />
        </div>
      )}
    </main>
  );
}

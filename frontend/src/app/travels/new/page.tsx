"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWeather, fetchWeatherPeriod, createTravel } from "@/lib/api";
import { CITIES } from "@/types/packing";
import { TRAVEL_TYPE_META } from "@/types/travel";
import type { TravelType } from "@/types/travel";
import type { WeatherToday, PeriodForecast } from "@/types/packing";
import WeatherCard from "@/components/WeatherCard";

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: WeatherToday | PeriodForecast }
  | { status: "error"; message: string };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`;
}

export default function NewTravelPage() {
  const router = useRouter();

  const [cityCode,   setCityCode]   = useState(CITIES[2].code);
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");
  const [nights,     setNights]     = useState(2);
  const [laundry,    setLaundry]    = useState(false);
  const [travelType, setTravelType] = useState<TravelType>("leisure");
  const [weather,    setWeather]    = useState<WeatherState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [dateError,  setDateError]  = useState<string | null>(null);

  useEffect(() => {
    setWeather({ status: "loading" });
    const fetch =
      startDate && endDate && !dateError
        ? fetchWeatherPeriod(cityCode, startDate, endDate)
        : fetchWeather(cityCode);
    fetch
      .then(data => setWeather({ status: "ok", data }))
      .catch(err  => setWeather({ status: "error", message: err instanceof Error ? err.message : "エラー" }));
  }, [cityCode, startDate, endDate, dateError]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setDateError(null);
      return;
    }
    const diff = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
    );
    if (diff <= 0) {
      setDateError("帰宅日は出発日より後の日付を選択してください");
    } else {
      setDateError(null);
      setNights(diff);
    }
  }, [startDate, endDate]);

  const hasDates   = startDate !== "" && endDate !== "" && !dateError;
  const nightsCalc = hasDates
    ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
    : nights;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (dateError) return;
    setSubmitting(true);
    setError(null);
    try {
      const travel = await createTravel({
        cityCode,
        nights:    nightsCalc,
        laundry,
        travelType,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      });
      router.push(`/travels/${travel.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-800">新しい旅行プランを作成</h1>
      </div>

      {/* 都市選択 */}
      <div className="bg-white rounded-2xl shadow p-5 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">旅行先</label>
        <select
          value={cityCode}
          onChange={e => setCityCode(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {CITIES.map(city => (
            <option key={city.code} value={city.code}>{city.name}（{city.region}）</option>
          ))}
        </select>
      </div>

      {/* 天気カード */}
      <div className="mb-4">
        <WeatherCard state={weather} />
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-5 space-y-5">

        {/* 日程 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            日程
            <span className="text-xs font-normal text-gray-400 ml-1">（任意）</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">出発日</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">帰宅日</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  dateError ? "border-red-400 focus:ring-red-400" : "focus:ring-blue-400"
                }`}
              />
            </div>
          </div>

          {dateError && (
            <p className="mt-2 text-xs text-red-500">{dateError}</p>
          )}

          {hasDates && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
              <span className="font-medium">
                {formatDateLabel(startDate)}
                <span className="text-gray-400 mx-1.5">→</span>
                {formatDateLabel(endDate)}
              </span>
              <span className="ml-auto font-bold text-blue-600 whitespace-nowrap">
                {nightsCalc}泊{nightsCalc + 1}日
              </span>
            </div>
          )}
        </div>

        {/* 宿泊数（日程未入力時のみ表示） */}
        {!hasDates && (
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
                className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-gray-500">泊</span>
            </div>
          </div>
        )}

        {/* 旅行タイプ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">旅行タイプ</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(TRAVEL_TYPE_META) as [TravelType, typeof TRAVEL_TYPE_META[TravelType]][]).map(([type, meta]) => (
              <label
                key={type}
                className={`flex flex-col items-center gap-1 border-2 rounded-xl p-3 cursor-pointer transition text-center ${
                  travelType === type
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="travelType"
                  value={type}
                  checked={travelType === type}
                  onChange={() => setTravelType(type)}
                  className="sr-only"
                />
                <span className="text-2xl">{meta.emoji}</span>
                <span className="text-xs font-semibold text-gray-700">{meta.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 洗濯 */}
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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !!dateError}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
        >
          {submitting ? "生成中..." : "保存してパッキングリストを生成"}
        </button>
      </form>
    </main>
  );
}

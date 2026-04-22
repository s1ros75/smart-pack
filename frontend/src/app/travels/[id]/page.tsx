"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchTravel } from "@/lib/api";
import type { TravelDetail } from "@/types/travel";
import { TRAVEL_TYPE_META } from "@/types/travel";
import PackingListDetail from "@/components/PackingListDetail";

export default function TravelDetailPage() {
  const params = useParams();
  const id     = Number(params.id);

  const [travel,  setTravel]  = useState<TravelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetchTravel(id)
      .then(setTravel)
      .catch(err => setError(err instanceof Error ? err.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow p-5">
              <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error || !travel) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          {error ?? "旅行プランが見つかりません"}
        </div>
        <Link href="/" className="text-blue-600 text-sm hover:underline">← 一覧に戻る</Link>
      </main>
    );
  }

  const meta      = TRAVEL_TYPE_META[travel.travel_type];
  const dateRange = travel.start_date && travel.end_date
    ? `${travel.start_date} 〜 ${travel.end_date}`
    : `${travel.nights}泊`;

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition">← 一覧に戻る</Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{travel.destination}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{dateRange}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${meta.color}`}>
            {meta.emoji} {meta.label}
          </span>
        </div>
        <div className="flex gap-3 mt-3 text-sm text-gray-500">
          <span>🌙 {travel.nights}泊</span>
          <span>{travel.laundry ? "✓ 洗濯あり" : "✗ 洗濯なし"}</span>
        </div>
      </div>

      {/* パッキングリスト */}
      <PackingListDetail
        travelId={travel.id}
        initial={travel.packing_items}
      />
    </main>
  );
}

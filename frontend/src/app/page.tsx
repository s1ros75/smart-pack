"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchTravels, deleteTravel, duplicateTravel } from "@/lib/api";
import type { TravelDetail } from "@/types/travel";
import TravelCard from "@/components/TravelCard";

export default function Home() {
  const [travels, setTravels] = useState<TravelDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetchTravels()
      .then(setTravels)
      .catch(err => setError(err instanceof Error ? err.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    try {
      await deleteTravel(id);
      setTravels(prev => prev.filter(t => t.id !== id));
    } catch {
      alert("削除に失敗しました");
    }
  }

  async function handleDuplicate(id: number) {
    try {
      const copy = await duplicateTravel(id);
      setTravels(prev => [copy, ...prev]);
    } catch {
      alert("複製に失敗しました");
    }
  }

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Smart Pack</h1>
          <p className="text-sm text-gray-500 mt-1">旅行の持ち物を賢く管理</p>
        </div>
        <Link
          href="/travels/new"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          ＋ 新しい旅行プラン
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow p-5 animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
              <div className="h-2 w-full bg-gray-100 rounded mb-3" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && travels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-6xl mb-6">🧳</p>
          <p className="text-xl font-semibold text-gray-600 mb-2">まだ旅行プランがありません</p>
          <p className="text-sm text-gray-400 mb-8">旅行の計画を立てて、持ち物をスマートに管理しましょう</p>
          <Link
            href="/travels/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
          >
            ＋ 新しい旅行プランを作成
          </Link>
        </div>
      )}

      {!loading && travels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {travels.map(travel => (
            <TravelCard
              key={travel.id}
              travel={travel}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </main>
  );
}

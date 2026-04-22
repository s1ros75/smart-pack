"use client";

import { useRouter } from "next/navigation";
import type { TravelDetail } from "@/types/travel";
import { TRAVEL_TYPE_META } from "@/types/travel";

type Props = {
  travel:      TravelDetail;
  onDelete:    (id: number) => void;
  onDuplicate: (id: number) => Promise<void>;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(dateStr: string): { text: string; day: number } {
  const d = new Date(dateStr + "T00:00:00");
  return { text: `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`, day: d.getDay() };
}

function weekdayColor(day: number): string {
  if (day === 0) return "text-red-500";
  if (day === 6) return "text-blue-500";
  return "text-gray-700";
}

type TripStatus = "future" | "today" | "ongoing" | "past";

function getTripStatus(startDate: string | null, endDate: string | null): {
  type:  TripStatus;
  label: string;
} | null {
  if (!startDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + "T00:00:00");
  const end   = endDate ? new Date(endDate + "T00:00:00") : null;

  if (end && today > end) {
    const days = Math.round((today.getTime() - end.getTime()) / 86400000);
    return { type: "past", label: `${days}日前の旅行` };
  }
  if (end && today >= start && today <= end) {
    return { type: "ongoing", label: "旅行中" };
  }
  const daysUntil = Math.round((start.getTime() - today.getTime()) / 86400000);
  if (daysUntil === 0) return { type: "today",  label: "今日出発！" };
  if (daysUntil > 0)   return { type: "future", label: `あと${daysUntil}日` };
  return null;
}

const STATUS_BADGE: Record<TripStatus, string> = {
  future:  "bg-blue-50 text-blue-600 border border-blue-200",
  today:   "bg-yellow-50 text-yellow-700 border border-yellow-300 font-bold",
  ongoing: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold",
  past:    "bg-gray-100 text-gray-400 border border-gray-200",
};

const CARD_ACCENT: Record<TripStatus, string> = {
  future:  "",
  today:   "ring-2 ring-yellow-300",
  ongoing: "ring-2 ring-emerald-400",
  past:    "opacity-75",
};

function formatCreatedAt(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日作成`;
}

export default function TravelCard({ travel, onDelete, onDuplicate }: Props) {
  const router  = useRouter();
  const meta    = TRAVEL_TYPE_META[travel.travel_type];
  const items   = travel.packing_items ?? [];
  const total   = items.length;
  const checked = items.filter(i => i.checked).length;
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;
  const done    = total > 0 && checked === total;

  const status = getTripStatus(travel.start_date, travel.end_date);

  const startFmt = travel.start_date ? formatDate(travel.start_date) : null;
  const endFmt   = travel.end_date   ? formatDate(travel.end_date)   : null;

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("この旅行プランを削除しますか？")) return;
    onDelete(travel.id);
  }

  async function handleDuplicate(e: React.MouseEvent) {
    e.stopPropagation();
    await onDuplicate(travel.id);
  }

  return (
    <div
      onClick={() => router.push(`/travels/${travel.id}`)}
      className={`relative bg-white rounded-2xl shadow p-5 flex flex-col gap-3 cursor-pointer hover:shadow-xl transition-all duration-200 active:scale-[0.99] ${status ? CARD_ACCENT[status.type] : ""}`}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
        <button
          onClick={handleDuplicate}
          className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
          aria-label="複製"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          aria-label="削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Destination + type badge */}
      <div className="flex items-start gap-2 pr-16">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">{travel.destination}</h2>

          {/* 日程表示 */}
          {startFmt && endFmt ? (
            <p className="text-sm mt-0.5">
              <span className={weekdayColor(startFmt.day)}>{startFmt.text}</span>
              <span className="text-gray-300 mx-1">–</span>
              <span className={weekdayColor(endFmt.day)}>{endFmt.text}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-0.5">{travel.nights}泊</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
            {meta.emoji} {meta.label}
          </span>
          {done && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              ✓ 完了
            </span>
          )}
        </div>
      </div>

      {/* 旅行ステータスバッジ */}
      {status && (
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_BADGE[status.type]}`}>
            {status.type === "ongoing" && "✈️ "}
            {status.type === "today"   && "🚀 "}
            {status.label}
          </span>
          {travel.start_date && (
            <span className="text-xs text-gray-400">{travel.nights}泊{travel.nights + 1}日</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>パッキング進捗</span>
            <span className="font-medium">{checked} / {total} ({pct}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${done ? "bg-emerald-500" : "bg-blue-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400">{formatCreatedAt(travel.created_at)}</span>
        <span className="text-xs text-gray-500">
          {travel.laundry ? "🧺 洗濯あり" : "洗濯なし"}
        </span>
      </div>
    </div>
  );
}

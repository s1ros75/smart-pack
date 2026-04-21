"use client";

import { useState } from "react";
import type { PackingEntry, PackingList } from "@/types/packing";

type Category = {
  key:   keyof PackingList;
  label: string;
  emoji: string;
  color: string;      // border / header accent
  bg:    string;      // card background
  badge: string;      // qty badge
};

const CATEGORIES: Category[] = [
  { key: "clothing",  label: "着替え",  emoji: "👕", color: "border-blue-200",   bg: "bg-blue-50",   badge: "bg-blue-100 text-blue-700" },
  { key: "outerwear", label: "服装",    emoji: "🧥", color: "border-indigo-200", bg: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-700" },
  { key: "rain_gear", label: "雨具",    emoji: "☔", color: "border-sky-200",    bg: "bg-sky-50",    badge: "bg-sky-100 text-sky-700" },
  { key: "medicine",  label: "常備薬",  emoji: "💊", color: "border-green-200",  bg: "bg-green-50",  badge: "bg-green-100 text-green-700" },
  { key: "gadgets",   label: "ガジェット", emoji: "🔌", color: "border-purple-200", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700" },
];

function ItemRow({
  item,
  checked,
  onToggle,
  badgeClass,
}: {
  item:       PackingEntry;
  checked:    boolean;
  onToggle:   () => void;
  badgeClass: string;
}) {
  return (
    <li
      className={`flex items-center gap-3 py-2 px-1 rounded-lg cursor-pointer select-none transition-opacity ${checked ? "opacity-40" : ""}`}
      onClick={onToggle}
    >
      <span className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${checked ? "bg-gray-400 border-gray-400" : "border-gray-300 bg-white"}`}>
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </span>
      <span className={`flex-1 text-sm font-medium ${checked ? "line-through text-gray-400" : "text-gray-800"}`}>
        {item.name}
      </span>
      <div className="flex items-center gap-1.5">
        {item.quantity && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
            × {item.quantity}
          </span>
        )}
        {item.note && (
          <span className="text-xs text-gray-400 hidden sm:inline">{item.note}</span>
        )}
      </div>
    </li>
  );
}

export default function PackingList({ list }: { list: PackingList }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const visibleCategories = CATEGORIES.filter(cat => list[cat.key].length > 0);

  const totalItems   = visibleCategories.reduce((s, c) => s + list[c.key].length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress     = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 進捗バー */}
      <div className="bg-white rounded-xl shadow px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">パッキング進捗</span>
          <span className="text-sm text-gray-500">{checkedCount} / {totalItems} 個</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-center text-green-600 font-semibold text-sm mt-2">✓ 準備完了！</p>
        )}
      </div>

      {/* カテゴリ別リスト */}
      {visibleCategories.map(cat => (
        <div key={cat.key} className={`rounded-xl border ${cat.color} ${cat.bg} px-5 py-4`}>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">{cat.emoji}</span>
            {cat.label}
            <span className="ml-auto text-xs text-gray-400 font-normal">
              {list[cat.key].filter(item => checked[`${cat.key}-${item.name}`]).length} / {list[cat.key].length}
            </span>
          </h3>
          <ul className="divide-y divide-white/60">
            {list[cat.key].map(item => {
              const id = `${cat.key}-${item.name}`;
              return (
                <ItemRow
                  key={id}
                  item={item}
                  checked={!!checked[id]}
                  onToggle={() => toggle(id)}
                  badgeClass={cat.badge}
                />
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

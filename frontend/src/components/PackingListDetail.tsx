"use client";

import { useState, useRef } from "react";
import type { PackingItemRecord } from "@/types/travel";
import { CATEGORY_META, CATEGORY_ORDER } from "@/types/travel";
import { updatePackingItem, deletePackingItem, createPackingItem } from "@/lib/api";

type Props = {
  travelId: number;
  initial:  PackingItemRecord[];
};

const ALL_CATEGORIES = CATEGORY_ORDER.map(k => ({
  value: k,
  label: `${CATEGORY_META[k]?.emoji ?? ""} ${CATEGORY_META[k]?.label ?? k}`,
}));

export default function PackingListDetail({ travelId, initial }: Props) {
  const [items,     setItems]     = useState<PackingItemRecord[]>(initial);
  const [addCat,    setAddCat]    = useState("clothing");
  const [addName,   setAddName]   = useState("");
  const [addQty,    setAddQty]    = useState("");
  const [addNote,   setAddNote]   = useState("");
  const [adding,    setAdding]    = useState(false);
  const [addError,  setAddError]  = useState<string | null>(null);
  const [toggling,  setToggling]  = useState<Set<number>>(new Set());
  const [editNote,  setEditNote]  = useState<{ id: number; text: string } | null>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  const total     = items.length;
  const doneCount = items.filter(i => i.checked).length;
  const progress  = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const grouped = items.reduce<Record<string, PackingItemRecord[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] ?? []), item];
    return acc;
  }, {});
  const sortedCategories = [
    ...CATEGORY_ORDER.filter(k => grouped[k]?.length),
    ...Object.keys(grouped).filter(k => !(CATEGORY_ORDER as readonly string[]).includes(k)),
  ];

  async function toggle(item: PackingItemRecord) {
    if (toggling.has(item.id)) return;
    setToggling(prev => new Set(prev).add(item.id));
    try {
      const updated = await updatePackingItem(item.id, { checked: !item.checked });
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  }

  async function remove(id: number) {
    await deletePackingItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function startEditNote(item: PackingItemRecord) {
    setEditNote({ id: item.id, text: item.note ?? "" });
    setTimeout(() => noteInputRef.current?.focus(), 0);
  }

  async function saveNote(id: number, text: string) {
    setEditNote(null);
    const trimmed = text.trim();
    const current = items.find(i => i.id === id);
    if ((current?.note ?? "") === trimmed) return;
    try {
      const updated = await updatePackingItem(id, { note: trimmed || undefined });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch {
      // silently ignore; note just won't persist
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const newItem = await createPackingItem(travelId, {
        category: addCat,
        name:     addName.trim(),
        quantity: addQty ? Number(addQty) : undefined,
        note:     addNote.trim() || undefined,
      });
      setItems(prev => [...prev, newItem]);
      setAddName(""); setAddQty(""); setAddNote("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "追加に失敗しました");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* 進捗バー */}
      <div className="bg-white rounded-xl shadow px-4 py-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">パッキング進捗</span>
          <span className="text-gray-500">{doneCount} / {total} 個（{progress}%）</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${progress === 100 && total > 0 ? "bg-emerald-500" : "bg-blue-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && total > 0 && (
          <p className="text-center text-emerald-600 font-semibold text-sm mt-2">✓ 準備完了！</p>
        )}
      </div>

      {/* カテゴリ別リスト */}
      {sortedCategories.map(cat => {
        const meta = CATEGORY_META[cat] ?? { label: cat, emoji: "📦", border: "border-gray-200", bg: "bg-gray-50", badge: "bg-gray-100 text-gray-700" };
        return (
          <div key={cat} className={`rounded-xl border ${meta.border} ${meta.bg} px-4 py-4`}>
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-xl">{meta.emoji}</span>
              {meta.label}
              <span className="ml-auto text-xs text-gray-400 font-normal">
                {grouped[cat].filter(i => i.checked).length} / {grouped[cat].length}
              </span>
            </h3>
            <ul className="space-y-1">
              {grouped[cat].map(item => (
                <li key={item.id} className={`flex flex-col rounded-lg px-2 py-2 group transition-colors ${item.checked ? "opacity-50" : "hover:bg-white/60"}`}>
                  <div className="flex items-center gap-3">
                    {/* Checkbox — large tap target */}
                    <button
                      onClick={() => toggle(item)}
                      disabled={toggling.has(item.id)}
                      className={`w-6 h-6 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors touch-manipulation ${
                        item.checked
                          ? "bg-gray-400 border-gray-400"
                          : "border-gray-300 bg-white hover:border-blue-400 active:border-blue-500"
                      }`}
                    >
                      {item.checked && <span className="text-white text-xs font-bold leading-none">✓</span>}
                    </button>

                    <span
                      onClick={() => toggle(item)}
                      className={`flex-1 text-sm font-medium select-none cursor-pointer ${item.checked ? "line-through text-gray-400" : "text-gray-800"}`}
                    >
                      {item.name}
                    </span>

                    {item.quantity && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${meta.badge}`}>×{item.quantity}</span>
                    )}

                    {/* Delete button — always visible on mobile, hover-only on desktop */}
                    <button
                      onClick={() => remove(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 active:text-red-500 transition flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                      aria-label="削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Note row */}
                  <div className="pl-9 mt-0.5">
                    {editNote?.id === item.id ? (
                      <input
                        ref={noteInputRef}
                        type="text"
                        value={editNote.text}
                        onChange={e => setEditNote({ id: item.id, text: e.target.value })}
                        onBlur={() => saveNote(item.id, editNote.text)}
                        onKeyDown={e => {
                          if (e.key === "Enter") { e.preventDefault(); saveNote(item.id, editNote.text); }
                          if (e.key === "Escape") setEditNote(null);
                        }}
                        placeholder="メモを入力..."
                        className="w-full text-xs border-b border-blue-400 focus:outline-none bg-transparent text-gray-600 py-0.5"
                      />
                    ) : (
                      <button
                        onClick={() => startEditNote(item)}
                        className={`text-xs text-left transition w-full ${
                          item.note
                            ? "text-gray-400 hover:text-blue-500"
                            : "text-gray-200 hover:text-gray-400 sm:opacity-0 sm:group-hover:opacity-100"
                        }`}
                      >
                        {item.note ? `📝 ${item.note}` : "メモを追加..."}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* アイテム追加フォーム */}
      <div className="bg-white rounded-xl shadow px-4 py-4">
        <h3 className="font-bold text-gray-700 mb-3">＋ アイテムを追加</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">カテゴリ</label>
              <select
                value={addCat}
                onChange={e => setAddCat(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {ALL_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">アイテム名 *</label>
              <input
                type="text"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                placeholder="例: 日焼け止め"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">数量（任意）</label>
              <input
                type="number"
                min={1}
                value={addQty}
                onChange={e => setAddQty(e.target.value)}
                placeholder="例: 2"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">メモ（任意）</label>
              <input
                type="text"
                value={addNote}
                onChange={e => setAddNote(e.target.value)}
                placeholder="例: 旅行先で購入可"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          {addError && <p className="text-red-600 text-xs">{addError}</p>}
          <button
            type="submit"
            disabled={adding || !addName.trim()}
            className="w-full bg-gray-700 hover:bg-gray-800 active:bg-gray-900 disabled:opacity-40 text-white text-sm font-semibold py-3 rounded-lg transition touch-manipulation"
          >
            {adding ? "追加中..." : "追加する"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-100 text-emerald-700", edge: "border-l-emerald-400" },
  medium: { label: "ปานกลาง", badge: "bg-amber-100 text-amber-700", edge: "border-l-amber-400" },
  high: { label: "สูง", badge: "bg-rose-100 text-rose-700", edge: "border-l-rose-400" },
};
const ORDER = ["low", "medium", "high"];
const FILTERS = [
  ["all", "ทั้งหมด"],
  ["active", "ยังไม่เสร็จ"],
  ["completed", "เสร็จแล้ว"],
];

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const add = () => {
    const value = text.trim();
    if (!value) return;
    setTodos([{ id: Date.now(), text: value, done: false, priority, removing: false }, ...todos]);
    setText("");
  };

  const toggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const cyclePriority = (id) =>
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t
      )
    );

  const remove = (ids) => {
    setTodos((list) => list.map((t) => (ids.includes(t.id) ? { ...t, removing: true } : t)));
    setTimeout(() => setTodos((list) => list.filter((t) => !ids.includes(t.id))), 300);
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditText(t.text);
  };

  const saveEdit = () => {
    const value = editText.trim();
    if (value) setTodos(todos.map((t) => (t.id === editingId ? { ...t, text: value } : t)));
    setEditingId(null);
  };

  const remaining = todos.filter((t) => !t.done).length;
  const doneIds = todos.filter((t) => t.done && !t.removing).map((t) => t.id);
  const visible = todos.filter(
    (t) => filter === "all" || (filter === "active" ? !t.done : t.done)
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:py-14">
      <main className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">รายการสิ่งที่ต้องทำ</h1>

        <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-md sm:flex-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="เพิ่มงานใหม่..."
            aria-label="งานใหม่"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <div className="flex gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="ระดับความสำคัญ"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 sm:flex-none"
            >
              {ORDER.map((p) => (
                <option key={p} value={p}>
                  ความสำคัญ: {PRIORITIES[p].label}
                </option>
              ))}
            </select>
            <button
              onClick={add}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              <Plus size={18} /> เพิ่ม
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-2" role="tablist">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {visible.length === 0 && (
            <li className="rounded-2xl bg-white p-8 text-center text-slate-400 shadow-sm">
              ยังไม่มีงานในหมวดนี้
            </li>
          )}
          {visible.map((t) => (
            <li
              key={t.id}
              className={`pop-in flex items-center gap-3 rounded-2xl border-l-4 bg-white p-4 shadow-md transition-all duration-300 ${
                PRIORITIES[t.priority].edge
              } ${t.removing ? "translate-x-6 opacity-0" : ""}`}
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                aria-label={`ทำเสร็จแล้ว: ${t.text}`}
                className="h-5 w-5 shrink-0 accent-indigo-600"
              />

              {editingId === t.id ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="min-w-0 flex-1 rounded border border-indigo-300 px-2 py-1 outline-none"
                />
              ) : (
                <span
                  onDoubleClick={() => startEdit(t)}
                  title="ดับเบิลคลิกเพื่อแก้ไข"
                  className={`min-w-0 flex-1 break-words ${
                    t.done ? "text-slate-400 line-through" : ""
                  }`}
                >
                  {t.text}
                </span>
              )}

              <button
                onClick={() => cyclePriority(t.id)}
                title="คลิกเพื่อเปลี่ยนระดับความสำคัญ"
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  PRIORITIES[t.priority].badge
                }`}
              >
                {PRIORITIES[t.priority].label}
              </button>
              <button
                onClick={() => startEdit(t)}
                aria-label="แก้ไข"
                className="shrink-0 text-slate-400 transition hover:text-indigo-600"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => remove([t.id])}
                aria-label="ลบ"
                className="shrink-0 text-slate-400 transition hover:text-rose-600"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>เหลืออีก {remaining} งาน</span>
          <button
            onClick={() => remove(doneIds)}
            disabled={doneIds.length === 0}
            className="rounded-lg px-3 py-1.5 font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            ล้างงานที่เสร็จแล้ว
          </button>
        </div>
      </main>
    </div>
  );
}

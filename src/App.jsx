import { useState } from "react";
import { Plus, Trash2, Pencil, Search, CalendarDays } from "lucide-react";

const PRIORITIES = {
  low: {
    label: "ต่ำ",
    badge: "bg-emerald-100 text-emerald-700",
    edge: "border-l-emerald-400",
  },
  medium: {
    label: "ปานกลาง",
    badge: "bg-amber-100 text-amber-700",
    edge: "border-l-amber-400",
  },
  high: {
    label: "สูง",
    badge: "bg-rose-100 text-rose-700",
    edge: "border-l-rose-400",
  },
};
const ORDER = ["low", "medium", "high"];
const CATS = {
  work: "งาน",
  personal: "ส่วนตัว",
  shopping: "ช้อปปิ้ง",
  health: "สุขภาพ",
};
const FILTERS = [
  ["all", "ทั้งหมด"],
  ["active", "ยังไม่เสร็จ"],
  ["completed", "เสร็จแล้ว"],
];

const fmt = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });

function Donut({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  let acc = 0;
  return (
    <svg
      viewBox="0 0 36 36"
      className="h-28 w-28 -rotate-90"
      role="img"
      aria-label="สัดส่วนสถานะงาน"
    >
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        strokeWidth="4"
        className="stroke-slate-100"
      />
      {total > 0 &&
        parts.map((p) => {
          const len = (p.value / total) * 100;
          const el =
            p.value > 0 ? (
              <circle
                key={p.name}
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                strokeWidth="4"
                className={p.stroke}
                strokeDasharray={`${len} ${100 - len}`}
                strokeDashoffset={-acc}
              />
            ) : null;
          acc += len;
          return el;
        })}
    </svg>
  );
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [cat, setCat] = useState("personal");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const today = new Date().toLocaleDateString("sv-SE");

  const add = () => {
    const value = text.trim();
    if (!value) return;
    setTodos([
      {
        id: Date.now(),
        text: value,
        done: false,
        priority,
        cat,
        due,
        removing: false,
      },
      ...todos,
    ]);
    setText("");
    setDue("");
  };

  const toggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const cyclePriority = (id) =>
    setTodos(
      todos.map((t) =>
        t.id === id
          ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] }
          : t,
      ),
    );

  const remove = (ids) => {
    setTodos((list) =>
      list.map((t) => (ids.includes(t.id) ? { ...t, removing: true } : t)),
    );
    setTimeout(
      () => setTodos((list) => list.filter((t) => !ids.includes(t.id))),
      300,
    );
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditText(t.text);
  };

  const saveEdit = () => {
    const value = editText.trim();
    if (value)
      setTodos(
        todos.map((t) => (t.id === editingId ? { ...t, text: value } : t)),
      );
    setEditingId(null);
  };

  // statistics
  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const overdueCount = todos.filter(
    (t) => !t.done && t.due && t.due < today,
  ).length;
  const activeCount = total - doneCount - overdueCount;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const remaining = total - doneCount;
  const doneIds = todos.filter((t) => t.done && !t.removing).map((t) => t.id);

  const q = query.trim().toLowerCase();
  const visible = todos.filter(
    (t) =>
      (filter === "all" || (filter === "active" ? !t.done : t.done)) &&
      (catFilter === "all" || t.cat === catFilter) &&
      (!q || t.text.toLowerCase().includes(q)),
  );

  const dueInfo = (t) => {
    if (!t.due) return null;
    if (!t.done && t.due < today)
      return {
        cls: "bg-rose-100 text-rose-700",
        label: `เลยกำหนด ${fmt(t.due)}`,
      };
    if (!t.done && t.due === today)
      return { cls: "bg-yellow-100 text-yellow-800", label: "ครบกำหนดวันนี้" };
    return { cls: "bg-slate-100 text-slate-600", label: fmt(t.due) };
  };

  const control =
    "rounded-lg border border-slate-200 bg-white px-2 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:py-14">
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[15rem_1fr]">
        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-md">
            <h2 className="mb-3 font-bold">สถิติ</h2>
            <div className="relative mx-auto h-28 w-28">
              <Donut
                parts={[
                  {
                    name: "done",
                    value: doneCount,
                    stroke: "stroke-emerald-500",
                  },
                  {
                    name: "active",
                    value: activeCount,
                    stroke: "stroke-indigo-500",
                  },
                  {
                    name: "overdue",
                    value: overdueCount,
                    stroke: "stroke-rose-500",
                  },
                ]}
              />
              <span className="absolute inset-0 grid place-items-center text-xl font-bold">
                {pct}%
              </span>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              <li className="flex justify-between">
                <span>งานทั้งหมด</span>
                <b>{total}</b>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  เสร็จแล้ว
                </span>
                <b>{doneCount}</b>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  กำลังทำ
                </span>
                <b>{activeCount}</b>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  เลยกำหนด
                </span>
                <b>{overdueCount}</b>
              </li>
            </ul>
          </section>

          <nav
            className="rounded-2xl bg-white p-2 shadow-md"
            aria-label="หมวดหมู่"
          >
            {[["all", "ทุกหมวดหมู่"], ...Object.entries(CATS)].map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCatFilter(key)}
                  aria-pressed={catFilter === key}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    catFilter === key
                      ? "bg-indigo-600 font-medium text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <span>{label}</span>
                  <span className="opacity-80">
                    {key === "all"
                      ? total
                      : todos.filter((t) => t.cat === key).length}
                  </span>
                </button>
              ),
            )}
          </nav>
        </aside>

        <main>
          <h1 className="mb-6 text-3xl font-bold">
            รายการสิ่งที่ต้องทำของ Kirin
          </h1>

          <div className="mb-4 space-y-2 rounded-2xl bg-white p-4 shadow-md">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="เพิ่มงานใหม่..."
                aria-label="งานใหม่"
                className={`min-w-0 flex-1 ${control}`}
              />
              <button
                onClick={add}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} /> เพิ่ม
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                aria-label="ระดับความสำคัญ"
                className={control}
              >
                {ORDER.map((p) => (
                  <option key={p} value={p}>
                    ความสำคัญ: {PRIORITIES[p].label}
                  </option>
                ))}
              </select>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                aria-label="หมวดหมู่"
                className={control}
              >
                {Object.entries(CATS).map(([k, l]) => (
                  <option key={k} value={k}>
                    หมวด: {l}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                aria-label="วันครบกำหนด"
                className={`col-span-2 sm:col-span-1 ${control}`}
              />
            </div>
          </div>

          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหางาน..."
              aria-label="ค้นหา"
              className={`w-full pl-10 ${control}`}
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-2" role="tablist">
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
                ไม่พบงานที่ตรงกับเงื่อนไข
              </li>
            )}
            {visible.map((t) => {
              const d = dueInfo(t);
              return (
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
                  <div className="min-w-0 flex-1">
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
                        className="w-full rounded border border-indigo-300 px-2 py-1 outline-none"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startEdit(t)}
                        title="ดับเบิลคลิกเพื่อแก้ไข"
                        className={`break-words ${t.done ? "text-slate-400 line-through" : ""}`}
                      >
                        {t.text}
                      </span>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                        {CATS[t.cat]}
                      </span>
                      {d && (
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${d.cls}`}
                        >
                          <CalendarDays size={12} /> {d.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => cyclePriority(t.id)}
                    title="คลิกเพื่อเปลี่ยนระดับความสำคัญ"
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITIES[t.priority].badge}`}
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
              );
            })}
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
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiX, FiPhone, FiMail, FiMapPin, FiCopy, FiPlus, FiInbox,
  FiShield, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { toast } from "sonner";
import { useShop } from "../../../context/ShopContext";
import UserFormModal from "./UserFormModal";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;
const BASE_URL = (import.meta.env.VITE_API_URL || "").replace("/api", "");
const PAGE_SIZE = 12;

const birr = (n = 0) => `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })} birr`;
const imageUrl = (img) => (!img ? "/default-product.jpg" : img.startsWith("http") ? img : `${BASE_URL}${img}`);
const initials = (name = "?") => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
const AVATAR_COLORS = ["#05B171", "#0E7490", "#7C3AED", "#B45309", "#BE185D", "#334155", "#15803D"];
const avatarColor = (id = "") => AVATAR_COLORS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

const timeAgo = (d) => {
  if (!d) return null;
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const STATUS = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
};

const Avatar = ({ user, size = "w-10 h-10 text-sm" }) => (
  <span className={`${size} rounded-full flex items-center justify-center text-white font-bold shrink-0`} style={{ background: avatarColor(user._id) }}>
    {initials(user.name)}
  </span>
);

const UserManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useShop();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null); // null | { user } (edit) | {} (add)
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const headers = () => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [u, o] = await Promise.all([
          fetch(`${API_BASE_URL}/users`, { headers: headers() }),
          fetch(`${API_BASE_URL}/orders`, { headers: headers() }),
        ]);
        if (u.status === 401) return navigate("/login");
        if (!u.ok) throw new Error("Could not load users");
        setUsers(await u.json());
        if (o.ok) setOrders(await o.json());
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => ({
    all: users.length,
    customer: users.filter((u) => u.role !== "admin").length,
    admin: users.filter((u) => u.role === "admin").length,
  }), [users]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = users.filter((u) => {
      if (tab === "admin" && u.role !== "admin") return false;
      if (tab === "customer" && u.role === "admin") return false;
      if (!q) return true;
      return [u.name, u.email, u.phone].some((v) => v?.toLowerCase().includes(q));
    });
    const by = {
      newest: (a, b) => new Date(b.createdAt || b.joined) - new Date(a.createdAt || a.joined),
      spent: (a, b) => (b.totalSpent || 0) - (a.totalSpent || 0),
      orders: (a, b) => (b.orderCount || 0) - (a.orderCount || 0),
    };
    return [...list].sort(by[sort]);
  }, [users, search, tab, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = users.find((u) => u._id === selectedId) || null;

  useEffect(() => { setPage(1); }, [search, tab, sort]);
  useEffect(() => { setConfirmDelete(false); }, [selectedId]);
  useEffect(() => {
    if (!selectedId && pageItems.length && window.matchMedia("(min-width: 1280px)").matches) setSelectedId(pageItems[0]._id);
  }, [pageItems, selectedId]);

  const userOrders = useMemo(
    () => (selected ? orders.filter((o) => (o.user?._id || o.user) === selected._id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []),
    [orders, selected]
  );

  const save = async (data) => {
    setSaving(true);
    try {
      const editing = Boolean(form?.user);
      const res = await fetch(`${API_BASE_URL}/users${editing ? `/${form.user._id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Could not save the user");
      if (editing) {
        setUsers((prev) => prev.map((u) => (u._id === body.user._id ? { ...u, ...body.user } : u)));
        toast.success("Details saved");
      } else {
        setUsers((prev) => [{ ...body.user, orderCount: 0, totalSpent: 0 }, ...prev]);
        setSelectedId(body.user._id);
        toast.success(`${body.user.name} added`);
      }
      setForm(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setRole = async (user, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${user._id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name: user.name, email: user.email, phone: user.phone, address: user.address, role }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Could not change the role");
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role } : u)));
      toast.success(role === "admin" ? `${user.name} is now an admin` : `${user.name} is now a customer`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (user) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${user._id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error((await res.json()).message || "Could not delete the account");
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setSelectedId(null);
      toast.success(`${user.name}'s account was deleted`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { /* clipboard blocked */ }
  };

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "customer", label: "Customers", count: counts.customer },
    { id: "admin", label: "Admins", count: counts.admin },
  ];

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Everyone who has an account, and what they&apos;ve ordered.</p>
        </div>
        <button onClick={() => setForm({})} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm">
          <FiPlus /> Add user
        </button>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 items-start">
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="user-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or phone"
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX /></button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition ${tab === t.id ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {t.label}
                  <span className={`text-xs tabular-nums px-1.5 rounded ${tab === t.id ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
                </button>
              ))}
              <label className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                <span className="hidden sm:inline">Sort</span>
                <select id="user-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:border-emerald-500">
                  <option value="newest">Newest</option>
                  <option value="spent">Top spenders</option>
                  <option value="orders">Most orders</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center gap-3 text-gray-500 text-sm">
              <div className="w-8 h-8 border-[3px] border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
              Loading users…
            </div>
          ) : pageItems.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <FiInbox className="mx-auto text-3xl text-gray-300 mb-3" />
              <p className="font-semibold text-gray-900">{search ? "No one matches your search" : "No users here yet"}</p>
              <p className="text-sm text-gray-500 mt-1">{search ? "Try a name, email or phone number." : "People appear here when they sign up."}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pageItems.map((u) => {
                const active = u._id === selectedId;
                return (
                  <li key={u._id}>
                    <button
                      onClick={() => setSelectedId(u._id)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition border-l-[3px] ${active ? "bg-emerald-50/60 border-emerald-500" : "border-transparent hover:bg-gray-50"}`}
                    >
                      <Avatar user={u} />
                      <div className="flex-1 min-w-0">
                        <p className="flex items-center gap-2 font-semibold text-gray-900 truncate">
                          <span className="truncate">{u.name}</span>
                          {u.role === "admin" && <span className="shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">Admin</span>}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          <span className="hidden sm:inline">{u.email || u.phone}</span>
                          <span className="sm:hidden">{u.phone || u.email}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900 tabular-nums">{u.totalSpent ? birr(u.totalSpent) : "—"}</p>
                        <p className="text-xs text-gray-400">{u.orderCount || 0} {u.orderCount === 1 ? "order" : "orders"}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span className="tabular-nums">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}</span>
              <div className="flex gap-1">
                <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><FiChevronLeft /></button>
                <button aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><FiChevronRight /></button>
              </div>
            </div>
          )}
        </section>

        {selected ? (
          <>
            <div className="xl:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedId(null)} />
            <aside className="fixed inset-x-0 bottom-0 top-12 z-50 overflow-y-auto rounded-t-2xl xl:rounded-2xl xl:z-auto xl:sticky xl:top-0 xl:max-h-[calc(100vh-9rem)] bg-white border border-gray-200 shadow-2xl xl:shadow-none">
              <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                <Avatar user={selected} size="w-14 h-14 text-lg" />
                <div className="flex-1 min-w-0">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <span className="truncate">{selected.name}</span>
                    {selected.role === "admin" && <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Admin</span>}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selected.role === "admin" ? "Admin" : "Customer"} since{" "}
                    {new Date(selected.createdAt || selected.joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    {selected.lastOrderAt ? ` · last order ${timeAgo(selected.lastOrderAt)}` : " · no orders yet"}
                  </p>
                </div>
                <button onClick={() => setSelectedId(null)} aria-label="Close" className="xl:hidden p-2 -m-2 text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
              </div>

              <div className="px-6 pb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                {selected.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <FiPhone className="text-gray-400" />
                    <a href={`tel:${selected.phone}`} className="hover:text-emerald-700 tabular-nums">{selected.phone}</a>
                    <button onClick={() => copy(selected.phone)} aria-label="Copy phone number" className="text-gray-400 hover:text-gray-600"><FiCopy className="text-xs" /></button>
                  </span>
                )}
                {selected.email && (
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <FiMail className="text-gray-400 shrink-0" />
                    <a href={`mailto:${selected.email}`} className="hover:text-emerald-700 truncate">{selected.email}</a>
                  </span>
                )}
                {selected.address && (
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <FiMapPin className="text-gray-400 shrink-0" />
                    <span className="truncate">{selected.address}</span>
                  </span>
                )}
              </div>

              {(() => {
                const delivered = userOrders.filter((o) => o.status === "delivered");
                const stats = [
                  ["Orders", selected.orderCount || 0],
                  ["Total spent", birr(selected.totalSpent || 0)],
                  ["Average order", delivered.length ? birr((selected.totalSpent || 0) / delivered.length) : "—"],
                ];
                return (
                  <div className="grid grid-cols-3 border-y border-gray-100">
                    {stats.map(([label, value], i) => (
                      <div key={label} className={`px-6 py-4 ${i ? "border-l border-gray-100" : ""}`}>
                        <p className="text-xs font-medium text-gray-500">{label}</p>
                        <p className="text-lg font-bold text-gray-900 tabular-nums mt-0.5 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="px-6 pt-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order history</h3>
                {userOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No orders yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {userOrders.map((o) => (
                      <li key={o._id} className="flex items-center gap-3 py-2.5">
                        <div className="flex -space-x-2 shrink-0">
                          {(o.items || []).slice(0, 3).map((it, i) => (
                            <img
                              key={i}
                              src={imageUrl(it.product?.images?.[0])}
                              alt={it.name}
                              className="w-8 h-8 rounded-lg object-cover ring-2 ring-white bg-gray-100"
                              onError={(e) => { e.target.onerror = null; e.target.src = "/default-product.jpg"; }}
                            />
                          ))}
                        </div>
                        <p className="flex-1 min-w-0 text-sm truncate">
                          <span className="font-mono font-semibold text-gray-900">#{o._id.slice(-8).toUpperCase()}</span>
                          <span className="text-gray-400"> · {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </p>
                        <p className="text-sm font-semibold text-gray-900 tabular-nums">{birr(o.total)}</p>
                        <span className={`hidden sm:inline-flex justify-center w-[84px] px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset capitalize ${STATUS[o.status] || STATUS.pending}`}>{o.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="px-6 py-5 mt-2 flex flex-wrap items-center gap-2 border-t border-gray-100">
                {selected._id !== (currentUser?.id || currentUser?._id) && (
                  <button
                    onClick={() => setRole(selected, selected.role === "admin" ? "customer" : "admin")}
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <FiShield /> {selected.role === "admin" ? "Remove admin" : "Make admin"}
                  </button>
                )}
                <button onClick={() => setForm({ user: selected })} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <FiEdit2 /> Edit details
                </button>
                {selected._id !== (currentUser?.id || currentUser?._id) &&
                  (confirmDelete ? (
                    <div className="ml-auto inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-lg bg-red-50 text-sm">
                      <span className="text-red-800 font-medium">Delete this account?</span>
                      <button onClick={() => remove(selected)} className="px-3 py-1.5 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700">Delete</button>
                      <button onClick={() => setConfirmDelete(false)} className="px-2 py-1.5 text-red-700">Keep</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)} className="ml-auto inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50">
                      <FiTrash2 /> Delete account
                    </button>
                  ))}
              </div>
            </aside>
          </>
        ) : (
          <div className="hidden xl:flex sticky top-0 bg-white rounded-2xl border border-dashed border-gray-200 min-h-[420px] items-center justify-center text-sm text-gray-400">
            Select someone to see their details
          </div>
        )}
      </div>

      {form && <UserFormModal user={form.user} saving={saving} onClose={() => setForm(null)} onSave={save} />}
    </div>
  );
};

export default UserManagement;

import { useState, useEffect, useMemo } from "react";
import {
  FiSearch, FiX, FiPackage, FiMapPin, FiPhone, FiMail, FiCopy,
  FiClock, FiCheckCircle, FiXCircle, FiRotateCcw, FiTruck, FiHome,
  FiChevronLeft, FiChevronRight, FiCreditCard, FiInbox, FiCalendar,
} from "react-icons/fi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;
const BASE_URL = (import.meta.env.VITE_API_URL || "").replace("/api", "");
const PAGE_SIZE = 10;

const birr = (n = 0) => `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })} birr`;
const shortId = (id) => `#${id.slice(-8).toUpperCase()}`;
const imageUrl = (img) => (!img ? "/default-product.jpg" : img.startsWith("http") ? img : `${BASE_URL}${img}`);
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

const formatDate = (d, opts = { month: "short", day: "numeric", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-US", opts) : "—";
const formatTime = (d) => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const timeAgo = (d) => {
  const mins = Math.round((Date.now() - new Date(d)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d, { month: "short", day: "numeric" });
};

// Everything the UI needs about an order, derived once
const describe = (order) => {
  const items = order.items || [];
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const isPickup = order.shippingAddress?.startsWith("PICKUP:");
  const pending = order.status === "pending";
  const due = order.deliveryDate ? startOfDay(order.deliveryDate) : null;
  const today = startOfDay(new Date());
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    deliveryFee: Math.max(0, (order.total || 0) - subtotal),
    isPickup,
    place: isPickup ? order.shippingAddress.replace("PICKUP:", "").trim() : order.shippingAddress,
    dueToday: pending && due && sameDay(due, today),
    overdue: pending && due && due < today,
  };
};

const STATUS = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600 ring-gray-200", dot: "bg-gray-400" },
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Thumbs = ({ items }) => (
  <div className="flex -space-x-2">
    {items.slice(0, 3).map((item, i) => (
      <img
        key={i}
        src={imageUrl(item.product?.images?.[0])}
        alt={item.name}
        className="w-9 h-9 rounded-lg object-cover ring-2 ring-white bg-gray-100"
        onError={(e) => { e.target.onerror = null; e.target.src = "/default-product.jpg"; }}
      />
    ))}
    {items.length > 3 && (
      <span className="w-9 h-9 rounded-lg ring-2 ring-white bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center">
        +{items.length - 3}
      </span>
    )}
  </div>
);

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const load = async () => {
      try {
        const headers = authHeaders();
        if (!headers) return;
        const res = await fetch(`${API_BASE_URL}/orders`, { headers });
        if (res.status === 401) return navigate("/login");
        if (!res.ok) throw new Error((await res.json()).message || "Could not load orders");
        const data = await res.json();
        setOrders([...(data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c = { pending: 0, today: 0, delivered: 0, cancelled: 0, all: orders.length, revenueMonth: 0 };
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    for (const o of orders) {
      c[o.status] = (c[o.status] || 0) + 1;
      const d = describe(o);
      if (d.dueToday || d.overdue) c.today += 1;
      if (o.status === "delivered" && new Date(o.createdAt) >= monthStart) c.revenueMonth += o.total || 0;
    }
    return c;
  }, [orders]);

  const tabs = [
    { id: "pending", label: "To fulfil", count: counts.pending },
    { id: "today", label: "Due today", count: counts.today },
    { id: "delivered", label: "Delivered", count: counts.delivered },
    { id: "cancelled", label: "Cancelled", count: counts.cancelled },
    { id: "all", label: "All", count: counts.all },
  ];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab === "today") { const d = describe(o); if (!(d.dueToday || d.overdue)) return false; }
      else if (tab !== "all" && o.status !== tab) return false;
      if (!q) return true;
      return (
        o._id.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.phone?.includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q))
      );
    });
  }, [orders, tab, search]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = orders.find((o) => o._id === selectedId) || null;

  useEffect(() => { setPage(1); setChecked([]); }, [tab, search]);
  useEffect(() => { setConfirmCancel(false); }, [selectedId]);
  // Keep a useful order open on wide screens
  useEffect(() => {
    if (!selectedId && pageItems.length && window.matchMedia("(min-width: 1280px)").matches) setSelectedId(pageItems[0]._id);
  }, [pageItems, selectedId]);

  const updateStatus = async (ids, status) => {
    const headers = authHeaders();
    if (!headers) return;
    setBusy(true);
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, { method: "PUT", headers, body: JSON.stringify({ status }) });
          if (!res.ok) throw new Error((await res.json()).message || "Could not update the order");
          return (await res.json()).order;
        })
      );
      const byId = Object.fromEntries(results.map((o) => [o._id, o]));
      setOrders((prev) => prev.map((o) => (byId[o._id] ? { ...o, ...byId[o._id] } : o)));
      const what = ids.length === 1 ? `Order ${shortId(ids[0])}` : `${ids.length} orders`;
      toast.success(`${what} marked ${STATUS[status].label.toLowerCase()}`);
      setChecked([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { /* clipboard blocked */ }
  };

  const toggleCheck = (id) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div className="max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Review, fulfil and track every customer order.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
          {[
            { label: "To fulfil", value: counts.pending, tone: "text-amber-600" },
            { label: "Due today", value: counts.today, tone: counts.today ? "text-rose-600" : "text-gray-900" },
            { label: "Earned this month", value: birr(counts.revenueMonth), tone: "text-emerald-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-3 sm:px-4 py-3 min-w-0">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide truncate">{s.label}</p>
              <p className={`text-base sm:text-lg font-bold tabular-nums truncate ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start">
        {/* List */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="order-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, customers or products"
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition ${
                    tab === t.id ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                  <span className={`text-xs tabular-nums px-1.5 rounded ${tab === t.id ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          {checked.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 text-sm">
              <span className="font-semibold text-emerald-900">{checked.length} selected</span>
              <div className="ml-auto flex gap-2">
                <button disabled={busy} onClick={() => updateStatus(checked, "delivered")} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50">Mark delivered</button>
                <button disabled={busy} onClick={() => updateStatus(checked, "cancelled")} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button onClick={() => setChecked([])} className="px-2 py-1.5 text-gray-500 hover:text-gray-700">Clear</button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-3 text-gray-500 text-sm">
              <div className="w-8 h-8 border-[3px] border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
              Loading orders…
            </div>
          ) : pageItems.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <FiInbox className="mx-auto text-3xl text-gray-300 mb-3" />
              <p className="font-semibold text-gray-900">{search ? "No orders match your search" : "Nothing here"}</p>
              <p className="text-sm text-gray-500 mt-1">{search ? "Try a name, phone number or order ID." : "Orders will show up here as customers place them."}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pageItems.map((o) => {
                const d = describe(o);
                const active = o._id === selectedId;
                return (
                  <li key={o._id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(o._id)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelectedId(o._id))}
                      className={`group flex items-center gap-3 px-4 py-3.5 cursor-pointer outline-none transition border-l-[3px] ${
                        active ? "bg-emerald-50/60 border-emerald-500" : "border-transparent hover:bg-gray-50 focus-visible:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select order ${shortId(o._id)}`}
                        checked={checked.includes(o._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleCheck(o._id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <Thumbs items={d.items} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{o.user?.name || "Deleted customer"}</p>
                          {d.overdue ? (
                            <span className="shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">Overdue</span>
                          ) : d.dueToday ? (
                            <span className="shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">Due today</span>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          <span className="font-mono">{shortId(o._id)}</span> · {d.itemCount} {d.itemCount === 1 ? "item" : "items"} · {d.isPickup ? `Pickup, ${d.place}` : "Delivery"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-gray-900 tabular-nums text-sm">{birr(o.total)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(o.createdAt)}</p>
                      </div>
                      <div className="hidden sm:block shrink-0 w-[92px] text-right">
                        <StatusPill status={o.status} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span className="tabular-nums">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}
              </span>
              <div className="flex gap-1">
                <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"><FiChevronLeft /></button>
                <button aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"><FiChevronRight /></button>
              </div>
            </div>
          )}
        </section>

        {/* Detail */}
        {selected ? (
          <>
            <div className="xl:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedId(null)} />
            <OrderDetail
              order={selected}
              busy={busy}
              confirmCancel={confirmCancel}
              onConfirmCancel={setConfirmCancel}
              onStatus={(s) => updateStatus([selected._id], s)}
              onClose={() => setSelectedId(null)}
              onCopy={copy}
            />
          </>
        ) : (
          <div className="hidden xl:flex sticky top-0 bg-white rounded-2xl border border-dashed border-gray-200 min-h-[420px] items-center justify-center text-sm text-gray-400">
            Select an order to see its details
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <section className="px-6 py-5 border-t border-gray-100">
    <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
      <Icon className="text-gray-400" /> {title}
    </h3>
    {children}
  </section>
);

const OrderDetail = ({ order, busy, confirmCancel, onConfirmCancel, onStatus, onClose, onCopy }) => {
  const d = describe(order);
  const u = order.user || {};
  const finishedAt = order.status !== "pending" ? order.updatedAt : null;

  return (
    <aside className="fixed inset-x-0 bottom-0 top-12 z-50 overflow-y-auto rounded-t-2xl xl:rounded-2xl xl:z-auto xl:sticky xl:top-0 xl:max-h-[calc(100vh-9rem)] bg-white border border-gray-200 shadow-2xl xl:shadow-none">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 font-mono">{shortId(order._id)}</h2>
              <StatusPill status={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Placed {formatDate(order.createdAt, { weekday: "short", month: "short", day: "numeric" })} at {formatTime(order.createdAt)}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close order" className="xl:hidden p-2 -m-2 text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {order.status === "pending" ? (
            <>
              <button
                disabled={busy}
                onClick={() => onStatus("delivered")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
              >
                <FiCheckCircle /> Mark as delivered
              </button>
              {confirmCancel ? (
                <div className="inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-xl bg-rose-50 text-sm">
                  <span className="text-rose-800 font-medium">Cancel this order?</span>
                  <button disabled={busy} onClick={() => onStatus("cancelled")} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-50">Yes, cancel</button>
                  <button onClick={() => onConfirmCancel(false)} className="px-2 py-1.5 text-rose-700 hover:text-rose-900">Keep</button>
                </div>
              ) : (
                <button
                  onClick={() => onConfirmCancel(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  <FiXCircle /> Cancel order
                </button>
              )}
            </>
          ) : (
            <button
              disabled={busy}
              onClick={() => onStatus("pending")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRotateCcw /> Move back to pending
            </button>
          )}
        </div>
      </div>

      <Section icon={FiPhone} title="Customer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
            {(u.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{u.name || "Deleted customer"}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-0.5">
              {u.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <FiPhone className="text-gray-400" />
                  <a href={`tel:${u.phone}`} className="hover:text-emerald-700 tabular-nums">{u.phone}</a>
                  <button onClick={() => onCopy(u.phone)} aria-label="Copy phone number" className="text-gray-400 hover:text-gray-600"><FiCopy className="text-xs" /></button>
                </span>
              )}
              {u.email && (
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <FiMail className="text-gray-400 shrink-0" />
                  <a href={`mailto:${u.email}`} className="hover:text-emerald-700 truncate">{u.email}</a>
                </span>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section icon={d.isPickup ? FiHome : FiTruck} title={d.isPickup ? "Pickup" : "Delivery"}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-2.5">
            <FiMapPin className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{d.isPickup ? "Pickup point" : "Address"}</p>
              <p className="text-sm font-medium text-gray-900 break-words">{d.place || "—"}</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <FiCalendar className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{order.status === "delivered" ? "Delivered on" : "Expected by"}</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(order.status === "delivered" ? order.updatedAt : order.deliveryDate, { weekday: "short", month: "short", day: "numeric" })}
                {d.overdue && <span className="ml-2 text-xs font-semibold text-rose-600">Overdue</span>}
                {d.dueToday && <span className="ml-2 text-xs font-semibold text-orange-600">Today</span>}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={FiPackage} title={`Items (${d.itemCount})`}>
        <ul className="space-y-3">
          {d.items.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <img
                src={imageUrl(item.product?.images?.[0])}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
                onError={(e) => { e.target.onerror = null; e.target.src = "/default-product.jpg"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 tabular-nums">{item.quantity} × {birr(item.price)}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 tabular-nums">{birr(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-1.5 text-sm tabular-nums">
          <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd className="text-gray-900">{birr(d.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">{d.isPickup ? "Pickup" : "Delivery fee"}</dt><dd className="text-gray-900">{d.deliveryFee ? birr(d.deliveryFee) : "Free"}</dd></div>
          <div className="flex justify-between pt-1.5 text-base"><dt className="font-semibold text-gray-900">Total</dt><dd className="font-bold text-gray-900">{birr(order.total)}</dd></div>
        </dl>
      </Section>

      <Section icon={FiCreditCard} title="Payment">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-900 font-medium">{order.paymentMethod}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {order.paymentStatus === "Paid" ? "Paid" : "Collect on delivery"}
          </span>
        </div>
      </Section>

      <Section icon={FiClock} title="Timeline">
        <ol className="relative ml-1.5 border-l border-gray-200 space-y-4">
          <li className="pl-5 relative">
            <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <p className="text-sm font-medium text-gray-900">Order placed</p>
            <p className="text-xs text-gray-500">{formatDate(order.createdAt)} · {formatTime(order.createdAt)}</p>
          </li>
          <li className="pl-5 relative">
            <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${order.status === "delivered" ? "bg-emerald-500" : order.status === "cancelled" ? "bg-gray-400" : "bg-white border-2 border-amber-400"}`} />
            <p className="text-sm font-medium text-gray-900">
              {order.status === "delivered" ? "Delivered and paid" : order.status === "cancelled" ? "Cancelled" : d.isPickup ? "Waiting for pickup" : "Waiting for delivery"}
            </p>
            <p className="text-xs text-gray-500">
              {finishedAt ? `${formatDate(finishedAt)} · ${formatTime(finishedAt)}` : `Expected ${formatDate(order.deliveryDate)}`}
            </p>
          </li>
        </ol>
      </Section>
    </aside>
  );
};

export default OrderManagement;

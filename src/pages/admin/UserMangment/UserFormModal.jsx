import { useState } from "react";
import { FiX } from "react-icons/fi";

const inputCls =
  "w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition";

const Row = ({ id, label, children, hint }) => (
  <label htmlFor={id} className="flex flex-col gap-1.5">
    <span className="text-[13px] font-semibold text-gray-800">{label}</span>
    {children}
    {hint && <span className="text-xs text-gray-500">{hint}</span>}
  </label>
);

// Add a new user, or edit an existing one's details and role
const UserFormModal = ({ user, onClose, onSave, saving }) => {
  const editing = Boolean(user);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    role: user?.role || "customer",
    password: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const data = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), address: form.address.trim() || undefined };
    if (editing) delete data.password;
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit details" : "Add a user"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 -m-2 text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
        </div>
        <div className="px-6 py-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Row id="u-name" label="Full name">
              <input id="u-name" required minLength={2} value={form.name} onChange={set("name")} className={inputCls} />
            </Row>
          </div>
          <Row id="u-email" label="Email">
            <input id="u-email" type="email" required value={form.email} onChange={set("email")} className={inputCls} />
          </Row>
          <Row id="u-phone" label="Phone">
            <input id="u-phone" type="tel" required value={form.phone} onChange={set("phone")} placeholder="09XXXXXXXX" className={inputCls} />
          </Row>
          <div className="sm:col-span-2">
            <Row id="u-address" label="Address" hint="Optional">
              <input id="u-address" value={form.address} onChange={set("address")} className={inputCls} />
            </Row>
          </div>
          <Row id="u-role" label="Role">
            <select id="u-role" value={form.role} onChange={set("role")} className={`${inputCls} bg-white`}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </Row>
          {!editing && (
            <Row id="u-password" label="Password" hint="At least 6 characters">
              <input id="u-password" type="password" required minLength={6} value={form.password} onChange={set("password")} className={inputCls} />
            </Row>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Add user"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormModal;

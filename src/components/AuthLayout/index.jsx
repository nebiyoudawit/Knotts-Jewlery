import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiX } from "react-icons/fi";

// Shared frame for log in and sign up: one white card with a switch between the two.
// On laptops it sits on the brand green; on phones it fills the screen.
const AuthLayout = ({ mode, title, subtitle, wide = false, children }) => {
  const navigate = useNavigate();
  const tab = (to, label, active) => (
    <Link
      to={to}
      replace
      aria-current={active ? "page" : undefined}
      className={`h-10 rounded-[9px] flex items-center justify-center text-sm font-bold transition ${
        active ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(16,32,26,0.12)]" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="relative min-h-screen bg-white lg:bg-[#0F1D18] lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-6 lg:py-10">
      <Link to="/" className="hidden lg:inline-flex absolute left-8 top-7 items-center gap-2 text-sm font-semibold text-[#A9BCB3] hover:text-white">
        <FiArrowLeft /> Back to store
      </Link>

      <div className={`min-h-screen lg:min-h-0 w-full ${wide ? "lg:max-w-[760px] lg:px-12" : "lg:max-w-[460px]"} bg-white lg:rounded-3xl lg:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] px-5 sm:px-8 lg:px-9 pt-5 pb-8 lg:py-9 flex flex-col`}>
        <div className="relative flex items-center justify-center lg:mb-1">
          <Link to="/"><img src="/logo.png" alt="Knotts Jewelry" className="h-9" /></Link>
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Back to store"
            className="lg:hidden absolute right-0 w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center"
          >
            <FiX className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="mt-6 lg:mt-5 text-center">
          <h1 className="text-[26px] lg:text-[28px] font-extrabold tracking-tight text-gray-900">{title}</h1>
          <p className="mt-1.5 text-[15px] text-gray-500">{subtitle}</p>
        </div>

        <nav aria-label="Log in or sign up" className={`mt-5 grid grid-cols-2 p-1 rounded-xl bg-[#EEF2F0] ${wide ? "lg:w-[380px] lg:mx-auto" : ""}`}>
          {tab("/login", "Log in", mode === "login")}
          {tab("/register", "Sign up", mode === "signup")}
        </nav>

        <div className="mt-5 flex-1 flex flex-col">{children}</div>

        <p className="mt-6 text-center text-xs font-medium text-gray-400">Free pickup at Figa and Megenagna · Pay on delivery</p>
      </div>
    </main>
  );
};

export const Field = ({ id, label, action, icon: Icon, prefix, end, error, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between">
      <label htmlFor={id} className="text-[13px] font-semibold text-gray-900">{label}</label>
      {action}
    </div>
    <div
      className={`flex items-center gap-2.5 h-[52px] lg:h-12 rounded-xl border-[1.5px] bg-white px-3.5 transition focus-within:border-[#05B171] focus-within:ring-4 focus-within:ring-emerald-500/10 ${
        error ? "border-red-400" : "border-gray-200"
      }`}
    >
      {Icon && <Icon className="w-[18px] h-[18px] text-gray-400 shrink-0" />}
      {prefix && <span className="self-stretch flex items-center pr-3 border-r-[1.5px] border-gray-200 font-semibold text-gray-500 shrink-0">{prefix}</span>}
      {children}
      {end}
    </div>
    {error ? <p className="text-xs font-medium text-red-600">{error}</p> : hint}
  </div>
);

export const inputClass = "flex-1 min-w-0 h-full bg-transparent outline-none text-base lg:text-[15px] text-gray-900 placeholder:text-gray-400";

export const SubmitButton = ({ loading, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="h-[54px] lg:h-[50px] rounded-xl bg-[#05B171] hover:bg-[#04965F] text-white font-bold flex items-center justify-center gap-2 shadow-[0_8px_18px_-8px_rgba(5,177,113,0.7)] transition disabled:opacity-60"
  >
    {loading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : children}
  </button>
);

export default AuthLayout;

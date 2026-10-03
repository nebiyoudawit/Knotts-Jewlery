import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiX } from "react-icons/fi";

// Shared frame for the log in and sign up pages: a product photo beside the
// form on laptops, and a photo band with the form sliding over it on phones.
const AuthLayout = ({ image, imagePosition = "center", mobileImagePosition, dark = false, quote, tag, mobileBand = 240, children }) => {
  const navigate = useNavigate();
  const logo = dark ? "/logo-light.png" : "/logo.png";

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(480px,560px)]">
      {/* Photo panel (laptop) */}
      <aside className="hidden lg:block relative overflow-hidden bg-emerald-50">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: imagePosition }} />
        {dark && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />}
        <Link to="/" className="absolute left-10 top-8">
          <img src={logo} alt="Knotts Jewelry" className="h-10" />
        </Link>
        <div className="absolute left-10 right-10 bottom-10 flex items-end justify-between gap-6">
          <p className={`max-w-md text-3xl font-bold leading-tight tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>{quote}</p>
          {tag && <span className="shrink-0 text-sm font-semibold px-3.5 py-2 rounded-full bg-white/85 text-gray-900">{tag}</span>}
        </div>
      </aside>

      {/* Form side */}
      <section className="min-h-screen flex flex-col">
        {/* Photo band (phone) */}
        <div className="lg:hidden relative shrink-0 overflow-hidden" style={{ height: mobileBand }}>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: mobileImagePosition || imagePosition }} />
          <div className="absolute inset-x-5 top-5 flex items-center justify-between">
            <Link to="/"><img src={logo} alt="Knotts Jewelry" className="h-8" /></Link>
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Back to store"
              className="w-9 h-9 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-sm"
            >
              <FiX className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col -mt-7 lg:mt-0 rounded-t-[28px] lg:rounded-none bg-white relative px-5 sm:px-8 lg:px-16 pt-7 pb-8 lg:py-8">
          <div className="hidden lg:flex justify-end">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900">
              <FiArrowLeft /> Back to store
            </Link>
          </div>
          <div className="flex-1 flex flex-col lg:justify-center w-full max-w-[420px] mx-auto">
            {children}
          </div>
        </div>
      </section>
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

export default AuthLayout;

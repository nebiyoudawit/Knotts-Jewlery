import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useShop } from "../../context/ShopContext";
import AuthLayout, { Field, inputClass } from "../../components/AuthLayout";
import useSeo from "../../hooks/useSeo";
import { privateSeo } from "../../seo/pages";

const Login = () => {
  useSeo(privateSeo("Sign In"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, clearError } = useShop();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    // login() shows its own success or error message
    const success = await login(email.trim(), password);
    setIsLoading(false);
    if (success) navigate("/");
  };

  return (
    <AuthLayout
      image="/hero-img2.jpg"
      imagePosition="62% 50%"
      mobileImagePosition="72% 50%"
      quote="Handmade jewelry, made in Addis Ababa"
      tag="Free pickup at Figa and Megenagna"
      mobileBand={250}
    >
      <form onSubmit={handleSubmit} className="flex-1 lg:flex-none flex flex-col gap-[18px]">
        <div>
          <h1 className="text-[28px] lg:text-[34px] font-extrabold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-1.5 text-[15px] text-gray-500">Log in to track your orders and see your saved pieces.</p>
        </div>

        <Field id="email" label="Email" icon={FiMail}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            className={inputClass}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          icon={FiLock}
          end={
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-[13px] font-semibold text-gray-500 hover:text-gray-900">
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        >
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={inputClass}
          />
        </Field>

        <div className="mt-auto lg:mt-2 flex flex-col gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="h-[54px] lg:h-[50px] rounded-xl bg-[#05B171] hover:bg-[#04965F] text-white font-bold flex items-center justify-center gap-2 shadow-[0_8px_18px_-8px_rgba(5,177,113,0.7)] transition disabled:opacity-60"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>Log in <FiArrowRight /></>
            )}
          </button>
          <p className="text-sm text-center text-gray-500">
            New to Knotts?{" "}
            <Link to="/register" className="font-bold text-[#04965F] hover:underline">Create an account</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useShop } from "../../context/ShopContext";
import AuthLayout, { Field, inputClass, SubmitButton } from "../../components/AuthLayout";
import { normalizePhone, formatPhoneInput } from "../../utils/phone";
import useSeo from "../../hooks/useSeo";
import { privateSeo } from "../../seo/pages";

const Login = () => {
  useSeo(privateSeo("Sign In"));
  const [useEmail, setUseEmail] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, clearError } = useShop();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifier = useEmail ? email.trim() : normalizePhone(phone);
    if (!identifier) {
      setError(useEmail ? "Enter your email address." : "Enter a 9-digit number, like 912 345 678.");
      return;
    }
    setIsLoading(true);
    clearError();
    // login() shows its own success or error message
    const success = await login(identifier, password);
    setIsLoading(false);
    if (success) navigate("/");
  };

  const switchMethod = () => {
    setUseEmail((u) => !u);
    setError("");
  };

  return (
    <AuthLayout mode="login" title="Welcome back" subtitle="Log in to see your orders and saved pieces.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px] short:gap-3">
        {useEmail ? (
          <Field
            id="email"
            label="Email"
            icon={FiMail}
            error={error}
            action={<button type="button" onClick={switchMethod} className="text-[13px] font-semibold text-[#04965F]">Use phone number</button>}
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@gmail.com"
              className={inputClass}
            />
          </Field>
        ) : (
          <Field
            id="phone"
            label="Phone number"
            prefix="+251"
            error={error}
            action={<button type="button" onClick={switchMethod} className="text-[13px] font-semibold text-[#04965F]">Use email instead</button>}
          >
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => { setPhone(formatPhoneInput(e.target.value)); setError(""); }}
              placeholder="912 345 678"
              className={inputClass}
            />
          </Field>
        )}

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

        <div className="mt-2 lg:mt-1 flex flex-col">
          <SubmitButton loading={isLoading}>Log in <FiArrowRight /></SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;

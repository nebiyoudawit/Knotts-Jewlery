import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useShop } from "../../context/ShopContext";
import AuthLayout, { Field, inputClass, SubmitButton } from "../../components/AuthLayout";
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
    <AuthLayout mode="login" title="Welcome back" subtitle="Log in to see your orders and saved pieces.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px] short:gap-3">
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

        <div className="mt-2 lg:mt-1 flex flex-col">
          <SubmitButton loading={isLoading}>Log in <FiArrowRight /></SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;

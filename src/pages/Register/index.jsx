import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../success-animation.json";
import { useShop } from "../../context/ShopContext";
import AuthLayout, { Field, inputClass, SubmitButton } from "../../components/AuthLayout";
import useSeo from "../../hooks/useSeo";
import { privateSeo } from "../../seo/pages";

// Ethiopian mobile numbers are 9 digits after +251 (or 10 starting with 0).
// Saved as 09XXXXXXXX, the same format as existing accounts.
const normalizePhone = (value) => {
  const digits = value.replace(/\D/g, "").replace(/^251/, "").replace(/^0/, "");
  return /^[79]\d{8}$/.test(digits) ? `0${digits}` : null;
};

const formatPhoneInput = (value) => {
  const digits = value.replace(/\D/g, "").replace(/^251/, "").replace(/^0/, "").slice(0, 9);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(" ");
};

const passwordStrength = (pw) => {
  if (!pw) return { score: 0, label: "" };
  if (pw.length < 6) return { score: 1, label: "Too short" };
  let score = 2;
  if (pw.length >= 10) score += 1;
  if (/\d/.test(pw) && /[a-zA-Z]/.test(pw)) score += 1;
  return { score: Math.min(score, 4), label: ["", "Too short", "Okay", "Good", "Strong"][Math.min(score, 4)] };
};

const Register = () => {
  useSeo(privateSeo("Create Account"));
  const { register } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const set = (name) => (e) => {
    const value = name === "phone" ? formatPhoneInput(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = normalizePhone(form.phone);
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!phone) next.phone = "Enter a 9-digit number, like 912 345 678.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = "Enter your email address, like you@gmail.com.";
    if (form.password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    // register() shows its own error message if the account can't be created
    const success = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone,
    });
    setLoading(false);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    }
  };

  const strength = passwordStrength(form.password);

  return (
    <AuthLayout mode="signup" title="Join Knotts" subtitle="Save favourites and check out faster.">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 bg-white rounded-2xl shadow-2xl">
            <Lottie animationData={successAnimation} loop={false} autoplay style={{ width: 170, height: 170 }} />
          </motion.div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col gap-4">
        <div className="grid gap-4">
          <Field id="name" label="Full name" icon={FiUser} error={errors.name}>
            <input id="name" autoComplete="name" value={form.name} onChange={set("name")} placeholder="Hanna Girma" className={inputClass} />
          </Field>
          <Field id="phone" label="Phone number" prefix="+251" error={errors.phone}>
            <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={form.phone} onChange={set("phone")} placeholder="912 345 678" className={inputClass} />
          </Field>
        </div>

        <Field id="email" label="Email" icon={FiMail} error={errors.email}>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder="you@gmail.com" className={inputClass} />
        </Field>

        <Field
          id="password"
          label="Password"
          icon={FiLock}
          error={errors.password}
          end={
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-[13px] font-semibold text-gray-500 hover:text-gray-900">
              {showPassword ? "Hide" : "Show"}
            </button>
          }
          hint={
            form.password && (
              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-500">
                <div className="flex gap-1 w-28">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={`flex-1 h-1 rounded-full ${i <= strength.score ? (strength.score < 2 ? "bg-red-400" : "bg-[#05B171]") : "bg-gray-200"}`} />
                  ))}
                </div>
                {strength.label}
              </div>
            )
          }
        >
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            placeholder="At least 6 characters"
            className={inputClass}
          />
        </Field>

        <div className="mt-auto lg:mt-1 pt-2 flex flex-col">
          <SubmitButton loading={loading}>Create account <FiArrowRight /></SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;

// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import API from "../services/api";
import logo from "../assets/Images/Horizoanatal_logo.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const successMsg = location.state?.message || "";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const err = {};
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Invalid email format";
    if (!form.password) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await API.post("/auth/loginresponse", {
        email: form.email.trim(),
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data ||
          "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2FF] p-4 font-sans">
      <div
        className="flex flex-col lg:flex-row w-full max-w-[1040px] bg-white 
            rounded-2xl lg:rounded-[32px] 
            shadow-[0_20px_60px_rgba(37,99,235,0.12)] 
            overflow-hidden lg:min-h-[620px]"
      >
        {/* ══════════════════ LEFT PANEL ══════════════════════ */}
        <div
          className="lg:w-[48%] w-full flex flex-col p-8 lg:p-10 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg,#2563EB 0%,#4338CA 40%,#7C3AED 100%)",
          }}
        >
          {/* ── Background blobs ── */}
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#fff,transparent)" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle,#06B6D4,transparent)",
            }}
          />

          {/* Dot grid */}
          <div className="absolute top-10 right-8 grid grid-cols-6 gap-[5px] opacity-20">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-[4px] h-[4px] bg-white rounded-full" />
            ))}
          </div>

          {/* Sparkles */}
          <span className="absolute top-36 right-24 text-cyan-300/50 text-xl select-none">
            ✦
          </span>
          <span className="absolute top-64 right-10 text-white/20 text-sm select-none">
            ✦
          </span>
          <span className="absolute bottom-48 left-10 text-violet-300/40 text-lg select-none">
            ✦
          </span>
          <span className="absolute bottom-28 right-16 text-white/20 text-xs select-none">
            ✦
          </span>

          {/* ── LOGO — bigger white card ── */}
          <div className="relative z-10 mb-6">
            <div className="inline-flex items-center bg-white rounded-3xl px-6 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              <img
                src={logo}
                alt="JobGenius"
                className="h-12 lg:h-16 w-auto object-contain"
              />
            </div>
          </div>

          {/* ── Hero text ── */}
          <div className="relative z-10 mb-8">
            <h2 className="text-white text-2xl lg:text-[28px] font-extrabold leading-snug mb-3">
              Find the right job
              <br />
              that matches your
              <br />
              <span className="text-cyan-300">skills</span>
              <span className="text-white"> &amp; </span>
              <span className="text-violet-300">ambition</span>
            </h2>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-[260px]">
              AI-powered matching, skill gap analysis and personalized career
              recommendations.
            </p>
          </div>

          {/* ── Improved Dashboard illustration ── */}
          <div className="relative z-10 flex-1 flex items-end justify-center">
            <div className="relative">
              {/* Glow background */}
              <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-2xl" />

              {/* Main Card */}
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-5 w-[220px] shadow-2xl">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    👤
                  </div>

                  {/* Lines */}
                  <div className="w-full space-y-2">
                    <div className="h-2 bg-white/60 rounded-full w-full" />
                    <div className="h-2 bg-white/40 rounded-full w-[80%]" />
                    <div className="h-2 bg-white/30 rounded-full w-[60%]" />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -right-3 -bottom-3 bg-gradient-to-br from-green-400 to-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                ✓
              </div>
            </div>

            {/* Floating briefcase badge */}
            <div className="absolute -left-3 top-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/60 to-blue-500/60 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  <rect width="20" height="14" x="2" y="6" rx="2" />
                </svg>
              </div>
            </div>

            {/* Floating search badge */}
            <div className="absolute -right-3 bottom-6 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400/60 to-purple-500/60 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ RIGHT PANEL ═════════════════════ */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-10 relative">
          {/* Top right link */}
          <div className="absolute top-6 right-6 sm:right-8 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Success message from register */}
          {successMsg && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              ✅ {successMsg}
            </div>
          )}

          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 mb-1">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Login to continue your job journey
          </p>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div
                className={`flex items-center gap-2.5 border rounded-xl px-4 h-[52px] bg-white transition-all
                ${
                  errors.email
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <Mail size={18} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  autoComplete="email"
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div
                className={`flex items-center gap-2.5 border rounded-xl px-4 h-[52px] bg-white transition-all
                ${
                  errors.password
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <Lock size={18} className="text-gray-400 shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-xl font-semibold text-sm text-white transition-all duration-200
                bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600
                active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                shadow-md shadow-blue-200/60"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 shrink-0">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="w-full h-[52px] border border-gray-200 rounded-xl flex items-center justify-center gap-3
                text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300
                active:scale-[0.99] transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400">
                Your data is secure and protected
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

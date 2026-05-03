// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import API from "../services/api";
import logo from "../assets/images/Register_logo.png";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });

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
    if (!form.username.trim()) err.username = "Username is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Invalid email format";
    if (!form.password) err.password = "Password is required";
    else if (form.password.length < 4) err.password = "Min 4 characters";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/auth/register", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      navigate("/login", {
        state: { message: "Account created! Please log in." },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFF] to-[#F1F5FF] p-4 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-[960px]  bg-white rounded-2xl lg:rounded-[32px] shadow-[0_20px_60px_rgba(37,99,235,0.12)] overflow-hidden lg:min-h-[540px]">
        {/* ── LEFT PANEL ──────────────────────────────────────── */}
        <div
          className="flex lg:flex flex-col justify-between w-full lg:w-[44%] p-5 lg:p-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(150deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)",
          }}
        >
          {/* Dot grid */}
          <div className="absolute top-14 right-8 grid grid-cols-5 gap-[6px] opacity-20">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-[5px] h-[5px] bg-white rounded-full" />
            ))}
          </div>

          {/* Sparkles */}
          <div className="absolute top-28 right-28 text-white/40 text-2xl select-none">
            ✦
          </div>
          <div className="absolute top-56 right-14 text-white/25 text-base select-none">
            ✦
          </div>
          <div className="absolute bottom-44 left-16 text-white/30 text-xl select-none">
            ✦
          </div>

          {/* ── BIG VERTICAL LOGO ─────────────────────────────── */}
          <div className="flex justify-center">
            <img
              src={logo}
              alt="JobGenius"
              className="w-28 lg:w-36 object-contain drop-shadow-lg"
            />
          </div>

          {/* Hero text */}
          <div className="z-10">
            <h2 className="text-white text-[20px] lg:text-2xlfont-bold leading-tight mb-4">
              Start your smart
              <br />
              career journey
              <br />
              <span className="text-cyan-300">today!</span>
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-full lg:max-w-[240px]">
              Join thousands of professionals getting matched with the right
              opportunities.
            </p>
          </div>

          {/* Illustration */}
          <div className="hidden lg:flex relative justify-center mt-4">
            {/* Main card */}
            <div className="bg-white/[0.15] backdrop-blur-sm rounded-2xl p-5 w-48 relative shadow-lg">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-200/80 flex items-center justify-center">
                  <UserRound size={28} className="text-blue-700" />
                </div>
                <div className="w-full space-y-2">
                  <div className="h-2 bg-white/50 rounded-full w-full" />
                  <div className="h-2 bg-white/40 rounded-full w-[85%]" />
                  <div className="h-2 bg-white/30 rounded-full w-[65%]" />
                  <div className="h-2 bg-white/25 rounded-full w-[80%]" />
                </div>
              </div>
              {/* Checkmark */}
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg ring-4 ring-emerald-400/20">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-4 bg-white/20 backdrop-blur-sm rounded-xl p-2.5 shadow-lg">
              <div className="w-8 h-8 bg-blue-200/80 rounded-lg flex items-center justify-center">
                <UserRound size={16} className="text-blue-700" />
              </div>
            </div>
            <div className="absolute -right-2 top-6 bg-white/20 backdrop-blur-sm rounded-xl p-2.5 shadow-lg">
              <BriefcaseBusiness size={18} className="text-white" />
            </div>
          </div>

          <div className="mt-4" />
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 lg:px-14 py-10 relative">
          {/* Top right link */}
          <div className="absolute top-4 right-4 lg:top-6 lg:right-8 text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
            Create Your Account
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            Start your smart job matching journey
          </p>

          {/* Server error */}
          {serverError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-3 lg:space-y-4"
          >
            {/* Username only */}
            <div>
              <div
                className={`flex items-center gap-2.5 border rounded-xl px-4 h-[40px] lg:h-[40px] bg-white transition-all duration-200
                      focus-within:scale-[1.01] focus-within:shadow-[0_4px_14px_rgba(37,99,235,0.15)]
                ${
                  errors.username
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <User size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  disabled={loading}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div
                className={`flex items-center gap-2.5 border rounded-xl px-4 h-[40px] bg-white transition-all duration-200
                      focus-within:scale-[1.01] focus-within:shadow-[0_4px_14px_rgba(37,99,235,0.15)]
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
                  placeholder="Enter a Email"
                  disabled={loading}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password only (no confirm) */}
            <div>
              <div
                className={`flex items-center gap-2.5 border rounded-xl px-4 h-[40px] lg:h-[40px] bg-white transition-all duration-200
                      focus-within:scale-[1.01] focus-within:shadow-[0_4px_14px_rgba(37,99,235,0.15)]
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
                  placeholder="Enter a Password"
                  disabled={loading}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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

            {/* Role Selection */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">I am a</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Candidate */}
                <label
                  className={`relative flex flex-col items-center gap-2 p-5 border-2 rounded-xl cursor-pointer transition-all
                  ${
                    form.role === "CANDIDATE"
                      ? "border-blue-500 bg-blue-50/60 shadow-sm"
                      : "border-gray-200 hover:border-blue-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="CANDIDATE"
                    checked={form.role === "CANDIDATE"}
                    onChange={handleChange}
                    className="absolute top-3 right-3 accent-blue-600 w-4 h-4"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                    ${form.role === "CANDIDATE" ? "bg-blue-100" : "bg-gray-100"}`}
                  >
                    <UserRound
                      size={22}
                      className={
                        form.role === "CANDIDATE"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    />
                  </div>
                  <span className="font-semibold text-sm text-gray-800">
                    Candidate
                  </span>
                  <span className="text-[11px] text-gray-500 text-center leading-snug">
                    I'm looking for jobs
                    <br />
                    and opportunities
                  </span>
                </label>

                {/* Recruiter */}
                <label
                  className={`relative flex flex-col items-center gap-2 p-5 border-2 rounded-xl cursor-pointer transition-all
                  ${
                    form.role === "RECRUITER"
                      ? "border-blue-500 bg-blue-50/60 shadow-sm"
                      : "border-gray-200 hover:border-blue-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="RECRUITER"
                    checked={form.role === "RECRUITER"}
                    onChange={handleChange}
                    className="absolute top-3 right-3 accent-blue-600 w-4 h-4"
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                    ${form.role === "RECRUITER" ? "bg-blue-100" : "bg-gray-100"}`}
                  >
                    <BriefcaseBusiness
                      size={22}
                      className={
                        form.role === "RECRUITER"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    />
                  </div>
                  <span className="font-semibold text-sm text-gray-800">
                    Recruiter
                  </span>
                  <span className="text-[11px] text-gray-500 text-center leading-snug">
                    I want to hire and
                    <br />
                    find great talent
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[40px] lg:h-[40px] rounded-xl font-semibold text-sm text-white transition-all duration-200
              bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500
              hover:shadow-[0_12px_35px_rgba(37,99,235,0.45)]
              shadow-[0_8px_25px_rgba(37,99,235,0.35)]
              active:scale-[0.98]"
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full h-[40px] lg:h-[40px] border border-gray-200 rounded-xl flex items-center justify-center gap-3
                text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all"
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

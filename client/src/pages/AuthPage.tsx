import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useApi } from "../api/api";
import { Mail, Lock, User as UserIcon, RefreshCw, Sparkles, Shield, Award, KeyRound } from "lucide-react";
import { useSuccess } from "../context/SuccessContext";

interface FormState {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  adminPasscode: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminPasscode: "admin123",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const { login } = useContext(AuthContext);
  const api = useApi();
  const navigate = useNavigate();
  const { addMessage } = useSuccess();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: value && !emailRegex.test(value) ? "Invalid email address" : null,
      }));
    }
    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value && value.length < 6 ? "Password must be at least 6 characters" : null,
      }));
    }
    if (name === "name") {
      setErrors((prev) => ({
        ...prev,
        name: !value && !isLogin ? "Name is required" : null,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.password.trim() || form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isLogin && !form.name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!isLogin && form.role === "admin" && !form.adminPasscode.trim()) {
      newErrors.adminPasscode = "Admin security passcode is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillDemoCredentials = (role: "admin" | "user") => {
    if (role === "admin") {
      setIsLogin(true);
      setForm((prev) => ({
        ...prev,
        email: "admin@quizzy.io",
        password: "admin123",
      }));
      setErrors({});
    } else {
      setIsLogin(true);
      setForm((prev) => ({
        ...prev,
        email: "student@quizzy.io",
        password: "user123",
      }));
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email.trim(), password: form.password }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
            adminPasscode: form.role === "admin" ? form.adminPasscode.trim() : undefined,
          };

      const res = await api.post(endpoint, payload);

      if (isLogin) {
        const { token, user } = res.data;
        if (token && user) {
          login(token, user);
          const isUserAdmin = Boolean(user.isAdmin || user.role === "admin");
          addMessage(`Welcome back, ${user.name || (isUserAdmin ? "Admin" : "Student")}!`);
          if (isUserAdmin) {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        } else {
          setErrors({ general: "Login response was missing user or token." });
        }
      } else {
        if (res.data.token && res.data.user) {
          const { token, user } = res.data;
          login(token, user);
          const isUserAdmin = Boolean(user.isAdmin || user.role === "admin");
          addMessage(`Account created! Welcome, ${user.name}!`);
          if (isUserAdmin) {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        } else {
          addMessage("Account created successfully! Please sign in.");
          setIsLogin(true);
          setForm((prev) => ({ ...prev, password: "" }));
          setErrors({});
        }
      }
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(", ") : null) ||
        "Authentication failed. Please verify your credentials.";
      setErrors({ general: serverMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md border border-slate-200 shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-inner">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isLogin ? "Sign In to Quizzy" : "Create an Account"}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {isLogin
              ? "Single login portal for both Students & Quiz Admins"
              : "Register as a candidate or quiz administrator"}
          </p>
        </div>

        {/* Demo Account Quick Buttons */}
        <div className="mb-6 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
          <p className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-600" />
            Quick 1-Click Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials("admin")}
              className="px-3 py-2 bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Shield size={14} className="text-amber-600" />
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials("user")}
              className="px-3 py-2 bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Award size={14} className="text-indigo-600" />
              Demo Student
            </button>
          </div>
        </div>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
          >
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Role:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: "user" }))}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        form.role === "user"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Award size={18} />
                      Candidate / User
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: "admin" }))}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        form.role === "admin"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Shield size={18} />
                      Quiz Host / Admin
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="relative">
                  <UserIcon
                    size={19}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${
                      errors.name ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Admin Passcode if Admin */}
                {form.role === "admin" && (
                  <div className="relative">
                    <KeyRound
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500"
                    />
                    <input
                      type="text"
                      name="adminPasscode"
                      placeholder="Admin Passcode (Default: admin123)"
                      value={form.adminPasscode}
                      onChange={handleChange}
                      className="w-full p-3 pl-11 bg-amber-50/50 text-slate-900 rounded-xl placeholder-amber-700/60 border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all font-medium"
                    />
                    {errors.adminPasscode && (
                      <p className="text-red-600 text-xs mt-1">{errors.adminPasscode}</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${
                errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
              } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={handleChange}
              className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${
                errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
              } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all mt-4"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : isLogin ? (
              "Sign In to Dashboard"
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
          {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors ml-1"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

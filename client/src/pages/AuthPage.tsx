import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useApi } from "../api/api";
import { Mail, Lock, User as UserIcon, RefreshCw, Sparkles, Award } from "lucide-react";
import { useSuccess } from "../context/SuccessContext";

interface FormState {
  name: string;
  email: string;
  password: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*
  const fillDemoCredentials = (role: "admin" | "user") => {
    if (role === "admin") {
      setIsLogin(true);
      setForm((prev) => ({
        ...prev,
        email: "admin43@gmail.com",
        password: "admin43",
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
  */

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
          role: "user",  // signup always creates a Student/User account
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
          // Student registered with status = pending_approval
          const successMsg =
            res.data.message ||
            "Registration submitted successfully! Your account is pending admin approval before you can sign in.";
          addMessage(successMsg);
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
              ? "Login portal for Students & Quiz Admins"
              : "Create a free Student account to take quizzes"}
          </p>
        </div>

        {/* Demo Account Quick Buttons */}
        {/* <div className="mb-6 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
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
        </div> */}

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
                {/* Student-only info banner */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
                  <Award size={18} className="text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-900">Student Account Approval</p>
                    <p className="text-[11px] text-amber-700">
                      New student accounts require Admin Approval before logging in and taking quizzes.
                    </p>
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
                    className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${errors.name ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>
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
              className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
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
              className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
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

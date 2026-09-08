import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useApi } from "../api/api";
<<<<<<< HEAD
import { Mail, Lock, User as UserIcon, RefreshCw, Sparkles, Award } from "lucide-react";
=======
import { Mail, Lock, User, RefreshCw } from 'lucide-react';
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
import { useSuccess } from "../context/SuccessContext";

interface FormState {
  name: string;
  email: string;
  password: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
<<<<<<< HEAD
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });
=======
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "" });
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const { login } = useContext(AuthContext);
  const api = useApi();
  const navigate = useNavigate();
  const { addMessage } = useSuccess();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
<<<<<<< HEAD
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
=======
    setForm(prev => ({ ...prev, [name]: value }));

    // Live validation
    if (name === 'email') {
      setErrors(prev => ({ ...prev, email: value && !emailRegex.test(value) ? 'Invalid email address' : null }));
    }
    if (name === 'password') {
      setErrors(prev => ({ ...prev, password: value && value.length < 6 ? 'Password must be at least 6 characters' : null }));
    }
    if (name === 'name') {
      setErrors(prev => ({ ...prev, name: !value && !isLogin ? 'Name is required' : null }));
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
<<<<<<< HEAD
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.password.trim() || form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isLogin && !form.name.trim()) {
      newErrors.name = "Full name is required";
    }
=======
    if (!form.email.trim() || !emailRegex.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.password.trim() || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!isLogin && !form.name.trim()) newErrors.name = 'Full name is required';
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

<<<<<<< HEAD
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

=======
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
<<<<<<< HEAD
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
=======
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await api.post(endpoint, form);
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6

      if (isLogin) {
        const { token, user } = res.data;
        if (token && user) {
          login(token, user);
<<<<<<< HEAD
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
=======
          addMessage("Login successful!");
          navigate("/");
        } else {
          setErrors({ email: "Login failed. Check your credentials." });
        }
      } else {
        addMessage("Account created successfully! Please login.");
        setIsLogin(true);
        setForm({ name: "", email: "", password: "" });
        setErrors({});
      }
    } catch (err: any) {
      setErrors({ email: err.response?.data?.message || "Something went wrong." });
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-1">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', damping: 10, stiffness: 100 }}
        className="bg-white-900 rounded-3xl p-10 w-full max-w-md border border-gray-200"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">
          {isLogin ? "Welcome Back" : "Join Us"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
<<<<<<< HEAD
                    className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${errors.name ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
=======
                    className={`w-full p-3 pl-10 bg-gray-50 text-gray-900 rounded-xl placeholder-gray-500 border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

<<<<<<< HEAD
          {/* Email */}
          <div className="relative">
            <Mail
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
=======
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
<<<<<<< HEAD
              className={`w-full p-3 pl-11 bg-slate-50 text-slate-900 rounded-xl placeholder-slate-400 border text-sm ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"
                } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
=======
              className={`w-full p-3 pl-10 bg-gray-50 text-gray-900 rounded-xl placeholder-gray-500 border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

<<<<<<< HEAD
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
=======
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`w-full p-3 pl-10 bg-gray-50 text-gray-900 rounded-xl placeholder-gray-500 border ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>

          <motion.button
            type="submit"
<<<<<<< HEAD
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
=======
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-semibold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? <RefreshCw size={24} className="animate-spin" /> : isLogin ? "Login" : "Create Account"}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setForm({ name: "", email: "", password: "" }); setErrors({}); }}
            className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
      </motion.div>
    </div>
  );
}

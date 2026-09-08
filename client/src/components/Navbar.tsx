// Navbar.tsx
import { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User as UserIcon, Mail, Shield, Award } from "lucide-react";
import { AuthContext } from "../context/authContext";
import type { Variants } from "framer-motion";
import { useSuccess } from "../context/SuccessContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, isAdmin, logout } = useContext(AuthContext);
  const { addMessage } = useSuccess();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isModalOpen) setIsModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    addMessage("Logged out successfully");
    setIsModalOpen(false);
  };

  const handleDashboardClick = () => {
    setIsModalOpen(false);
  };

  // Nav links customized by role
  const navLinks = isAdmin
    ? [
        { name: "Admin Dashboard", path: "/admin" },
        { name: "Create Quiz", path: "/create" },
        { name: "All Quizzes", path: "/list" },
        { name: "Explore", path: "/explore" },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Available Quizzes", path: "/list" },
        { name: "Explore", path: "/explore" },
      ];

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1 transition-colors duration-200"
      : "hover:text-indigo-600 font-medium transition-colors duration-200";

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.3, duration: 0.4 } },
  };

  return (
    <nav className="bg-white text-gray-700 shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand Name */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <Link to="/" className="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              Q
            </span>
            Quizzy
          </Link>

          {user && (
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                isAdmin
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-200"
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield size={13} className="text-amber-600" />
                  Admin
                </>
              ) : (
                <>
                  <Award size={13} className="text-indigo-600" />
                  User
                </>
              )}
            </span>
          )}
        </motion.div>

        <div className="flex items-center space-x-6">
          {/* Desktop Navigation Links */}
          <motion.div
            className="hidden md:flex items-center space-x-6 text-sm"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={linkClasses}>
                {link.name}
              </NavLink>
            ))}
          </motion.div>

          {/* User Avatar and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            {user ? (
              <motion.button
                onClick={toggleModal}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="User profile"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>
              </motion.button>
            ) : (
              <NavLink
                to="/auth"
                className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm"
              >
                Sign In
              </NavLink>
            )}

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition md:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
            className="md:hidden bg-white border-b border-gray-200 shadow-xl pb-4 px-4"
          >
            <div className="flex flex-col space-y-3 pt-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={toggleMobileMenu}
                  className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  {link.name}
                </NavLink>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    toggleModal();
                    toggleMobileMenu();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm flex items-center justify-between"
                >
                  <span>{user.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-600 text-white">
                    {isAdmin ? "Admin" : "Student"}
                  </span>
                </button>
              ) : (
                <NavLink
                  to="/auth"
                  onClick={toggleMobileMenu}
                  className="w-full text-center bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm"
                >
                  Sign In
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isModalOpen && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={toggleModal}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
              className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-auto border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{user.name}</h3>
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                        isAdmin
                          ? "bg-amber-100 text-amber-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {isAdmin ? "👑 Quiz Administrator" : "🎓 Student Candidate"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2.5 mb-6 text-sm">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail size={18} className="text-gray-400" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-400 font-medium">Email</p>
                    <p className="font-semibold text-gray-800 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <UserIcon size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Role Permissions</p>
                    <p className="font-semibold text-gray-800">
                      {isAdmin ? "Full Admin & Quiz Host" : "Candidate / Quiz Taker"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  onClick={handleDashboardClick}
                  className={`w-full py-2.5 text-white font-bold rounded-xl shadow-sm text-sm flex items-center justify-center gap-2 transition ${
                    isAdmin
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isAdmin ? "Go to Admin Dashboard" : "Go to User Dashboard"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

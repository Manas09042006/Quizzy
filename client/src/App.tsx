<<<<<<< HEAD
import { type JSX, useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
=======
import { type JSX, useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import QuizList from "./pages/QuizList";
import TakeQuiz from "./pages/TakeQuiz";
<<<<<<< HEAD
import WaitingRoom from "./pages/WaitingRoom";
=======
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
import Result from "./pages/Result";
import Explore from "./pages/Explore";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorDisplay from "./components/ErrorDisplay";
import { ErrorProvider } from "./context/ErrorContext";
import { AuthProvider, AuthContext } from "./context/authContext";
import UserDashboard from "./pages/UserDashboard";
<<<<<<< HEAD
import AdminDashboard from "./pages/admin/AdminDashboard";
import MonitorQuiz from "./pages/admin/MonitorQuiz";
=======
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
import { SuccessProvider } from "./context/SuccessContext";
import SuccessDisplay from "./components/SucessDisplay";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
<<<<<<< HEAD
  const { token, isInitialized } = useContext(AuthContext);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
=======
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until token is loaded from localStorage
    setLoading(false);
  }, [token]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

<<<<<<< HEAD
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { token, isAdmin, isInitialized } = useContext(AuthContext);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  // Hide Navbar and Footer during quiz execution for distraction-free full-screen mode
  const isExamMode = location.pathname.startsWith("/take/");

  return (
    <div className={`min-h-screen ${isExamMode ? "bg-slate-900" : "bg-slate-50"} text-slate-900 flex flex-col`}>
      {!isExamMode && <Navbar />}

      <main className={isExamMode ? "w-full flex-1 p-0 m-0" : "container mx-auto px-2 flex-1"}>
        {!isExamMode && <ErrorDisplay />}
        {!isExamMode && <SuccessDisplay />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/list" element={<QuizList />} />
          <Route path="/explore" element={<Explore />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiting/:id"
            element={
              <ProtectedRoute>
                <WaitingRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/take/:id"
            element={
              <ProtectedRoute>
                <TakeQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:id"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/monitor/:id"
            element={
              <AdminRoute>
                <MonitorQuiz />
              </AdminRoute>
            }
          />
          <Route
            path="/create"
            element={
              <AdminRoute>
                <CreateQuiz />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isExamMode && <Footer />}
    </div>
  );
}

=======
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
export default function App() {
  return (
    <AuthProvider>
      <SuccessProvider>
        <ErrorProvider>
<<<<<<< HEAD
          <AppContent />
=======
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="container mx-auto px-1 flex-1">
              <ErrorDisplay />
              <SuccessDisplay />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <CreateQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/take/:id"
                  element={
                    <ProtectedRoute>
                      <TakeQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/list" element={<QuizList />} />
                <Route path="/result/:id" element={<Result />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
        </ErrorProvider>
      </SuccessProvider>
    </AuthProvider>
  );
}

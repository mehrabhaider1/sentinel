import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OverviewPage from "./pages/OverviewPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import HistoryPage from "./pages/HistoryPage";
import AnalysisDetailsPage from "./pages/AnalysisDetailsPage";
import SettingsPage from "./pages/SettingsPage";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function App() {
  const location = useLocation();

  return (
    <>
      <Toaster />
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          {/* Public landing page */}
          <Route path="/" element={
            <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
              <LandingPage />
            </motion.div>
          } />

          {/* Auth pages */}
          <Route path="/login" element={
            <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
              <LoginPage />
            </motion.div>
          } />
          <Route path="/signup" element={
            <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
              <SignupPage />
            </motion.div>
          } />
          <Route path="/forgot-password" element={
            <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
              <ForgotPasswordPage />
            </motion.div>
          } />

          {/* Protected app routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<OverviewPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analyses" element={<HistoryPage />} />
            <Route path="/analyses/:analysisId" element={<AnalysisDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

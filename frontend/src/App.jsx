import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

import "./i18n";

import LandingPage    from "./pages/LandingPage";
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
import Dashboard      from "./pages/Dashboard";
import UploadPage     from "./pages/UploadPage";
import StudyPage      from "./pages/StudyPage";
import ProtectedRoute from "./components/ProtectedRoute";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.22 }}
  >
    {children}
  </motion.div>
);

// placeholders — build these out as separate modules later
const MyProgress = () => (
  <div className="min-h-screen bg-cream-100 flex items-center justify-center pt-16">
    <div className="text-center">
      <h1 className="font-display text-3xl text-forest-700 mb-2">My Progress</h1>
      <p className="text-ink-400 text-sm">Coming soon.</p>
    </div>
  </div>
);

const AITutor = () => (
  <div className="min-h-screen bg-cream-100 flex items-center justify-center pt-16">
    <div className="text-center">
      <h1 className="font-display text-3xl text-forest-700 mb-2">AI Tutor</h1>
      <p className="text-ink-400 text-sm">Coming soon.</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── public routes ── */}
        <Route path="/"       element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/login"  element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />

        {/* ── protected dashboard shell (navbar + footer + chatbot persist) ── */}
        <Route
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"   element={<UploadPage />} />
          <Route path="/my-progress" element={<MyProgress />} />
          <Route path="/ai-tutor"    element={<AITutor />}    />

          {/* study page lives inside Dashboard shell so nav + chatbot stay visible */}
          <Route path="/study/:lecture_id" element={<StudyPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#1a1917",
            color: "#fdfaf5",
            fontSize: "13.5px",
            fontFamily: "DM Sans, system-ui, sans-serif",
            borderRadius: "12px",
            padding: "12px 18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
          },
          success: { iconTheme: { primary: "#F5C842", secondary: "#1a1917" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff"    } },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  </GoogleOAuthProvider>
);

export default App;
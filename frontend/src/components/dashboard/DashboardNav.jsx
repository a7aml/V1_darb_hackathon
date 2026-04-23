import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUser, clearSession } from "../../utils/storage";
import toast from "react-hot-toast";

const DashboardNav = () => {
  const [scrolled,    setScrolled]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const navigate = useNavigate();
  const user     = getUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    clearSession();
    toast.success("Logged out.");
    navigate("/login");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const navLinks = [
    { to: "/quizzes",     label: "Quizzes",     icon: <QuizIcon />    },
    { to: "/my-progress", label: "My Progress", icon: <ProgressIcon /> },
    { to: "/ai-tutor",    label: "AI Tutor",    icon: <TutorIcon />   },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
     ${isActive
       ? "bg-forest-700 text-white shadow-sm"
       : "text-ink-600 hover:bg-forest-700/8 hover:text-forest-700"
     }`;

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0,    opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 inset-x-0 z-40 transition-all duration-300
          ${scrolled
            ? "bg-cream-100/95 backdrop-blur-md border-b border-forest-700/8 shadow-sm"
            : "bg-cream-100 border-b border-forest-700/6"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-6">

          {/* logo */}
          <button
            onClick={() => navigate("/quizzes")}
            className="font-display text-xl text-forest-700 tracking-tight shrink-0 hover:opacity-80 transition-opacity"
          >
            Study GPT
          </button>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* avatar + profile */}
          <div className="hidden md:flex items-center gap-3 relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-forest-700/8 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <span className="text-sm font-medium text-ink-700 max-w-[120px] truncate">
                {user?.full_name?.split(" ")[0] ?? "Student"}
              </span>
              <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-ink-400">
                <ChevronIcon />
              </motion.div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full end-0 mt-2 w-52 bg-white rounded-2xl border border-forest-100 shadow-card z-40 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-forest-100/60">
                      <p className="text-sm font-semibold text-ink-900 truncate">{user?.full_name}</p>
                      <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 rounded-xl hover:bg-cream-100 transition-colors text-start">
                        <ProfileIcon /> My Account
                      </button>
                      <div className="h-px bg-forest-100/60 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 rounded-xl hover:bg-red-50 transition-colors text-start"
                      >
                        <LogoutIcon /> Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-forest-700/6 transition-colors"
          >
            <motion.span animate={mobileOpen ? { rotate: 45,  y: 6  } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} className="w-5 h-0.5 bg-ink-700 rounded-full block" />
            <motion.span animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.22 }} className="w-5 h-0.5 bg-ink-700 rounded-full block" />
            <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} className="w-5 h-0.5 bg-ink-700 rounded-full block" />
          </button>
        </div>
      </motion.header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-sm md:hidden" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 end-0 z-50 h-full w-72 bg-white shadow-card-lg flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-forest-100/60">
                <span className="font-display text-lg text-forest-700">Study GPT</span>
                <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-100 transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-forest-100/60">
                <div className="w-10 h-10 rounded-full bg-forest-700 flex items-center justify-center text-sm font-bold text-white">{initials}</div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{user?.full_name}</p>
                  <p className="text-xs text-ink-400">{user?.email}</p>
                </div>
              </div>
              <div className="flex-1 px-4 py-5 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div key={link.to} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <NavLink to={link.to} onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${isActive ? "bg-forest-700 text-white" : "text-ink-700 hover:bg-cream-100"}`}
                    >
                      {link.icon} {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
              <div className="px-4 pb-8 border-t border-forest-100/60 pt-4">
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-500 rounded-xl border border-red-100 hover:bg-red-50 transition-colors">
                  <LogoutIcon /> Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const QuizIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const ProgressIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const TutorIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ChevronIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ProfileIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogoutIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default DashboardNav;
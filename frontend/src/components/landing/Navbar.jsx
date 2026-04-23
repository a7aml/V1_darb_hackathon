import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

// ─── language toggle ──────────────────────────────────────────────────────────
// Pill toggle: EN | AR — sliding teal indicator, always readable colors.
// Uses `translateX` instead of left/right so framer-motion can animate it cleanly.
const LangToggle = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const toggle = () => i18n.changeLanguage(isArabic ? "en" : "ar");

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
      // fixed width so the pill math is predictable
      className="relative flex items-center h-8 rounded-full border border-forest-200 bg-white hover:border-forest-400 transition-colors duration-200 overflow-hidden shrink-0" dir="ltr"
      style={{ width: 76, padding: "3px" }}
    >
      {/* sliding teal pill — always moves from left:3 to right:3 using translateX */}
      <motion.span
        className="absolute top-[3px] bottom-[3px] rounded-full bg-forest-700"
        style={{ width: 35, left: 3 }}
        animate={{ x: isArabic ? 35 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      />

      {/* EN — white when active (pill behind it), muted ink when inactive */}
      <motion.span
        className="relative z-10 text-center text-xs font-semibold select-none"
        style={{ width: 35 }}
        animate={{ color: isArabic ? "#8a8782" : "#ffffff" }}
        transition={{ duration: 0.22 }}
      >
        EN
      </motion.span>

      {/* AR — white when active, muted ink when inactive */}
      <motion.span
        className="relative z-10 text-center text-xs font-semibold select-none"
        style={{ width: 35 }}
        animate={{ color: isArabic ? "#ffffff" : "#8a8782" }}
        transition={{ duration: 0.22 }}
      >
        AR
      </motion.span>
    </motion.button>
  );
};

// ─── page transition animation when language changes ─────────────────────────
// Wraps children and replays a quick fade when the language key changes
const LangTransition = ({ children }) => {
  const { i18n } = useTranslation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={i18n.language}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y: -6 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "contents" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export { LangTransition };

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isArabic = i18n.language === "ar";

  // apply RTL to <html> when Arabic is active
  useEffect(() => {
    document.documentElement.dir  = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar"  : "en";
  }, [isArabic]);

  // blur navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close drawer on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { key: "nav.home",         href: "#home"         },
    { key: "nav.features",     href: "#features"     },
    { key: "nav.about",        href: "#about"        },
    { key: "nav.testimonials", href: "#testimonials" },
  ];

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-300
          ${scrolled
            ? "bg-cream-100/90 backdrop-blur-md border-b border-forest-700/8 shadow-sm"
            : "bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-6">

          {/* logo */}
          <button
            onClick={() => scrollTo("#home")}
            className="font-display text-xl text-forest-700 tracking-tight shrink-0 hover:opacity-80 transition-opacity"
          >
            Study GPT
          </button>

          {/* desktop nav links — re-render text when language changes */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-ink-700 rounded-lg hover:bg-forest-700/6 hover:text-forest-700 transition-all duration-200"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={i18n.language + link.key}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="block"
                  >
                    {t(link.key)}
                  </motion.span>
                </AnimatePresence>
              </button>
            ))}
          </nav>

          {/* right side */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-ink-700 rounded-lg hover:bg-forest-700/6 hover:text-forest-700 transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={i18n.language + "login"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {t("nav.login")}
                </motion.span>
              </AnimatePresence>
            </Link>

            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-semibold text-ink-900 rounded-xl transition-all duration-200 hover:-translate-y-px"
              style={{ backgroundColor: "#F5C842", boxShadow: "0 2px 8px rgba(245,200,66,0.35)" }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={i18n.language + "signup"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {t("nav.signup")}
                </motion.span>
              </AnimatePresence>
            </Link>
          </div>

          {/* mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-forest-700/6 transition-colors"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45,  y: 6  } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
              className="w-5 h-0.5 bg-ink-700 rounded-full block"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.22 }}
              className="w-5 h-0.5 bg-ink-700 rounded-full block"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
              className="w-5 h-0.5 bg-ink-700 rounded-full block"
            />
          </button>
        </div>
      </motion.header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-sm md:hidden"
            />

            {/* drawer */}
            <motion.div
              initial={{ x: isArabic ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{    x: isArabic ? "-100%" : "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 end-0 z-50 h-full w-72 bg-white shadow-card-lg flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-forest-100/60">
                <span className="font-display text-lg text-forest-700">Study GPT</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-100 transition-colors text-ink-500"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.key}
                    initial={{ opacity: 0, x: isArabic ? -16 : 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    onClick={() => scrollTo(link.href)}
                    className="w-full text-start px-4 py-3 text-sm font-medium text-ink-700 rounded-xl hover:bg-cream-100 hover:text-forest-700 transition-all duration-200"
                  >
                    {t(link.key)}
                  </motion.button>
                ))}

                {/* language toggle inside mobile drawer */}
                <div className="pt-5 border-t border-forest-100/60 mt-4">
                  <p className="px-4 text-2xs font-semibold tracking-widest uppercase text-ink-300 mb-3">
                    Language
                  </p>
                  <div className="px-4">
                    <LangToggle />
                  </div>
                </div>
              </div>

              <div className="px-4 pb-8 space-y-2 border-t border-forest-100/60 pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center py-3 text-sm font-medium text-ink-700 rounded-xl border border-forest-100 hover:bg-cream-100 transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center py-3 text-sm font-semibold text-ink-900 rounded-xl transition-all hover:-translate-y-px"
                  style={{ backgroundColor: "#F5C842" }}
                >
                  {t("nav.signup")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── icon ─────────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6"  y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);

export default Navbar;
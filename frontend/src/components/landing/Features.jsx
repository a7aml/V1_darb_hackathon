import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

const ease = [0.22, 1, 0.36, 1];

const featureIcons = [
  // AI Summaries
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  // Smart Quizzes
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  // AI Tutor
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  // Progress Tracking
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
  // Multi-format Upload
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  // Library
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
];

const FeatureCard = ({ title, description, icon: Icon, index }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease, delay: (index % 3) * 0.1 }}
      className="group relative bg-white rounded-2xl border border-forest-100/70 p-7 hover:border-forest-200 hover:shadow-card transition-all duration-300"
    >
      {/* hover accent line */}
      <div className="absolute top-0 start-6 end-6 h-px bg-gradient-to-r from-transparent via-gold-400/0 to-transparent group-hover:via-gold-400/60 transition-all duration-500" />

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-forest-700"
        style={{ backgroundColor: "rgba(26,74,71,0.08)", color: "#1a4a47" }}
      >
        <motion.div
          className="group-hover:text-white transition-colors duration-300"
          style={{ color: "#1a4a47" }}
        >
          <Icon />
        </motion.div>
      </div>

      <h3 className="font-display text-xl text-ink-900 mb-2 group-hover:text-forest-700 transition-colors duration-200">
        {title}
      </h3>
      <p className="text-sm text-ink-500 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const Features = () => {
  const { t }  = useTranslation();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const items = t("features.items", { returnObjects: true });

  return (
    <section id="features" className="py-28 bg-cream-50 relative overflow-hidden">

      {/* background decoration */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(26,74,71,0.12), transparent)" }}
        />
        <motion.div
          className="blob absolute -end-40 top-1/3 w-96 h-96"
          style={{ backgroundColor: "rgba(245,200,66,0.06)" }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10">

        {/* section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-16"
        >
          <span className="inline-block text-2xs font-semibold tracking-[0.18em] uppercase text-forest-600 mb-4 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-100">
            {t("features.badge")}
          </span>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ink-900 leading-tight mb-4">
            {t("features.headline")}
          </h2>
          <p className="text-ink-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("features.subheadline")}
          </p>
        </motion.div>

        {/* cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <FeatureCard
              key={i}
              index={i}
              title={item.title}
              description={item.description}
              icon={featureIcons[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
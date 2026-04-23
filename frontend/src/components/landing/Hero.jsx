import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

const ease = [0.22, 1, 0.36, 1];

const Hero = () => {
  const { t } = useTranslation();
  const ref    = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // parallax — content drifts up slightly as you scroll
  const y       = useTransform(scrollYProgress, [0, 1], ["0%",  "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const stats = [
    { value: t("hero.stat_1_value"), label: t("hero.stat_1_label") },
    { value: t("hero.stat_2_value"), label: t("hero.stat_2_label") },
    { value: t("hero.stat_3_value"), label: t("hero.stat_3_label") },
  ];

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-cream-100"
    >
      {/* ── cinematic background ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>

        {/* large teal gradient sweep */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 60% -10%, rgba(26,74,71,0.13) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 100% 100%, rgba(245,200,66,0.10) 0%, transparent 60%),
              radial-gradient(ellipse 40% 50% at 0% 80%,   rgba(26,74,71,0.07) 0%, transparent 60%)
            `,
          }}
        />

        {/* animated morphing blob — top right */}
        <motion.div
          className="blob absolute -top-40 -end-40 w-[600px] h-[600px]"
          style={{ backgroundColor: "rgba(26,74,71,0.07)" }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* animated morphing blob — bottom left */}
        <motion.div
          className="blob absolute -bottom-48 -start-32 w-[500px] h-[500px]"
          style={{ backgroundColor: "rgba(245,200,66,0.09)" }}
          animate={{ scale: [1, 1.06, 1], rotate: [0, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />

        {/* floating dots grid — decorative */}
        <DotsGrid />

        {/* large background wordmark */}
        <div
          className="absolute bottom-8 end-0 text-[clamp(5rem,18vw,16rem)] font-display font-bold leading-none select-none pointer-events-none"
          style={{ color: "rgba(26,74,71,0.035)", letterSpacing: "-0.04em" }}
        >
          GPT
        </div>
      </div>

      {/* ── content ── */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-10 pt-28 pb-20"
      >
        <div className="max-w-4xl">

          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-forest-200 bg-white/70 backdrop-blur-sm mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-pulse-slow" />
            <span className="text-xs font-semibold text-forest-700 tracking-wide">
              {t("hero.badge")}
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="font-display text-[clamp(3rem,7vw,6rem)] leading-[1.05] tracking-tight text-ink-900 mb-6"
          >
            {t("hero.headline_1")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-forest-700 italic">{t("hero.headline_2")}</span>
              {/* underline accent */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, ease, delay: 0.8 }}
                className="absolute -bottom-1 start-0 end-0 h-1 rounded-full origin-start"
                style={{ backgroundColor: "#F5C842" }}
              />
            </span>
          </motion.h1>

          {/* subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, ease, delay: 0.35 }}
            className="text-lg md:text-xl text-ink-500 leading-relaxed mb-10 max-w-2xl"
          >
            {t("hero.subheadline")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, ease, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 mb-20"
          >
            <Link to="/signup">
              <motion.span
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-ink-900 transition-shadow duration-200"
                style={{
                  backgroundColor: "#F5C842",
                  boxShadow: "0 4px 16px rgba(245,200,66,0.40)",
                }}
              >
                {t("hero.cta_primary")}
                <ArrowIcon />
              </motion.span>
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-medium text-forest-700 border border-forest-200 bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-200"
            >
              {t("hero.cta_secondary")}
              <PlayIcon />
            </motion.button>
          </motion.div>

          {/* stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, ease, delay: 0.58 }}
            className="flex flex-wrap gap-x-12 gap-y-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.5, ease, delay: 0.6 + i * 0.1 }}
                className="flex flex-col"
              >
                <span className="font-display text-4xl text-forest-700 leading-none mb-1">
                  {stat.value}
                </span>
                <span className="text-sm text-ink-500">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 start-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-2xs text-ink-300 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-ink-300/50 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-ink-400" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// decorative dots grid
const DotsGrid = () => (
  <div className="absolute top-24 end-8 md:end-24 grid grid-cols-6 gap-3 opacity-30">
    {Array.from({ length: 48 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-1 h-1 rounded-full bg-forest-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: (i * 0.07) % 2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
  </svg>
);

export default Hero;
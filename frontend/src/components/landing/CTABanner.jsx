import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

const ease = [0.22, 1, 0.36, 1];

const CTABanner = () => {
  const { t }  = useTranslation();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease }}
          className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
          style={{ backgroundColor: "#1a4a47" }}
        >
          {/* background blobs inside the banner */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="blob absolute -top-20 -end-20 w-80 h-80"
              style={{ backgroundColor: "rgba(245,200,66,0.12)" }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="blob absolute -bottom-16 -start-16 w-64 h-64"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            {/* subtle dot grid */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.5, ease }}
              className="text-2xs font-semibold tracking-[0.18em] uppercase text-gold-400 mb-4"
            >
              Ready to start?
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.22, duration: 0.6, ease }}
              className="font-display text-[clamp(2rem,5vw,4rem)] text-white leading-tight mb-5"
            >
              Your breakthrough is{" "}
              <span className="italic" style={{ color: "#F5C842" }}>one upload away.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5, ease }}
              className="text-white/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            >
              Join over 50,000 students who transformed their study habits with Study GPT.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.38, duration: 0.5, ease }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/signup">
                <motion.span
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-ink-900 transition-shadow duration-200"
                  style={{
                    backgroundColor: "#F5C842",
                    boxShadow: "0 4px 20px rgba(245,200,66,0.35)",
                  }}
                >
                  {t("nav.signup")}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.span>
              </Link>

              <Link to="/login">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium text-white border border-white/20 hover:bg-white/10 transition-all duration-200"
                >
                  {t("nav.login")}
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
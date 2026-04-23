import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

const ease = [0.22, 1, 0.36, 1];

const About = () => {
  const { t }  = useTranslation();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    { titleKey: "about.value_1_title", descKey: "about.value_1_desc", emoji: "🎯" },
    { titleKey: "about.value_2_title", descKey: "about.value_2_desc", emoji: "🤖" },
    { titleKey: "about.value_3_title", descKey: "about.value_3_desc", emoji: "🚀" },
  ];

  return (
    <section id="about" className="py-28 bg-white relative overflow-hidden">

      {/* background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(26,74,71,0.10), transparent)" }}
        />
        <motion.div
          className="blob absolute -start-48 top-1/2 -translate-y-1/2 w-[500px] h-[500px]"
          style={{ backgroundColor: "rgba(26,74,71,0.04)" }}
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* left — text */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease }}
          >
            <span className="inline-block text-2xs font-semibold tracking-[0.18em] uppercase text-forest-600 mb-4 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-100">
              {t("about.badge")}
            </span>

            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] text-ink-900 leading-tight mb-6">
              {t("about.headline")}
            </h2>

            <p className="text-ink-500 text-base leading-relaxed mb-4">
              {t("about.body_1")}
            </p>
            <p className="text-ink-500 text-base leading-relaxed mb-10">
              {t("about.body_2")}
            </p>

            {/* decorative quote mark */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-forest-50 border border-forest-100">
              <div className="font-display text-6xl text-forest-200 leading-none select-none">"</div>
              <p className="text-sm text-forest-700 font-medium leading-relaxed italic">
                We built the tool we wished we had when we were students.
              </p>
            </div>
          </motion.div>

          {/* right — values */}
          <div className="space-y-4">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 32 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, ease, delay: 0.15 + i * 0.12 }}
                className="flex items-start gap-5 p-6 rounded-2xl bg-cream-50 border border-forest-100/60 hover:border-forest-200 hover:shadow-card transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-forest-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {val.emoji}
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink-900 mb-1 group-hover:text-forest-700 transition-colors">
                    {t(val.titleKey)}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">
                    {t(val.descKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
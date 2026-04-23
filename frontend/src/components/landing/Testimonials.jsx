import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const ease = [0.22, 1, 0.36, 1];

const stars = Array.from({ length: 5 });

const TestimonialCard = ({ quote, name, role, index, isActive }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease, delay: index * 0.1 }}
      className={`
        relative p-7 rounded-2xl border transition-all duration-300
        ${isActive
          ? "bg-forest-700 border-forest-600 shadow-card-lg"
          : "bg-white border-forest-100/70 hover:border-forest-200 hover:shadow-card"
        }
      `}
    >
      {/* large quote mark */}
      <div
        className="font-display text-7xl leading-none mb-2 select-none"
        style={{ color: isActive ? "rgba(245,200,66,0.4)" : "rgba(26,74,71,0.08)" }}
      >
        "
      </div>

      {/* stars */}
      <div className="flex gap-1 mb-4">
        {stars.map((_, i) => (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={isActive ? "#F5C842" : "#1a4a47"} opacity={isActive ? 1 : 0.7}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>

      <p className={`text-sm leading-relaxed mb-6 ${isActive ? "text-white/90" : "text-ink-600"}`}>
        {quote}
      </p>

      <div className="flex items-center gap-3">
        {/* avatar placeholder */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{
            backgroundColor: isActive ? "rgba(245,200,66,0.2)" : "rgba(26,74,71,0.08)",
            color: isActive ? "#F5C842" : "#1a4a47",
          }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-ink-900"}`}>{name}</p>
          <p className={`text-xs ${isActive ? "text-white/60" : "text-ink-400"}`}>{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const { t }     = useTranslation();
  const ref       = useRef(null);
  const inView    = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(0);

  const items = t("testimonials.items", { returnObjects: true });

  return (
    <section id="testimonials" className="py-28 bg-cream-100 relative overflow-hidden">

      {/* background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(26,74,71,0.10), transparent)" }}
        />
        <motion.div
          className="blob absolute -end-32 bottom-0 w-96 h-96"
          style={{ backgroundColor: "rgba(26,74,71,0.05)" }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10">

        {/* header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-16"
        >
          <span className="inline-block text-2xs font-semibold tracking-[0.18em] uppercase text-forest-600 mb-4 px-4 py-1.5 rounded-full bg-white border border-forest-100">
            {t("testimonials.badge")}
          </span>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ink-900 leading-tight mb-4">
            {t("testimonials.headline")}
          </h2>
          <p className="text-ink-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("testimonials.subheadline")}
          </p>
        </motion.div>

        {/* cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <div key={i} onClick={() => setActive(i)} className="cursor-pointer">
              <TestimonialCard
                quote={item.quote}
                name={item.name}
                role={item.role}
                index={i}
                isActive={active === i}
              />
            </div>
          ))}
        </div>

        {/* dots indicator */}
        <div className="flex justify-center gap-2 mt-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="transition-all duration-300"
            >
              <motion.div
                animate={{
                  width:           active === i ? 24 : 8,
                  backgroundColor: active === i ? "#1a4a47" : "#c4c2be",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const columns = [
    {
      heading: t("footer.product"),
      links: [
        { label: t("footer.features"),  href: "#features"  },
        { label: t("footer.pricing"),   href: "#"          },
        { label: t("footer.changelog"), href: "#"          },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { label: t("footer.about"),    href: "#about"   },
        { label: t("footer.blog"),     href: "#"        },
        { label: t("footer.careers"),  href: "#"        },
      ],
    },
    {
      heading: t("footer.legal"),
      links: [
        { label: t("footer.privacy"),  href: "#" },
        { label: t("footer.terms"),    href: "#" },
        { label: t("footer.contact"),  href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-ink-900 text-white relative overflow-hidden">

      {/* top border accent */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,200,66,0.4), transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* brand column */}
          <div className="md:col-span-1">
            <span className="font-display text-2xl text-white tracking-tight block mb-3">
              Study GPT
            </span>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              {t("footer.tagline")}
            </p>

            {/* social icons */}
            <div className="flex gap-3">
              {[
                // Twitter/X
                <svg key="x" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.265 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>,
                // LinkedIn
                <svg key="li" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>,
                // Instagram
                <svg key="ig" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>,
              ].map((icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {columns.map((col, i) => (
            <div key={i}>
              <p className="text-2xs font-semibold tracking-[0.15em] uppercase text-white/30 mb-5">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">{t("footer.copyright")}</p>
          <div className="flex items-center gap-6">
            <Link to="/login"  className="text-xs text-white/30 hover:text-white/60 transition-colors">{t("nav.login")}</Link>
            <Link to="/signup" className="text-xs text-white/30 hover:text-white/60 transition-colors">{t("nav.signup")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
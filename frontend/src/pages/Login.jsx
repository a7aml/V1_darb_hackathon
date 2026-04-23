import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import useAuth from "../hooks/useAuth";

// ─── animation config ────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease, delay: i * 0.07 },
  }),
};

const cardAnim = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease },
  },
};

// ─── sub-components ──────────────────────────────────────────────────────────
const FieldError = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -6, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{    opacity: 0, y: -6, height: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
      >
        <ExclamIcon /> {message}
      </motion.p>
    )}
  </AnimatePresence>
);

// ─── Login page ──────────────────────────────────────────────────────────────
const Login = () => {
  const { login, loginWithGoogle, loading } = useAuth();
  const [form, setForm]           = useState({ email: "", password: "" });
  const [showPw, setShowPw]       = useState(false);
  const [errors, setErrors]       = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())               e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password)                   e.password = "Password is required.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    login({ email: form.email, password: form.password });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (res) => loginWithGoogle(res.access_token),
    onError:   () => {},
  });

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col relative overflow-hidden">

      {/* ── decorative background blobs ── */}
      <div aria-hidden className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        {/* top-left teal blob */}
        <motion.div
          className="blob absolute -top-32 -left-32 w-96 h-96 bg-forest-700/8"
          animate={{ scale: [1, 1.06, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* bottom-right gold blob */}
        <motion.div
          className="blob absolute -bottom-24 -right-24 w-80 h-80 bg-gold-400/12"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* small floating dot */}
        <motion.div
          className="absolute top-1/3 right-16 w-3 h-3 rounded-full bg-gold-400/40"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-20 w-2 h-2 rounded-full bg-forest-700/20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* ── navbar ── */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5"
      >
        <span className="font-display text-xl text-forest-700 tracking-tight">
          Study GPT
        </span>
        <p className="text-sm text-ink-500">
          No account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-forest-700 underline underline-offset-4 decoration-forest-200 hover:decoration-forest-700 transition-all duration-200"
          >
            Sign up free
          </Link>
        </p>
      </motion.header>

      {/* ── main ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">

          {/* heading */}
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              custom={0} variants={fadeUp}
              className="text-2xs font-semibold tracking-[0.18em] uppercase text-forest-400 mb-3"
            >
              Welcome back
            </motion.p>
            <motion.h1
              custom={1} variants={fadeUp}
              className="font-display text-4xl md:text-5xl text-ink-900 leading-tight"
            >
              Good to see you{" "}
              <span className="italic text-forest-700">again.</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="mt-3 text-sm text-ink-500">
              Sign in to continue your learning journey.
            </motion.p>
          </motion.div>

          {/* card */}
          <motion.div
            variants={cardAnim}
            initial="hidden"
            animate="visible"
            className="auth-card p-7 md:p-9"
          >
            {/* subtle top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-forest-200 to-transparent" />

            {/* google button */}
            <motion.button
              type="button"
              onClick={() => googleLogin()}
              disabled={loading}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ghost mb-5"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </motion.button>

            {/* divider */}
            <div className="auth-divider">
              <span className="text-2xs text-ink-300 tracking-widest uppercase">or</span>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* email */}
              <div>
                <label htmlFor="email" className="field-label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`auth-input ${errors.email ? "error" : ""}`}
                />
                <FieldError message={errors.email} />
              </div>

              {/* password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="field-label mb-0">Password</label>
                  <button
                    type="button"
                    className="text-2xs font-medium text-forest-600 hover:text-forest-700 underline underline-offset-2 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`auth-input pr-11 ${errors.password ? "error" : ""}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700 transition-colors"
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <FieldError message={errors.password} />
              </div>

              {/* submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-center text-2xs text-ink-300 mt-7 leading-relaxed"
          >
            By continuing you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-ink-500 transition-colors">Terms of Service</span>
            {" & "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-ink-500 transition-colors">Privacy Policy</span>.
          </motion.p>
        </div>
      </main>
    </div>
  );
};

// ─── icons ───────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ExclamIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

export default Login;
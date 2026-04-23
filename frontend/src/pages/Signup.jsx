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

// ─── password strength ───────────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)                        score++;
  if (pw.length >= 10)                       score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  return score; // 0–3
};

const strengthMeta = [
  { label: "Too short", color: "#e5e7eb", textColor: "#9ca3af" },
  { label: "Weak",      color: "#ef4444", textColor: "#ef4444" },
  { label: "Fair",      color: "#F5C842", textColor: "#b08d00" },
  { label: "Strong",    color: "#1a4a47", textColor: "#1a4a47" },
];

// ─── shared subcomponents ────────────────────────────────────────────────────
const FieldError = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -6, height: 0 }}
        animate={{ opacity: 1, y: 0,  height: "auto" }}
        exit={{    opacity: 0, y: -6, height: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
      >
        <ExclamIcon /> {message}
      </motion.p>
    )}
  </AnimatePresence>
);

// ─── Signup page ─────────────────────────────────────────────────────────────
const Signup = () => {
  const { signup, loginWithGoogle, loading } = useAuth();

  const [form, setForm] = useState({
    full_name:        "",
    email:            "",
    password:         "",
    confirm_password: "",
  });

  const [showPw,        setShowPw]        = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors,        setErrors]        = useState({});

  const strength     = getStrength(form.password);
  const strengthInfo = strengthMeta[strength];

  // live match indicator — only show once user starts typing in confirm field
  const confirmTouched = form.confirm_password.length > 0;
  const passwordsMatch = form.password === form.confirm_password;

  const isReady =
    form.full_name &&
    form.email &&
    form.password &&
    form.confirm_password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())                      e.full_name        = "Full name is required.";
    if (!form.email.trim())                          e.email            = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email            = "Enter a valid email address.";
    if (!form.password)                              e.password         = "Password is required.";
    else if (form.password.length < 6)               e.password         = "At least 6 characters required.";
    if (!form.confirm_password)                      e.confirm_password = "Please confirm your password.";
    else if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // only send what the API expects — confirm_password stays on the client
    signup({ full_name: form.full_name, email: form.email, password: form.password });
  };

  const googleSignup = useGoogleLogin({
    onSuccess: (res) => loginWithGoogle(res.access_token),
    onError:   () => {},
  });

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col relative overflow-hidden">

      {/* ── decorative background blobs ── */}
      <div aria-hidden className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        <motion.div
          className="blob absolute -top-24 -right-32 w-96 h-96 bg-gold-400/10"
          animate={{ scale: [1, 1.07, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="blob absolute -bottom-32 -left-20 w-80 h-80 bg-forest-700/8"
          animate={{ scale: [1, 1.06, 1], rotate: [0, 6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <motion.div
          className="absolute top-1/4 left-14 w-2.5 h-2.5 rounded-full bg-forest-600/20"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-20 w-2 h-2 rounded-full bg-gold-400/50"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
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
          Have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-forest-700 underline underline-offset-4 decoration-forest-200 hover:decoration-forest-700 transition-all duration-200"
          >
            Sign in
          </Link>
        </p>
      </motion.header>

      {/* ── main ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">

          {/* heading */}
          <motion.div className="text-center mb-10" initial="hidden" animate="visible">
            <motion.p
              custom={0} variants={fadeUp}
              className="text-2xs font-semibold tracking-[0.18em] uppercase text-forest-400 mb-3"
            >
              Get started
            </motion.p>
            <motion.h1
              custom={1} variants={fadeUp}
              className="font-display text-4xl md:text-5xl text-ink-900 leading-tight"
            >
              Start learning{" "}
              <span className="italic text-forest-700">smarter.</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="mt-3 text-sm text-ink-500">
              Turn your lecture notes into a personalised study journey.
            </motion.p>
          </motion.div>

          {/* card */}
          <motion.div
            variants={cardAnim}
            initial="hidden"
            animate="visible"
            className="auth-card p-7 md:p-9"
          >
            {/* top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-forest-200 to-transparent" />

            {/* google button */}
            <motion.button
              type="button"
              onClick={() => googleSignup()}
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
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* full name */}
              <div>
                <label htmlFor="full_name" className="field-label">Full name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Ali Ahmed"
                  className={`auth-input ${errors.full_name ? "error" : ""}`}
                />
                <FieldError message={errors.full_name} />
              </div>

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
                <label htmlFor="password" className="field-label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
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

                {/* strength meter */}
                <AnimatePresence>
                  {form.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{    opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-2.5 overflow-hidden"
                    >
                      <div className="flex gap-1.5 mb-1.5">
                        {[1, 2, 3].map((level) => (
                          <div key={level} className="strength-bar">
                            <motion.div
                              className="strength-bar-fill"
                              initial={{ width: 0 }}
                              animate={{ width: strength >= level ? "100%" : "0%" }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              style={{ backgroundColor: strength >= level ? strengthInfo.color : "transparent" }}
                            />
                          </div>
                        ))}
                      </div>
                      <motion.p
                        key={strengthInfo.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xs font-medium"
                        style={{ color: strengthInfo.textColor }}
                      >
                        {strengthInfo.label}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* confirm password */}
              <div>
                <label htmlFor="confirm_password" className="field-label">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`auth-input pr-11 ${errors.confirm_password ? "error" : ""}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700 transition-colors"
                  >
                    {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* live match feedback — switches between error and match indicator */}
                <AnimatePresence mode="wait">
                  {errors.confirm_password ? (
                    <FieldError key="error" message={errors.confirm_password} />
                  ) : confirmTouched ? (
                    <motion.p
                      key={passwordsMatch ? "match" : "mismatch"}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{    opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs mt-1.5 flex items-center gap-1 font-medium"
                      style={{ color: passwordsMatch ? "#1a4a47" : "#ef4444" }}
                    >
                      {passwordsMatch ? <CheckIcon /> : <ExclamIcon />}
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* submit */}
              <motion.button
                type="submit"
                disabled={loading || !isReady}
                whileHover={{ scale: loading || !isReady ? 1 : 1.01, y: loading || !isReady ? 0 : -1 }}
                whileTap={{ scale: loading || !isReady ? 1 : 0.98 }}
                className="btn-primary mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Creating account…
                  </span>
                ) : (
                  "Create account"
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

// ─── icons ────────────────────────────────────────────────────────────────────
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

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

export default Signup;
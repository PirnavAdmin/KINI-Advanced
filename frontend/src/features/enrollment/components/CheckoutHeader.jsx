import { motion } from "framer-motion";
import { FiArrowLeft, FiLock, FiShield, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@shared/context/ThemeContext";

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Complete" },
];

const BRAND = {
  primary: "#0F55F7",
  secondary: "#06B5A8",
};

const t = (dark) => ({
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  border: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  borderLight: dark ? "rgba(51,65,85,0.6)" : "rgba(0,0,0,0.1)",
  surface: dark ? "#0B1120" : "#FFFFFF",
  bgInactive: dark ? "rgba(30,41,59,0.6)" : "rgba(226,232,240,0.8)",
});

const CheckoutHeader = ({ currentStep = 1 }) => {
  const navigate = useNavigate();
  const { isDark } = useThemeContext();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Back + Breadcrumb row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm transition-colors group"
          style={{ color: t(isDark).textMuted }}
          onMouseEnter={(e) => e.currentTarget.style.color = t(isDark).text}
          onMouseLeave={(e) => e.currentTarget.style.color = t(isDark).textMuted}
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        <nav className="hidden sm:flex items-center gap-2 text-xs" style={{ color: t(isDark).textDim }}>
          <a href="/" className="transition-colors" style={{ color: t(isDark).textDim }}>Home</a>
          <span style={{ color: t(isDark).borderLight }}>/</span>
          <a href="/courses" className="transition-colors" style={{ color: t(isDark).textDim }}>Courses</a>
          <span style={{ color: t(isDark).borderLight }}>/</span>
          <span className="font-medium" style={{ color: BRAND.primary }}>Checkout</span>
        </nav>

        <div className="flex items-center gap-2 text-[11px]" style={{ color: t(isDark).textMuted }}>
          <FiLock className="w-3 h-3" style={{ color: BRAND.secondary }} />
          <span className="hidden sm:inline">256-bit Secure Payment</span>
          <span style={{ color: t(isDark).borderLight }}>·</span>
          <span className="font-medium" style={{ color: BRAND.primary }}>&lt;2 min</span>
        </div>
      </div>

      {/* Heading */}
      <div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          style={{ fontFamily: "'Sora', sans-serif", color: t(isDark).text }}
        >
          Secure Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
            }}
          >
            Enrollment
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: t(isDark).textSecondary }}>
          You're one step away from unlocking instant access to all course materials,
          live sessions, projects, and your learning dashboard.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mt-5">
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all duration-500`}
                    style={{
                      background: isCompleted
                        ? `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`
                        : isActive
                        ? t(isDark).surface
                        : t(isDark).bgInactive,
                      border: isActive ? `2px solid ${BRAND.primary}` : `1px solid ${t(isDark).borderLight}`,
                      color: isCompleted ? "#fff" : isActive ? BRAND.primary : t(isDark).textDim,
                      boxShadow: isActive ? `0 0 16px ${BRAND.primary}66` : "none",
                    }}
                  >
                    {isCompleted ? (
                      <FiCheckCircle className="w-4 h-4" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span
                    className="text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300"
                    style={{
                      color: isActive ? t(isDark).text : isCompleted ? "#06B5A8" : t(isDark).textDim,
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className="h-[2px] flex-1 mx-3 sm:mx-4 min-w-[24px] sm:min-w-[48px] rounded-full transition-all duration-500"
                    style={{
                      background: isCompleted
                        ? `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})`
                        : t(isDark).bgInactive,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex flex-wrap items-center gap-3"
      >
        {[
          { icon: FiLock, text: "256-bit SSL Secured" },
          { icon: FiShield, text: "PCI Compliant" },
          { icon: FiCheckCircle, text: "Verified by Kini Edutech" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              border: `1px solid ${t(isDark).border}`,
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            }}
          >
            <Icon className="w-3 h-3" style={{ color: BRAND.secondary }} />
            <span className="text-[11px] font-medium" style={{ color: t(isDark).textMuted }}>{text}</span>
          </div>
        ))}
      </motion.div>
    </motion.header>
  );
};

export default CheckoutHeader;

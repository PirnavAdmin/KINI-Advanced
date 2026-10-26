import { motion } from "framer-motion";
import { FiLock, FiArrowRight, FiShield, FiClock, FiAward, FiHeart, FiLoader, FiCheckCircle, FiZap } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";

const BRAND = {
  primary: "#0F55F7",
  secondary: "#06B5A8",
};

const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.95)",
  border: dark ? "rgba(255,255,255,0.1)" : "rgba(71,85,105,0.18)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.08)" : "rgba(71,85,105,0.14)",
  iconBg: dark ? "rgba(30,41,59,0.8)" : "rgba(226,232,240,0.8)",
  disabledBg: dark ? "rgba(30,41,59,0.8)" : "rgba(226,232,240,0.8)",
});

const OrderSummary = ({
  courseName = "Full Stack Web Development Bootcamp",
  courseTrainer = "Arjun Dev",
  courseThumbnail = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=100&auto=format&fit=crop",
  originalPrice = 2999,
  discountAmount = 2000,
  finalPrice = 999,
  couponDiscount = 0,
  isLoading,
  isDisabled,
  ctaLabel = "Enroll Now",
  footnote = "By enrolling you agree to our Terms of Service. Your payment is secured via PCI-DSS compliant gateway.",
  onSubmit,
  // [{ id, name, price }] — when more than one course is bought together, each
  // is listed with its price instead of the single-course preview.
  lines = [],
}) => {
  const { isDark } = useThemeContext();
  const theme = t(isDark);
  const format = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  const totalSavings = discountAmount + couponDiscount;
  const effectivePrice = finalPrice - couponDiscount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden shadow-xl transition-colors duration-300"
      style={{
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.card,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="p-5 sm:p-6"
        style={{ borderBottom: `1px solid ${theme.borderLight}` }}
      >
        <h3
          className="text-base sm:text-lg font-semibold flex items-center gap-2"
          style={{ fontFamily: "'Sora', sans-serif", color: theme.text }}
        >
          <FiZap className="w-4 h-4" style={{ color: BRAND.primary }} />
          Order Summary
        </h3>
      </div>

      {/* Course info */}
      <div className="p-5 sm:p-6 space-y-4">
        {lines.length > 1 ? (
          <ul className="space-y-2.5" aria-label="Courses in this payment">
            <li className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
              {lines.length} courses · one payment
            </li>
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium" style={{ color: theme.text }}>{line.name}</span>
                <span className="shrink-0 font-semibold tabular-nums" style={{ color: theme.text }}>₹{format(line.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
        <div className="flex gap-3">
          <div
            className="w-16 h-12 rounded-xl overflow-hidden shrink-0"
            style={{ backgroundColor: theme.iconBg }}
          >
            {courseThumbnail ? (
              <img
                src={courseThumbnail}
                alt={courseName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div aria-hidden="true" className="flex h-full w-full items-center justify-center font-bold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
                {String(courseName || "K").trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: theme.text }}>
              {courseName}
            </p>
            {courseTrainer && <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>by {courseTrainer}</p>}
          </div>
        </div>
        )}

        {/* Pricing lines */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: theme.textMuted }}>{lines.length > 1 ? "Subtotal" : "Original Price"}</span>
            <span className={lines.length > 1 ? "font-medium tabular-nums" : "line-through"} style={{ color: lines.length > 1 ? theme.text : theme.textDim }}>₹{format(originalPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: theme.textMuted }}>Discount</span>
            <span className="font-medium" style={{ color: BRAND.secondary }}>- ₹{format(discountAmount)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: theme.textMuted }}>Coupon Discount</span>
              <span className="font-medium" style={{ color: BRAND.secondary }}>- ₹{format(couponDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: theme.textMuted }}>Taxes</span>
            <span style={{ color: theme.textMuted }}>Included</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{
          background: `linear-gradient(90deg, transparent, ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}, transparent)`,
        }} />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold" style={{ color: theme.text }}>Total</span>
          <span className="text-2xl font-bold" style={{ color: theme.text }}>₹{format(effectivePrice)}</span>
        </div>

        {/* Savings badge */}
        {totalSavings > 0 && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              backgroundColor: `${BRAND.secondary}1A`,
              border: `1px solid ${BRAND.secondary}33`,
            }}
          >
            <FiCheckCircle className="w-4 h-4 shrink-0" style={{ color: BRAND.secondary }} />
            <span className="text-xs font-medium" style={{ color: BRAND.secondary }}>
              You saved ₹{format(totalSavings)}
            </span>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="px-5 sm:px-6 pb-2">
        <div className="space-y-2.5">
          {[
            { icon: FiShield, text: "30 Day Refund Policy" },
            { icon: FiClock, text: "Lifetime Access" },
            { icon: FiAward, text: "Certificate Included" },
            { icon: FiHeart, text: "Priority Support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND.primary }} />
              <span className="text-xs" style={{ color: theme.textMuted }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-5 sm:p-6 pt-4">
        <motion.button
          onClick={onSubmit}
          disabled={isDisabled || isLoading}
          whileHover={!isDisabled && !isLoading ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isDisabled && !isLoading ? { scale: 0.98 } : {}}
          className="relative w-full overflow-hidden rounded-2xl px-6 py-4 font-semibold text-base flex items-center justify-center gap-3 transition-all duration-300"
          style={{
            background: isDisabled || isLoading
              ? theme.disabledBg
              : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
            color: isDisabled || isLoading ? theme.textDim : "#fff",
            cursor: isDisabled || isLoading ? "not-allowed" : "pointer",
            boxShadow: isDisabled || isLoading ? "none" : `0 4px 24px ${BRAND.primary}40`,
          }}
        >
          {/* Shimmer */}
          {!isDisabled && !isLoading && (
            <motion.span
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
          )}

          {isLoading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FiLock className="w-4 h-4" />
              <span>{ctaLabel}</span>
              <span
                className="font-bold pl-3 ml-1"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.3)" }}
              >
                ₹{format(effectivePrice)}
              </span>
              <FiArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        <p className="mt-3 text-center text-[10px] leading-relaxed" style={{ color: theme.textDim }}>
          {footnote}
        </p>
      </div>
    </motion.div>
  );
};

export default OrderSummary;

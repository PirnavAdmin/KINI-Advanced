import { motion } from "framer-motion";
import { FiStar, FiUsers, FiClock, FiAward, FiCheckCircle, FiZap } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";

const BRAND = {
  primary: "#0F55F7",
  secondary: "#06B5A8",
  accent: "#0891B2",
};

const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  overlay: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
});

const CoursePreviewCard = ({ course }) => {
  const { isDark } = useThemeContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative group rounded-xl overflow-hidden shadow-md transition-colors duration-300"
      style={{
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(71,85,105,0.18)"}`,
        backgroundColor: t(isDark).card,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 5px 18px rgba(15,23,42,0.07)",
      }}
    >
      {/* Gradient border glow on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${BRAND.primary}33, ${BRAND.secondary}33)`,
        }}
      />

      <div className="flex flex-col sm:flex-row">
      {/* Thumbnail */}
      <div className="relative h-28 sm:h-auto sm:w-36 shrink-0 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-3xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
            {String(course.name || "K").trim().charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${isDark ? "#050816" : "#F1F5F9"} 0%, ${isDark ? "#050816" : "#F1F5F9"}60 60%, transparent 100%)`,
          }}
        />

        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 backdrop-blur-sm"
            style={{
              color: BRAND.secondary,
              backgroundColor: `${BRAND.secondary}15`,
              border: `1px solid ${BRAND.secondary}25`,
            }}
          >
            <FiZap className="w-3 h-3" />
            Bestseller
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold text-white rounded-full px-3 py-1.5 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
            }}
          >
            {course.originalPrice && course.price && course.originalPrice > course.price ? `${Math.round((1 - course.price / course.originalPrice) * 100)}% OFF` : "Course"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <h2
          className="text-lg sm:text-xl font-semibold leading-snug"
          style={{ fontFamily: "'Sora', sans-serif", color: t(isDark).text }}
        >
          {course.name}
        </h2>
        {course.trainer && <div className="flex items-center gap-2 mt-2">
          <span className="text-sm" style={{ color: t(isDark).textMuted }}>by</span>
          <span className="text-sm font-medium" style={{ color: t(isDark).textSecondary }}>{course.trainer}</span>
          <span
            className="flex items-center justify-center w-4 h-4 rounded-full"
            style={{ backgroundColor: `${BRAND.secondary}33` }}
          >
            <FiCheckCircle className="w-2.5 h-2.5" style={{ color: BRAND.secondary }} />
          </span>
        </div>}

        {/* Rating row */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(Number(course.rating || 0))
                      ? "text-amber-400 fill-amber-400"
                      : "text-amber-400 fill-amber-400/50"
                  }`}
                />
              ))}
            </div>
            {course.rating != null && <span className="text-sm font-semibold" style={{ color: t(isDark).text }}>{course.rating}</span>}
            {course.reviewCount != null && <span className="text-xs" style={{ color: t(isDark).textDim }}>({Number(course.reviewCount).toLocaleString()})</span>}
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: t(isDark).textMuted }}>
            <FiUsers className="w-3.5 h-3.5" />
            {course.students != null && <span>{Number(course.students).toLocaleString()}+ students</span>}
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {course.originalPrice && course.originalPrice > course.price && <span
            className="inline-flex items-center gap-1 text-[11px] rounded-full px-3 py-1.5"
            style={{
              color: t(isDark).textSecondary,
              border: `1px solid ${t(isDark).borderLight}`,
              backgroundColor: t(isDark).overlay,
            }}
          >
            <FiClock className="w-3 h-3" style={{ color: BRAND.primary }} />
            {course.duration}
          </span>}
          <span
            className="inline-flex items-center gap-1 text-[11px] rounded-full px-3 py-1.5"
            style={{
              color: t(isDark).textSecondary,
              border: `1px solid ${t(isDark).borderLight}`,
              backgroundColor: t(isDark).overlay,
            }}
          >
            <FiAward className="w-3 h-3" style={{ color: BRAND.secondary }} />
            Certificate Included
          </span>
          <span
            className="inline-flex items-center gap-1 text-[11px] rounded-full px-3 py-1.5"
            style={{
              color: t(isDark).textSecondary,
              border: `1px solid ${t(isDark).borderLight}`,
              backgroundColor: t(isDark).overlay,
            }}
          >
            <FiCheckCircle className="w-3 h-3" style={{ color: BRAND.accent }} />
            Lifetime Access
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: t(isDark).text }}>₹{Number(course.price || 0).toLocaleString("en-IN")}</span>
          {course.originalPrice && course.originalPrice > course.price && <span className="text-base line-through" style={{ color: t(isDark).textDim }}>₹{Number(course.originalPrice).toLocaleString("en-IN")}</span>}
          {course.originalPrice > course.price && <span
            className="text-xs font-semibold rounded-full px-2.5 py-1"
            style={{
              color: BRAND.secondary,
              backgroundColor: `${BRAND.secondary}1A`,
              border: `1px solid ${BRAND.secondary}33`,
            }}
          >
            Save ₹{Number(course.originalPrice - course.price).toLocaleString("en-IN")}
          </span>}
        </div>

        {/* Limited offer */}
        {course.originalPrice && course.originalPrice > course.price && <div
          className="mt-3 flex items-center gap-2 text-[11px] rounded-full px-3 py-1.5 w-fit"
          style={{
            color: "#F59E0B",
            backgroundColor: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Limited time offer — Price ends soon
        </div>}
      </div>
      </div>
    </motion.div>
  );
};

export default CoursePreviewCard;

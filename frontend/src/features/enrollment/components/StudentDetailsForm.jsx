import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiBookOpen, FiBriefcase, FiTag, FiLayers } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { QUALIFICATION_OPTIONS, EXPERIENCE_OPTIONS, INDIAN_STATES } from "@shared/data/mockData";
import { paymentApi } from "@shared/services/apiServices";
import LegalSection from "@shared/components/legal/LegalSection";
import { batchFieldName } from "../utils/enrollmentDraft";

const BRAND = {
  primary: "#0F55F7",
  secondary: "#06B5A8",
};

const t = (dark, brand) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  overlay: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
  inputBg: dark ? "rgba(11,17,32,0.5)" : "rgba(255,255,255,0.8)",
  inputBorder: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
});

const FieldIcon = ({ icon: Icon, isDark }) => {
  const theme = t(isDark);
  return (
    <div
      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
      style={{
        background: `linear-gradient(135deg, ${BRAND.primary}26, ${BRAND.secondary}26)`,
      }}
    >
      <Icon className="w-4 h-4" style={{ color: BRAND.primary }} />
    </div>
  );
};

const FloatingInput = ({ id, label, type = "text", icon: Icon, error, isDark, ...props }) => {
  const [focused, setFocused] = useState(false);
  const theme = t(isDark);

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 rounded-2xl border backdrop-blur-sm transition-all duration-300`}
        style={{
          backgroundColor: theme.inputBg,
          borderColor: focused
            ? `${BRAND.primary}80`
            : error
            ? "rgba(239,68,68,0.5)"
            : theme.inputBorder,
          boxShadow: focused
            ? `0 0 0 3px ${BRAND.primary}1A`
            : error
            ? "0 0 0 3px rgba(239,68,68,0.1)"
            : "none",
        }}
      >
        {Icon && (
          <div className="pl-4">
            <FieldIcon icon={Icon} isDark={isDark} />
          </div>
        )}
        {type === "select" ? (
          <select
            id={id}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full py-3 pr-4 ${Icon ? "pl-0" : "pl-4"} bg-transparent text-sm outline-none appearance-none cursor-pointer`}
            style={{ color: theme.text }}
            {...props}
          >
            <option value="" className="" style={{ backgroundColor: isDark ? "#0B1120" : "#fff", color: theme.textMuted }}>{label}</option>
            {props.options?.map((opt, index) => (
              <option key={opt} value={props.optionValues?.[index] ?? opt} style={{ backgroundColor: isDark ? "#0B1120" : "#fff", color: theme.text }}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onInput={(event) => {
              if (id === "phone") event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10);
            }}
            placeholder={label}
            className={`w-full py-3 pr-4 ${Icon ? "pl-0" : "pl-4"} bg-transparent text-sm outline-none`}
            style={{ color: theme.text }}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 font-medium px-1">{error}</p>
      )}
    </div>
  );
};

// Reads POST /api/v1/coupons/validate. The response schema is not published, so
// the common field spellings are accepted; the backend still applies the coupon
// itself when it receives couponCode on order creation.
const readCouponResult = (result, amount) => {
  const valid = result?.isValid ?? result?.valid ?? result?.success ?? result?.status === "valid";
  const finalAmount = Number(result?.finalAmount ?? result?.payableAmount ?? result?.amountAfterDiscount);
  const discount = Number(result?.discountAmount ?? result?.discount
    ?? (Number.isFinite(finalAmount) ? amount - finalAmount : NaN));
  if (!valid || !Number.isFinite(discount) || discount < 0) return null;
  return Math.min(discount, amount);
};

const CouponInput = ({ appliedCoupon, onApply, onRemove, isDark, amount, canValidate }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const theme = t(isDark);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    if (!canValidate) {
      setStatus("error");
      setMessage("Sign in as a student to apply a coupon");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const result = await paymentApi.validateCoupon({ couponCode: trimmed, amount });
      const discount = readCouponResult(result, amount);
      if (discount === null) throw new Error(result?.message || "Invalid or expired coupon code");
      const label = `₹${discount.toLocaleString("en-IN")} off`;
      setStatus("success");
      setMessage(`Coupon applied — ${label}`);
      onApply({ code: trimmed, type: "flat", value: discount, label });
    } catch (error) {
      setStatus("error");
      setMessage(error?.response?.data?.message || error?.message || "Invalid or expired coupon code");
    }
  };

  const handleRemove = () => {
    setCode("");
    setStatus("idle");
    setMessage("");
    onRemove();
  };

  const [message, setMessage] = useState("");

  return (
    <div
      className="rounded-2xl p-4 transition-colors duration-300"
      style={{
        border: `1px solid ${theme.borderLight}`,
        backgroundColor: theme.overlay,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <FiTag className="w-4 h-4" style={{ color: BRAND.primary }} />
        <h3 className="text-sm font-semibold" style={{ color: theme.text }}>Have a coupon?</h3>
      </div>

      {appliedCoupon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            border: `1px solid ${BRAND.secondary}4D`,
            backgroundColor: `${BRAND.secondary}1A`,
          }}
        >
          <p className="text-sm font-medium" style={{ color: BRAND.secondary }}>
            {appliedCoupon.code} — {appliedCoupon.label}
          </p>
          <button
            onClick={handleRemove}
            className="text-xs font-medium transition-colors"
            style={{ color: BRAND.secondary }}
            onMouseEnter={(e) => e.currentTarget.style.color = theme.text}
            onMouseLeave={(e) => e.currentTarget.style.color = BRAND.secondary}
          >
            Remove
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all uppercase"
              style={{
                backgroundColor: isDark ? "rgba(11,17,32,0.6)" : "rgba(255,255,255,0.8)",
                border: `1px solid ${theme.inputBorder}`,
                color: theme.text,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `${BRAND.primary}80`;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND.primary}33`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleApply}
              disabled={!code.trim()}
              className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                opacity: !code.trim() ? 0.5 : 1,
              }}
            >
              Apply
            </button>
          </div>
          {(message || status === "loading") && (
            <p
              role="status"
              className="mt-2 text-xs font-medium"
              style={{ color: status === "error" ? "#E11D48" : theme.textMuted }}
            >
              {status === "loading" ? "Checking coupon…" : message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

// `courseBatches` = [{ course: { id, name }, batches: [{ id, name, shift }] }] — one
// batch picker per purchased course, each validated against that course's own
// batches so a batch from another course can never be chosen.
const StudentDetailsForm = ({ register, errors, appliedCoupon, onApplyCoupon, onRemoveCoupon, courseBatches = [], batchesLoading = false, couponAmount, canValidateCoupon = false }) => {
  const { isDark } = useThemeContext();
  const theme = t(isDark);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-xl p-4 sm:p-5 shadow-md transition-colors duration-300"
      style={{
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(71,85,105,0.18)"}`,
        backgroundColor: theme.card,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 5px 18px rgba(15,23,42,0.07)",
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${BRAND.primary}33, ${BRAND.secondary}33)`,
            borderColor: `${BRAND.primary}33`,
          }}
        >
          <FiUser className="w-5 h-5" style={{ color: BRAND.primary }} />
        </div>
        <div>
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ fontFamily: "'Sora', sans-serif", color: theme.text }}
          >
            Student Information
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>We'll use this to set up your learning account</p>
        </div>
      </div>

      {/* Form grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FloatingInput
            id="firstName"
            label="First Name"
            icon={FiUser}
            isDark={isDark}
            {...register("firstName", {
              required: "First name is required",
              minLength: { value: 2, message: "Min 2 characters" },
            })}
            error={errors.firstName?.message}
          />
          <FloatingInput
            id="lastName"
            label="Last Name"
            icon={FiUser}
            isDark={isDark}
            {...register("lastName", {
              required: "Last name is required",
            })}
            error={errors.lastName?.message}
          />
          <FloatingInput
            id="email"
            label="Email Address"
            type="email"
            icon={FiMail}
            isDark={isDark}
            {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
            error={errors.email?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FloatingInput
            id="phone"
            label="Phone Number"
            type="tel"
            icon={FiPhone}
            isDark={isDark}
            inputMode="numeric"
            maxLength={10}
            {...register("phone", { required: "Phone is required", pattern: { value: /^[6-9]\d{9}$/, message: "Invalid 10-digit number" } })}
            error={errors.phone?.message}
          />
          <FloatingInput
            id="pincode"
            label="Pincode"
            type="text"
            icon={FiMapPin}
            isDark={isDark}
            {...register("pincode", { required: "Pincode is required", pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit pincode" } })}
            error={errors.pincode?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FloatingInput
            id="state"
            label="State"
            type="select"
            icon={FiGlobe}
            isDark={isDark}
            options={INDIAN_STATES}
            {...register("state", { required: "Select your state" })}
            error={errors.state?.message}
          />
          <FloatingInput
            id="qualification"
            label="Qualification"
            type="select"
            icon={FiBookOpen}
            isDark={isDark}
            options={QUALIFICATION_OPTIONS}
            {...register("qualification", { required: "Select qualification" })}
            error={errors.qualification?.message}
          />
          <FloatingInput
            id="experience"
            label="Experience"
            type="select"
            icon={FiBriefcase}
            isDark={isDark}
            options={EXPERIENCE_OPTIONS}
            {...register("experience", { required: "Select experience" })}
            error={errors.experience?.message}
          />
        </div>

        {courseBatches.map(({ course, batches }) => {
          const field = batchFieldName(course.id);
          const multiple = courseBatches.length > 1;
          // No open batch listed for this course: the organization assigns one
          // when it approves the enrollment, so the field is optional.
          const assignedOnApproval = !batchesLoading && !batches.length;
          return (
            <div key={field}>
              <FloatingInput
                id={field}
                label={batchesLoading
                  ? (multiple ? `${course.name} — loading batches...` : "Loading available batches...")
                  : assignedOnApproval
                    ? (multiple ? `${course.name}: batch assigned on approval` : "Batch assigned on approval")
                    : (multiple ? `Batch for ${course.name}` : "Select Available Batch")}
                type="select"
                icon={FiLayers}
                isDark={isDark}
                options={batches.map((batch) => `${batch.name}${batch.shift ? ` · ${batch.shift}` : ""}`)}
                optionValues={batches.map((batch) => String(batch.id))}
                {...register(field, {
                  validate: (value) => {
                    if (!batches.length) return true;
                    if (!value) return multiple ? `Select a batch for ${course.name}` : "Please select an available batch";
                    return batches.some((batch) => String(batch.id) === String(value)) || "Please select a valid batch";
                  },
                })}
                disabled={batchesLoading || assignedOnApproval}
                error={errors[field]?.message}
              />
              {assignedOnApproval && (
                <p className="mt-1.5 text-xs" style={{ color: theme.textMuted }}>
                  No open batch is listed for {multiple ? course.name : "this course"} yet. The organization will assign one when it approves your enrollment.
                </p>
              )}
            </div>
          );
        })}

        {/* Coupon */}
        <CouponInput
          appliedCoupon={appliedCoupon}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
          amount={couponAmount}
          canValidate={canValidateCoupon}
          isDark={isDark}
        />

        {/* Terms & Conditions + Privacy Policy */}
        <LegalSection register={register} errors={errors} />
      </div>
    </motion.div>
  );
};

export default StudentDetailsForm;

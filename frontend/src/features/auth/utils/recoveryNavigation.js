export const RECOVERY_STORAGE_KEYS = {
  identifier: "passwordResetEmail",
  otpType: "passwordResetOtpType",
  returnTo: "passwordResetReturnTo",
};

const LOGIN_ROUTES = new Set([
  "/login",
  "/mentor/login",
  "/employee/login",
  "/organization/login",
  "/super-admin/login",
]);

export const getSafeLoginRoute = (candidate) => {
  const route = String(candidate || "").trim();
  return LOGIN_ROUTES.has(route) ? route : "/login";
};

export const getRecoveryReturnTo = (candidate) => getSafeLoginRoute(
  candidate || sessionStorage.getItem(RECOVERY_STORAGE_KEYS.returnTo)
);

export const maskRecoveryIdentifier = (identifier) => {
  const value = String(identifier || "").trim();
  const [name, domain] = value.split("@");
  if (!domain) return value;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
};

// Ethiopian mobile numbers: 9 digits after +251, saved as 09XXXXXXXX.
const digitsOf = (value = "") => String(value).replace(/\D/g, "").replace(/^251/, "").replace(/^0/, "");

export const normalizePhone = (value) => {
  const digits = digitsOf(value);
  return /^[79]\d{8}$/.test(digits) ? `0${digits}` : null;
};

// Shows what the customer types as "912 345 678" next to the +251 prefix
export const formatPhoneInput = (value) => {
  const digits = digitsOf(value).slice(0, 9);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(" ");
};

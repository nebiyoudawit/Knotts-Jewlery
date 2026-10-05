// Ethiopian mobile numbers: 9 digits after +251, usually written 09XXXXXXXX.
// Older accounts were saved in mixed formats, so lookups compare the 9 significant digits.

export const phoneDigits = (value = '') =>
  String(value).replace(/\D/g, '').replace(/^251/, '').replace(/^0/, '');

// "+251 912 345 678", "0912345678" and "912345678" all become "0912345678"
export const normalizePhone = (value) => {
  const digits = phoneDigits(value);
  return /^[79]\d{8}$/.test(digits) ? `0${digits}` : null;
};

// Mongo filter that matches a stored phone whatever its spacing or prefix
export const phoneFilter = (value) => {
  const digits = phoneDigits(value);
  if (!/^\d{9}$/.test(digits)) return null;
  return { phone: { $regex: `${digits.split('').join('\\D*')}\\D*$` } };
};

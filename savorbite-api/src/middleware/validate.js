// Minimal validation helper. Each rule is { field, test, message } where test
// receives the parsed body. Returns middleware that answers 400 with the
// first failing message, or calls next().
export function validate(rules) {
  return (req, res, next) => {
    const source = req.body || {}
    for (const rule of rules) {
      const value = source[rule.field]
      const ok = rule.optional && (value === undefined || value === null || value === '')
        ? true
        : rule.test(value, source)
      if (!ok) {
        return res.status(400).json({ error: rule.message, field: rule.field })
      }
    }
    return next()
  }
}

export const rules = {
  required: (message) => ({ test: (v) => v !== undefined && v !== null && String(v).trim() !== '', message }),
  minLength: (n, message) => ({ test: (v) => String(v || '').trim().length >= n, message }),
  isEmail: (message) => ({ test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')), message }),
  isPhone: (message) => ({ test: (v) => /^(\+?234|0)[789]\d{9}$/.test(String(v || '').replace(/\s/g, '')), message }),
  isInt: (min, max, message) => ({
    test: (v) => Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max,
    message,
  }),
  inList: (allowed, message) => ({ test: (v) => allowed.includes(v), message }),
}

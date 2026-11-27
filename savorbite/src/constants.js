// SavorBite UI constants. Values can be overridden via Vite env without
// touching code. All amounts are in minutes unless noted.
export const ETA_MIN_MINUTES = Number(import.meta.env.VITE_ETA_MIN_MINUTES || 35)
export const ETA_MAX_MINUTES = Number(import.meta.env.VITE_ETA_MAX_MINUTES || 50)

// Naira formatter (kept in one place so the success page matches the cart).
export const formatNaira = (value) =>
  '₦' + Number(value || 0).toLocaleString('en-NG')

// Adds minutes to a Date and returns a new Date.
export const addMinutes = (date, minutes) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() + minutes)
  return d
}

// Formats a Date as a 12-hour clock time, e.g. "3:35 PM".
export const formatClockTime = (date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

export async function fetchFxRate(fromCur, toCur = "AED") {
  if (fromCur === toCur) return 1;
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCur}`);
    const data = await res.json();
    return data.rates?.[toCur] || null;
  } catch {
    return null;
  }
}
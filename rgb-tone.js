export function tonalTable(enabled, percentage) {
  const values = new Uint8Array(256);
  if (!enabled) return values;

  const strength = (percentage - 100) / 100;
  const curve = 6 * strength;
  const normalizer = 2 * Math.tanh(curve / 2);
  for (let i = 0; i < values.length; i++) {
    if (strength === 0) {
      values[i] = i;
      continue;
    }
    const centered = i / 255 - .5;
    // Match the desktop app: compress toward midtones or apply an S-curve.
    const adjusted = strength < 0
      ? .5 + centered * (1 + strength)
      : .5 + Math.tanh(curve * centered) / normalizer;
    values[i] = Math.round(255 * adjusted);
  }
  return values;
}

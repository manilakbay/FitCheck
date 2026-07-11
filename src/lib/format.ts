export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatKcal(value: number): string {
  return `${formatNumber(Math.round(value))} kcal`;
}

export function formatGrams(value: number): string {
  return `${formatNumber(Math.round(value))} g`;
}

export function formatKg(value: number, digits = 1): string {
  return `${formatNumber(value, digits)} kg`;
}

export function formatMinutes(value: number): string {
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`;
}

export interface MortgageInput {
  price: number;
  downPercent: number;
  ratePercent: number;
  years: number;
}

export interface MortgageResult {
  loan: number;
  down: number;
  monthly: number;
  totalInterest: number;
}

const MONTHS_PER_YEAR = 12;

/** Standard fixed-rate amortised mortgage payment (principal and interest). */
export function calcMortgage({ price, downPercent, ratePercent, years }: MortgageInput): MortgageResult {
  const down = Math.round(price * (downPercent / 100));
  const loan = Math.max(price - down, 0);
  const n = years * MONTHS_PER_YEAR;
  const r = ratePercent / 100 / MONTHS_PER_YEAR;
  if (loan === 0 || n === 0) return { loan, down, monthly: 0, totalInterest: 0 };
  const monthly = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  return { loan, down, monthly: Math.round(monthly), totalInterest: Math.round(monthly * n - loan) };
}

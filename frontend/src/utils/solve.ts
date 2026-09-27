/** Find x in [lo, hi] where f(x) = 0 using bisection. f must change sign over the bracket. */
export function bisect(
  f: (x: number) => number,
  lo: number,
  hi: number,
  tol = 1e-12,
  maxIter = 200,
): number | null {
  let flo = f(lo);
  const fhi = f(hi);
  if (Number.isNaN(flo) || Number.isNaN(fhi) || flo * fhi > 0) return null;
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < tol || (hi - lo) / 2 < tol) return mid;
    if (fm * flo < 0) hi = mid;
    else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}

/** Periodic internal rate of return for cash flows at equal intervals (t = 0, 1, 2 …). */
export function irr(cashflows: number[]): number | null {
  const npv = (r: number) => cashflows.reduce((acc, cf, t) => acc + cf / (1 + r) ** t, 0);
  return bisect(npv, -0.9999, 10);
}

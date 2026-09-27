/**
 * Versioned tax configuration. Calculators read rules from here instead of hard-coding
 * rates, so a new financial year is a new data file — no component changes required.
 */
export type RegimeId = 'new' | 'old';
export type AgeGroup = 'below60' | 'senior' | 'superSenior';

export interface Slab {
  /** Upper bound of the slab (inclusive); null means no upper bound. */
  upTo: number | null;
  ratePct: number;
}

export interface RegimeRules {
  label: string;
  slabs: Record<AgeGroup, Slab[]>;
  standardDeduction: number;
  rebate87A: { incomeLimit: number; maxRebate: number; marginalRelief: boolean };
  /** Highest surcharge rate allowed in this regime. */
  surchargeCapPct: number;
  allowsChapterVIA: boolean;
}

export interface SurchargeBand {
  above: number;
  ratePct: number;
}

export interface TdsSection {
  id: string;
  section: string;
  nature: string;
  ratePct: number;
  /** Rate for payees who are not individuals/HUF, when different. */
  companyRatePct?: number;
  threshold: number;
  basis: 'per-year' | 'per-transaction' | 'per-month';
  /** Tax applies only on the amount above the threshold. */
  onExcess?: boolean;
  noPanRatePct?: number;
}

export type GainRule =
  | { kind: 'flat'; ratePct: number; exemption?: number; indexationOptionPct?: number }
  | { kind: 'slab' };

export interface CapitalAssetRule {
  id: string;
  label: string;
  /** Long-term when held for more than this many months. */
  longTermAfterMonths: number;
  stcg: GainRule;
  ltcg: GainRule;
}

export interface TaxRuleSet {
  fy: string;
  ay: string;
  label: string;
  /** provisional = carried forward pending verification against notified law. */
  status: 'final' | 'provisional';
  note?: string;
  regimes: Record<RegimeId, RegimeRules>;
  defaultRegime: RegimeId;
  cessPct: number;
  surcharge: SurchargeBand[];
  deductionLimits: {
    sec80C: number;
    sec80CCD1B: number;
    sec80D: { self: number; selfSenior: number; parents: number; parentsSenior: number };
    sec24b: number;
    sec80TTA: number;
    sec80TTB: number;
  };
  hra: {
    metroPct: number;
    nonMetroPct: number;
    rentExcessOfSalaryPct: number;
    metroCities: string[];
  };
  epf: {
    employeePct: number;
    employerPct: number;
    epsPct: number;
    wageCeiling: number;
    edliPct: number;
    adminPct: number;
    interestPct: number;
  };
  esi: { employeePct: number; employerPct: number; wageCeiling: number };
  gratuity: { exemptionCap: number };
  leaveEncashment: { exemptionCap: number };
  tds: TdsSection[];
  capitalGains: { assets: CapitalAssetRule[]; costInflationIndex: Record<string, number> };
  gstRates: { ratePct: number; label: string }[];
}

import type { ToolGuide } from '@/types/tool';

/** In-depth guides, keyed by tool slug. Each guide is its own chunk, loaded only on its tool page. */
const guideLoaders: Record<string, () => Promise<{ default: ToolGuide }>> = {
  'age-calculator': () => import('./age-calculator'),
  'bmi-calculator': () => import('./bmi-calculator'),
  'capital-gains-calculator': () => import('./capital-gains-calculator'),
  'car-loan-emi-calculator': () => import('./car-loan-emi-calculator'),
  'cgpa-calculator': () => import('./cgpa-calculator'),
  'compound-interest-calculator': () => import('./compound-interest-calculator'),
  'ctc-to-in-hand-salary-calculator': () => import('./ctc-to-in-hand-salary-calculator'),
  'emi-calculator': () => import('./emi-calculator'),
  'epf-calculator': () => import('./epf-calculator'),
  'fd-calculator': () => import('./fd-calculator'),
  'gratuity-calculator': () => import('./gratuity-calculator'),
  'gst-calculator': () => import('./gst-calculator'),
  'home-loan-emi-calculator': () => import('./home-loan-emi-calculator'),
  'hra-tax-exemption-calculator': () => import('./hra-tax-exemption-calculator'),
  'income-tax-calculator': () => import('./income-tax-calculator'),
  'loan-prepayment-calculator': () => import('./loan-prepayment-calculator'),
  'percentage-calculator': () => import('./percentage-calculator'),
  'personal-loan-emi-calculator': () => import('./personal-loan-emi-calculator'),
  'ppf-calculator': () => import('./ppf-calculator'),
  'rd-calculator': () => import('./rd-calculator'),
  'salary-hike-calculator': () => import('./salary-hike-calculator'),
  'sip-calculator': () => import('./sip-calculator'),
};

export async function loadToolGuide(slug: string): Promise<ToolGuide | undefined> {
  const loader = guideLoaders[slug];
  return loader ? (await loader()).default : undefined;
}

export const GUIDE_SLUGS = Object.keys(guideLoaders);

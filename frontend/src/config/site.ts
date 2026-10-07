// Vite injects import.meta.env in the browser; build scripts (Node) fall back to process.env.
export const env: Record<string, string | undefined> =
  (import.meta as { env?: Record<string, string | undefined> }).env ??
  (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ??
  {};

export const SITE = {
  brand: 'BASERASTECH',
  product: 'India Tools',
  name: 'BASERASTECH India Tools',
  tagline: 'Free Online Calculators & Tools for India',
  url: env.VITE_SITE_URL?.replace(/\/$/, '') || 'https://baserastechtools.com',
  /** Public contact address shown on the Contact page; VITE_CONTACT_EMAIL overrides it. */
  contactEmail: env.VITE_CONTACT_EMAIL?.trim() || 'info@baserastech.com',
  /** Company website of the publisher. */
  companyUrl: 'https://www.baserastech.com',
  locale: 'en_IN',
  twitter: '@baserastech',
  launchDate: '2026-09-27',
} as const;

export const DISCLAIMERS = {
  finance:
    'Results are estimates for informational purposes only and should not be considered financial advice.',
  tax: 'Tax calculations are estimates for informational purposes only. Actual tax liability may vary based on applicable laws, deductions, exemptions and individual circumstances. They should not be considered professional tax advice.',
  health:
    'This calculator provides an estimate for informational purposes only and is not a substitute for professional medical advice.',
} as const;

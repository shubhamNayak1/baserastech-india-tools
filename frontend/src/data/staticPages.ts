import { DISCLAIMERS, SITE } from '@/config/site';

export interface StaticPageSection {
  heading?: string;
  paragraphs: string[];
  links?: { label: string; href: string }[];
}

export interface StaticPageContent {
  path: string;
  title: string;
  description: string;
  sections: StaticPageSection[];
}

const updated = 'Last updated: 27 September 2026.';

export type StaticPageKey = 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact';

export const STATIC_PAGES: Record<StaticPageKey, StaticPageContent> = {
  about: {
    path: '/about',
    title: `About ${SITE.name}`,
    description: `${SITE.name} offers free calculators and online tools built for India.`,
    sections: [
      {
        paragraphs: [
          `${SITE.name} is a free collection of online calculators, converters and generators built by ${SITE.brand} for people in India. Every tool gives an instant answer and explains how that answer was reached, with the formula, a worked example and answers to common questions.`,
          'Financial tools follow Indian conventions: rupee amounts in lakh and crore, bank-style EMI and deposit calculations, and tax rules versioned by financial year so they can be updated as laws change.',
          'Every tool is free to use, with no sign-up. Calculations happen entirely in your browser. The site is supported by advertising.',
        ],
      },
    ],
  },
  privacy: {
    path: '/privacy-policy',
    title: 'Privacy policy',
    description: `How ${SITE.name} handles your data, cookies and advertising.`,
    sections: [
      {
        paragraphs: [
          updated,
          `This policy explains what happens to information when you use ${SITE.name} (“the site”).`,
        ],
      },
      {
        heading: 'Your calculations stay on your device',
        paragraphs: [
          'All calculators, converters and developer tools run entirely in your web browser. What you type into a tool is not sent to our servers, and we do not store it. We do not operate user accounts, and we do not ask for your name, email address, phone number or any other personal information to use the tools.',
        ],
      },
      {
        heading: 'Information stored in your browser',
        paragraphs: [
          'To remember your favourite tools, recently used tools and recent searches, the site saves short lists of tool names in your browser’s local storage. This information never leaves your device. You can remove it at any time from the “Your tools” page or by clearing your browser’s site data.',
        ],
      },
      {
        heading: 'Advertising and cookies (Google AdSense)',
        paragraphs: [
          'The site is supported by advertising served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.',
          'Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet. You may opt out of personalised advertising by visiting Google Ads Settings, or opt out of some third-party vendors’ use of cookies for personalised advertising at aboutads.info.',
          'Where required by law, you will be asked for consent before personalised advertising cookies are used.',
        ],
        links: [
          { label: 'Google Ads Settings', href: 'https://adssettings.google.com' },
          {
            label: 'How Google uses information from sites that use its services',
            href: 'https://policies.google.com/technologies/partner-sites',
          },
          { label: 'aboutads.info opt-out', href: 'https://optout.aboutads.info' },
        ],
      },
      {
        heading: 'Analytics',
        paragraphs: [
          'If analytics is enabled, the site uses Google Analytics to understand which tools are used, through events such as “a tool was opened” or “a result was copied”. These events do not include what you type into tools. Google Analytics uses cookies and processes data under Google’s privacy policy. If your browser sends a Do Not Track or Global Privacy Control signal, analytics is not loaded.',
        ],
        links: [{ label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' }],
      },
      {
        heading: 'Server logs',
        paragraphs: [
          'Like any website, the servers that deliver these pages may keep standard technical logs (such as IP address, browser type and the page requested) for security and reliability. These logs are not used to identify you or to build profiles.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'The site is intended for a general audience and does not knowingly collect personal information from children.',
        ],
      },
      {
        heading: 'Changes and contact',
        paragraphs: [
          'We may update this policy from time to time; the date above shows the latest version. For questions, see the Contact page.',
        ],
      },
    ],
  },
  terms: {
    path: '/terms',
    title: 'Terms of use',
    description: `Terms of use for ${SITE.name}.`,
    sections: [
      {
        paragraphs: [
          updated,
          `All tools on ${SITE.name} are provided free of charge, “as is”, for general information. By using the site you agree to these terms.`,
          'We work hard to keep formulas accurate and up to date, but we make no warranty that results are complete, current or error-free, and we are not liable for decisions made using them. Please verify important figures with your bank, employer, tax professional or doctor.',
          'You may use the tools for personal and commercial purposes. You may not attempt to disrupt the site, scrape it in a way that degrades service, or misrepresent results as official advice from us.',
          'Links to third-party websites are provided for convenience; we are not responsible for their content.',
          'These terms are governed by the laws of India.',
        ],
      },
    ],
  },
  disclaimer: {
    path: '/disclaimer',
    title: 'Disclaimer',
    description: `Financial, tax and health disclaimers for ${SITE.name}.`,
    sections: [
      { heading: 'Financial calculators', paragraphs: [DISCLAIMERS.finance] },
      { heading: 'Tax calculators', paragraphs: [DISCLAIMERS.tax] },
      { heading: 'Health calculators', paragraphs: [DISCLAIMERS.health] },
      {
        heading: 'General',
        paragraphs: [
          'Results depend on the inputs you provide and on assumptions described on each tool page. Rates such as interest, EPF and PPF rates, tax slabs and GST rates change over time; check the latest official notifications.',
          'Advertisements shown on this site are provided by third parties. Their presence is not an endorsement of the products or services advertised.',
        ],
      },
    ],
  },
  contact: {
    path: '/contact',
    title: 'Contact',
    description: `How to contact ${SITE.brand} about ${SITE.name}.`,
    sections: [
      {
        paragraphs: [
          'We welcome reports of calculation errors, suggestions for new tools and feedback on the site.',
          SITE.contactEmail
            ? `Email: ${SITE.contactEmail}`
            : `You can reach ${SITE.brand} through the contact details published on the company website.`,
          'When reporting a calculation issue, please mention the tool name and the inputs you used. There is no need to send any personal or financial documents.',
        ],
      },
    ],
  },
};

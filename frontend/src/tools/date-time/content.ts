import type { ContentMap } from '../define';

const tsFaq = [
  {
    q: 'What is a Unix timestamp?',
    a: 'The number of seconds since 00:00:00 UTC on 1 January 1970 (the Unix epoch), ignoring leap seconds. It is the same everywhere in the world at a given moment.',
  },
  {
    q: 'Seconds or milliseconds?',
    a: 'Unix tools and most APIs use seconds (10 digits today). JavaScript and Java use milliseconds (13 digits). The converter detects the unit from the number of digits.',
  },
];

const content: ContentMap = {
  'age-calculator': {
    description:
      'Calculate your exact age in years, months and days from your date of birth, plus total days lived and the countdown to your next birthday.',
    whatIs:
      'An age calculator finds the time elapsed between a date of birth and another date, usually today. It is handy for forms, eligibility checks and exam age limits that specify age “as on” a date.',
    howItWorks:
      'The calculator counts whole months from the birth date (handling month ends: 31 January + 1 month = 28/29 February) and then the remaining days. Totals in weeks and days use the exact number of calendar days.',
    formula: 'Age = whole years + whole months + remaining days between DOB and the “as on” date',
    example:
      'Born on 15 August 1995, on 27 September 2026 you are 31 years, 1 month and 12 days old.',
    howToUse: [
      'Enter your date of birth.',
      'Change “Age on” if you need age as on a specific date, for example an exam cut-off.',
      'Read your age and next birthday.',
    ],
    faq: [
      {
        q: 'How is age calculated for people born on 29 February?',
        a: 'In non-leap years, the birthday is taken as 28 February, so a year is completed on that date.',
      },
      {
        q: 'How do I calculate age as on a particular date for an exam form?',
        a: 'Set the “Age on” field to the cut-off date given in the notification.',
      },
    ],
  },
  'date-difference-calculator': {
    description:
      'Calculate the exact difference between two dates in years, months and days, and in total days, weeks, months and hours.',
    whatIs:
      'A date difference tells you how much time separates two calendar dates — useful for tenures, notice periods, project timelines and anniversaries.',
    howItWorks:
      'Whole months are counted first (respecting different month lengths), then remaining days. Totals are derived from the exact day count. Optionally include the end date to count both ends.',
    formula: 'Total days = End − Start (+1 if the end date is included)',
    example: 'From 1 January 2026 to 15 March 2026 is 2 months and 14 days, or 73 days.',
    faq: [
      {
        q: 'Should I include the end date?',
        a: 'Include it when both days count, such as leave from Monday to Friday (5 days). Leave it out for elapsed time, such as age.',
      },
    ],
  },
  'days-between-dates': {
    description: 'Count the days between two dates, including how many are weekdays and weekends.',
    whatIs: 'This tool gives the exact number of days separating two dates.',
    howItWorks:
      'Dates are compared at midnight UTC to avoid daylight-saving errors. Weekdays and weekend days are counted day by day.',
    formula: 'Days = (End − Start) ÷ 86,400,000 ms',
    example:
      'There are 365 days between 1 January 2026 and 1 January 2027, of which 261 are weekdays.',
    faq: [
      {
        q: 'Why might this differ by one from another calculator?',
        a: 'Some tools include both the start and end date. Toggle “Include the end date” to match.',
      },
    ],
  },
  'add-days-calculator': {
    description:
      'Add any number of days, weeks, months or years to a date to find the future date and weekday.',
    whatIs:
      'Useful for due dates, validity periods, return windows and follow-ups — “what date is 90 days from today?”.',
    howItWorks:
      'Days and weeks are added exactly. Months and years keep the same day of month where possible, falling back to the month’s last day (31 January + 1 month = 28 February).',
    formula: 'Result = Start + N days',
    example: '90 days after 27 September 2026 is Saturday, 26 December 2026.',
    faq: [
      {
        q: 'Does adding 1 month always add 30 days?',
        a: 'No. It moves to the same date next month, which can be 28 to 31 days later.',
      },
    ],
  },
  'subtract-days-calculator': {
    description: 'Subtract days, weeks, months or years from a date to find an earlier date.',
    whatIs:
      'Useful for finding dates in the past — when a 45-day period started, or the date 6 months before a deadline.',
    howItWorks:
      'The calculator moves backwards by the chosen amount, handling month lengths and leap years.',
    formula: 'Result = Start − N days',
    example: '45 days before 1 December 2026 is 17 October 2026.',
    faq: [
      {
        q: 'Are leap years handled?',
        a: 'Yes. All calculations use the real calendar, including 29 February in leap years.',
      },
    ],
  },
  'working-days-calculator': {
    description:
      'Count the working days between two dates, excluding weekly offs (including the Indian bank 2nd/4th Saturday rule) and any holidays you list.',
    whatIs:
      'Working days exclude weekends and public holidays. They are used for payroll, SLAs, leave and project planning.',
    howItWorks:
      'Every date in the range (both ends included) is checked against your weekly-off rule and holiday list.',
    formula: 'Working days = Total days − Weekly offs − Holidays on working days',
    example:
      'September 2026 has 22 Monday–Friday working days, or 24 working days with the 2nd and 4th Saturday rule.',
    faq: [
      {
        q: 'How do I add holidays?',
        a: 'Paste dates in YYYY-MM-DD format, separated by commas or new lines — for example your state’s gazetted holidays.',
      },
    ],
  },
  'business-days-calculator': {
    description:
      'Find the date that is a given number of business days after (or before) a start date, skipping weekends and holidays.',
    whatIs:
      'Delivery promises, payment terms and statutory deadlines are often stated in business days.',
    howItWorks:
      'Starting from the day after the start date, the calculator steps day by day and counts only working days until the number is reached.',
    formula: 'Result = the Nth working day after the start date',
    example:
      '10 business days after Friday 25 September 2026 is Friday 9 October 2026 (with 2 October as a holiday, it becomes Monday 12 October).',
    faq: [
      {
        q: 'Is the start date counted?',
        a: 'No, counting starts from the next working day, which is the usual convention.',
      },
    ],
  },
  'leap-year-checker': {
    description:
      'Check whether any year is a leap year, with the reason and the next and previous leap years.',
    whatIs:
      'A leap year has 366 days, with 29 February added to keep the calendar aligned with the solar year.',
    howItWorks:
      'Gregorian rule: a year is a leap year if it is divisible by 4, except years divisible by 100, unless also divisible by 400.',
    formula: 'Leap ⇔ (year mod 4 = 0 and year mod 100 ≠ 0) or year mod 400 = 0',
    example:
      '2028 is a leap year. 1900 was not (divisible by 100 but not 400). 2000 was (divisible by 400).',
    faq: [
      {
        q: 'Why do we need leap years?',
        a: 'A solar year is about 365.2422 days. Adding a day every four years, with century exceptions, keeps seasons aligned with dates.',
      },
    ],
  },
  'week-number-calculator': {
    description:
      'Find the ISO 8601 week number for any date, the week’s Monday–Sunday range, day of the year and quarter.',
    whatIs:
      'ISO week numbers are used in business planning and software. Week 1 is the week containing the first Thursday of the year.',
    howItWorks:
      'The date is shifted to the Thursday of its week, and the week number is counted from the start of that Thursday’s year.',
    formula: 'Week = ⌈(day-of-year of that week’s Thursday) ÷ 7⌉',
    example:
      '1 January 2021 was in ISO week 53 of 2020, because that week’s Thursday fell in 2020.',
    faq: [
      {
        q: 'What is the Indian financial-year quarter?',
        a: 'The financial year runs April–March, so Q1 is April–June and Q4 is January–March.',
      },
    ],
  },
  'countdown-calculator': {
    description:
      'A live countdown to any date and time — a birthday, festival, trip, launch or deadline — in days, hours, minutes and seconds.',
    whatIs: 'A countdown shows the time remaining until an event and updates every second.',
    howItWorks:
      'The target is interpreted in your device’s time zone and compared with the current time each second. The link includes your event so you can share it.',
    formula: 'Remaining = Target time − Current time',
    example: 'Set “Diwali” with its date to share a live countdown with family.',
    faq: [
      {
        q: 'Does the countdown keep running if I close the page?',
        a: 'The target is saved in the link. Open the link again and the countdown continues from the current time.',
      },
    ],
  },
  'time-duration-calculator': {
    description:
      'Calculate the duration between two clock times, subtract breaks and get decimal hours for timesheets.',
    whatIs: 'Time duration is the elapsed time between a start and end time on the clock.',
    howItWorks:
      'Times are converted to seconds since midnight. If the end time is earlier than the start, or you mark it as next day, 24 hours are added. Breaks are then subtracted.',
    formula: 'Duration = End − Start (+24h if overnight) − Break',
    example: '9:30 AM to 6:15 PM with a 45-minute break is 8 hours, or 8.00 decimal hours.',
    faq: [
      {
        q: 'What are decimal hours?',
        a: 'Hours written as a decimal: 7 hours 30 minutes is 7.5 hours. Many payroll systems use them.',
      },
    ],
  },
  'time-zone-converter': {
    description:
      'Convert a date and time between Indian Standard Time and major world time zones, with daylight saving time handled automatically.',
    whatIs:
      'Time zones are regional offsets from UTC. India uses IST (UTC+5:30) all year, while the US, UK, Europe and Australia shift their clocks for daylight saving.',
    howItWorks:
      'Your wall-clock time is converted to an exact instant using the source zone’s rules for that date, then formatted in the target zone using your browser’s time-zone database.',
    formula: 'Target time = Source time − Source offset + Target offset',
    example:
      '10:00 AM IST on 27 September 2026 is 12:30 AM in New York (EDT, UTC−4) and 5:30 AM in London (BST).',
    faq: [
      {
        q: 'Why does the difference between IST and New York change?',
        a: 'New York moves between EST (UTC−5) and EDT (UTC−4), so the gap with IST is 10:30 in winter and 9:30 in summer.',
      },
      { q: 'Does India have daylight saving time?', a: 'No, IST is UTC+5:30 throughout the year.' },
    ],
  },
  'unix-timestamp-converter': {
    description:
      'Convert Unix epoch timestamps to human-readable dates in IST, UTC and your local zone, and convert dates back to timestamps.',
    whatIs:
      'Unix time is how computers commonly store moments in time — a single number of seconds since 1 January 1970 UTC.',
    howItWorks:
      'Timestamps are read as seconds, milliseconds or microseconds depending on their length and formatted with the Intl API. Dates are converted using the chosen time zone’s offset for that date.',
    formula: 'Date = Epoch (1970-01-01T00:00:00Z) + timestamp seconds',
    example: '1700000000 is 14 November 2023, 22:13:20 UTC (15 November, 03:43:20 IST).',
    faq: tsFaq,
  },
  'unix-timestamp-to-date': {
    description:
      'Paste a Unix timestamp to see the exact date and time in IST, UTC, your local zone and ISO 8601.',
    whatIs:
      'Converting epoch timestamps to dates is common when reading logs, databases and API responses.',
    howItWorks:
      'The unit is detected from the digit count and the value is formatted in several time zones, with a relative description like “3 days ago”.',
    formula: 'Date = new Date(timestamp × 1000)',
    example: '1767225600 is 1 January 2026, 00:00:00 UTC — 5:30 AM IST.',
    faq: tsFaq,
  },
  'date-to-unix-timestamp': {
    description:
      'Convert a calendar date and time in any time zone to a Unix timestamp in seconds and milliseconds.',
    whatIs:
      'Useful when writing queries, setting token expiries or scheduling jobs that expect epoch time.',
    howItWorks:
      'The wall-clock time is resolved to an exact instant using the chosen zone’s offset (including DST), then expressed as seconds since the epoch.',
    formula: 'Timestamp = (UTC time − 1970-01-01T00:00Z) ÷ 1000',
    example: 'Midnight IST on 1 January 2026 is 1767205800.',
    faq: tsFaq,
  },
};

export default content;

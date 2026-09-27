import type { ContentMap } from '../define';

const content: ContentMap = {
  'tip-calculator': {
    description:
      'Work out a fair tip and how much each person pays, with a quick table of common tip percentages.',
    whatIs:
      'Tipping 5–10% for good service is common in Indian restaurants, though it is optional — especially if a service charge is already added.',
    howItWorks:
      'Tip = bill × tip%. The total is divided by the number of people, optionally rounded up to whole rupees.',
    formula: 'Per person = Bill × (1 + Tip%) ÷ People',
    example: 'A ₹2,400 bill with a 10% tip for 4 people: tip ₹240, total ₹2,640, ₹660 each.',
    faq: [
      {
        q: 'Is service charge mandatory in India?',
        a: 'No. Consumer authority guidelines say restaurants cannot add a service charge by default; it is voluntary.',
      },
    ],
  },
  'split-bill-calculator': {
    description:
      'Split a group bill fairly — equally, or in proportion to what each person ordered — with GST, service charge and tip shared correctly.',
    whatIs:
      'When friends order different amounts, splitting equally is not always fair. Proportional splitting shares taxes and tips according to each person’s order.',
    howItWorks:
      'GST and any service charge are applied to the subtotal and the tip is added. Each person’s share is their order ÷ subtotal × grand total.',
    formula: 'Share = Own order ÷ Subtotal × (Subtotal + GST + Service + Tip)',
    example:
      'Orders of ₹600 and ₹400 with 10% extra and ₹100 tip (total ₹1,200) split as ₹720 and ₹480.',
    faq: [
      {
        q: 'What GST do restaurants charge?',
        a: 'Most standalone restaurants charge 5% GST without input tax credit; restaurants in hotels with room tariffs above ₹7,500 charge 18%.',
      },
    ],
  },
  'fuel-cost-calculator': {
    description:
      'Calculate the fuel cost of a road trip from distance, your vehicle’s mileage and the fuel price, and split it among passengers.',
    whatIs:
      'Fuel is usually the biggest cost of a road trip. Knowing it in advance helps with budgeting and cost sharing.',
    howItWorks:
      'Fuel needed = distance ÷ mileage; cost = fuel needed × price per litre. Round trips double the distance.',
    formula: 'Cost = Distance ÷ Mileage × Price per litre',
    example:
      'A 300 km trip each way at 15 km/L with petrol at ₹105 needs 40 litres and costs ₹4,200 — ₹1,400 each for 3 people.',
    faq: [
      {
        q: 'Why is my real cost higher?',
        a: 'City traffic, AC use, speed and load reduce mileage. Use your vehicle’s real-world mileage for better estimates.',
      },
    ],
  },
  'fuel-mileage-calculator': {
    description:
      'Calculate your vehicle’s actual mileage in km/L and L/100 km, and its running cost per kilometre.',
    whatIs: 'Mileage (fuel efficiency) shows how far your vehicle travels on one litre of fuel.',
    howItWorks:
      'Use the tank-to-tank method: fill up completely, note the odometer, drive, fill up completely again and note the litres added. Mileage = distance ÷ litres.',
    formula: 'Mileage (km/L) = Distance ÷ Fuel used',
    example:
      'Driving 450 km and refilling 30 litres gives 15 km/L; at ₹100/L that is ₹6.67 per km.',
    faq: [
      {
        q: 'Why does the trip computer show different mileage?',
        a: 'On-board computers estimate from injector data and are often a little optimistic. Tank-to-tank is more accurate.',
      },
    ],
  },
  'electricity-cost-calculator': {
    description:
      'Estimate how many electricity units an appliance uses and what it adds to your bill.',
    whatIs:
      'Electricity is billed in units, where 1 unit = 1 kilowatt-hour (kWh): a 1,000-watt appliance running for one hour.',
    howItWorks:
      'Units = watts × quantity × hours per day × days ÷ 1,000. Cost = units × your tariff per unit.',
    formula: 'Units (kWh) = W × hours ÷ 1000\nCost = Units × Rate',
    example:
      'A 1.5-ton AC (≈1,500 W) for 8 hours a day for 30 days uses about 360 units — ₹2,520 at ₹7 per unit.',
    faq: [
      {
        q: 'Why is my actual bill different?',
        a: 'Tariffs are slab-based, include fixed charges and duties, and inverter ACs and fridges cycle on and off, using less than their rated power.',
      },
    ],
  },
  'cooking-unit-converter': {
    description:
      'Convert recipe measurements between cups, katori, tablespoons, teaspoons, millilitres and grams for common Indian ingredients.',
    whatIs:
      'Recipes mix volume (cups, spoons) and weight (grams). Converting between them needs the ingredient’s density — a cup of atta weighs much less than a cup of sugar.',
    howItWorks:
      'Volume is converted to millilitres, multiplied by the ingredient’s approximate density (g/ml) to get grams, and then converted to the target unit.',
    formula: 'Grams = Volume (ml) × Density (g/ml)',
    example: '2 metric cups of atta ≈ 255 g. 1 US cup of sugar ≈ 200 g.',
    faq: [
      {
        q: 'How big is a katori?',
        a: 'Katoris vary; about 150 ml is a common size. For precise baking, weigh ingredients.',
      },
    ],
  },
  'random-picker': {
    description:
      'Pick one or more random names or options from your list for lucky draws, deciding turns or giveaways.',
    whatIs: 'A fair random picker gives every option an equal chance of being selected.',
    howItWorks:
      'The list is shuffled with the Fisher–Yates algorithm using your browser’s cryptographically secure random numbers, and the first N are picked.',
    example: 'Pick 2 winners from 6 participants for a giveaway.',
    faq: [
      {
        q: 'Can the same name be picked twice?',
        a: 'No, each entry can be picked at most once per draw. Add a name twice if it should have double chances.',
      },
    ],
  },
  'date-calculator': {
    description:
      'An all-in-one date calculator: find the time between two dates, or add and subtract days, weeks, months and years.',
    whatIs: 'Date calculations come up for deadlines, subscriptions, EMIs, travel and events.',
    howItWorks:
      'Differences use calendar-aware year/month/day arithmetic. Adding months keeps the same day where possible, falling back to the month’s last day.',
    example:
      'From today, 180 days later is roughly 6 months ahead; 90 days back finds a start date for a 90-day period.',
    faq: [
      {
        q: 'Is the end date included?',
        a: 'Differences count elapsed days, so the end date is not included. Add one day if you need both ends counted.',
      },
    ],
  },
  'sleep-calculator': {
    description:
      'Find the best bedtimes for your wake-up time so you wake at the end of a 90-minute sleep cycle.',
    whatIs:
      'Sleep runs in cycles of about 90 minutes. Waking in the middle of deep sleep leaves you groggy, while waking between cycles feels easier.',
    howItWorks:
      'The calculator counts back 6, 5, 4 or 3 cycles plus the time you usually take to fall asleep.',
    formula: 'Bedtime = Wake time − (cycles × 90 min) − time to fall asleep',
    example: 'To wake at 6:30 AM, aim to sleep at 9:15 PM (6 cycles) or 10:45 PM (5 cycles).',
    faq: [
      {
        q: 'How much sleep do I need?',
        a: 'Most adults need 7–9 hours; teenagers 8–10. Individual needs vary.',
      },
    ],
  },
  'wake-up-time-calculator': {
    description: 'Find the best times to set your alarm based on when you go to bed.',
    whatIs: 'Setting your alarm for the end of a sleep cycle can make waking up easier.',
    howItWorks:
      'The calculator adds 3–6 sleep cycles of about 90 minutes to your bedtime, plus the time you usually take to fall asleep.',
    formula: 'Wake time = Bedtime + time to fall asleep + (cycles × 90 min)',
    example:
      'Going to bed at 11:00 PM, good wake-up times are 8:15 AM (6 cycles) or 6:45 AM (5 cycles).',
    faq: [
      {
        q: 'Is the 90-minute cycle exact?',
        a: 'No, cycles range from about 80 to 110 minutes and vary through the night, so treat the times as a guide.',
      },
    ],
  },
};

export default content;

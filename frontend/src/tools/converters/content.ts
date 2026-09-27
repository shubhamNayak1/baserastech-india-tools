import type { ContentMap } from '../define';

const how = (base: string) =>
  `Every unit is defined by an exact factor relative to the ${base}. The value is converted to the ${base} and then to the target unit, so any pair of units can be converted consistently. Results are shown with up to 10 significant digits.`;

const content: ContentMap = {
  'length-converter': {
    description:
      'Convert length and distance between metric, imperial and US units — mm, cm, m, km, inches, feet, yards, miles, nautical miles and more.',
    whatIs:
      'Length measures how long something is. India uses metric units officially, but feet and inches remain common for height, property and construction.',
    howItWorks: how('metre'),
    formula: '1 in = 2.54 cm (exact)\n1 ft = 0.3048 m\n1 mi = 1.609344 km',
    example: '10 feet = 3.048 metres. 5 km = 3.10686 miles.',
    faq: [
      {
        q: 'How many centimetres are in a foot?',
        a: 'Exactly 30.48 cm, because 1 inch is defined as 2.54 cm and a foot has 12 inches.',
      },
    ],
  },
  'weight-converter': {
    description:
      'Convert weight between kilograms, grams, pounds, ounces, stones, tonnes, quintals and traditional Indian units like tola, seer and maund.',
    whatIs:
      'Weight (strictly, mass) is measured in kilograms in the metric system. Pounds and ounces are used in the US and UK, and tola remains common for gold in India.',
    howItWorks: how('kilogram'),
    formula: '1 lb = 0.45359237 kg (exact)\n1 tola = 11.6638 g\n1 quintal = 100 kg',
    example: '70 kg = 154.32 lb. 10 grams of gold = 0.857 tola.',
    faq: [
      {
        q: 'How many grams are in a tola?',
        a: 'One tola is 11.6638 grams. Jewellers sometimes round a tola to 10 grams for gold pricing, so check which definition is being used.',
      },
    ],
  },
  'height-converter': {
    description: 'Convert your height from feet and inches to centimetres and back.',
    whatIs:
      'Height is often given in feet and inches in India while forms and medical records use centimetres.',
    howItWorks:
      'Total inches = feet × 12 + inches, and 1 inch is exactly 2.54 cm. For the reverse, centimetres are divided by 2.54 and split into feet and inches.',
    formula: 'cm = (feet × 12 + inches) × 2.54',
    example: '5 feet 7 inches = 67 inches = 170.2 cm. 180 cm = 5 feet 10.9 inches.',
    faq: [{ q: 'What is 5 feet 5 inches in cm?', a: '65 inches × 2.54 = 165.1 cm.' }],
  },
  'temperature-converter': {
    description: 'Convert temperatures between Celsius, Fahrenheit, Kelvin and Rankine.',
    whatIs:
      'Celsius is used in India for weather and body temperature; Fahrenheit is common on thermometers and in the US; Kelvin is the scientific absolute scale.',
    howItWorks:
      'Temperature scales have different zero points, so conversion uses offsets as well as factors, going through Celsius.',
    formula: '°F = °C × 9/5 + 32\nK = °C + 273.15',
    example: '37 °C (normal body temperature) = 98.6 °F. 100 °F = 37.78 °C.',
    faq: [
      {
        q: 'Is 100 °F a fever?',
        a: '100 °F is 37.8 °C. A temperature of 100.4 °F (38 °C) or above is generally considered a fever. Consult a doctor for medical advice.',
      },
    ],
  },
  'area-converter': {
    description:
      'Convert land and floor area between square feet, square metres, square yards (gaj), acres, hectares and Indian units such as bigha, guntha, cent, ground, marla and kanal.',
    whatIs:
      'Area measures a surface. Property in India is quoted in many units — carpet area in sq ft, plots in gaj or guntha, and farmland in acres or bigha.',
    howItWorks: `${how('square metre')} Traditional land units are defined in square feet using their most common official values.`,
    formula:
      '1 acre = 43,560 sq ft = 40 guntha = 100 cent\n1 sq yd (gaj) = 9 sq ft\n1 hectare = 2.471 acres',
    example: '1 acre = 4,046.86 m² = 4,840 sq yd. 1 guntha = 1,089 sq ft.',
    faq: [
      {
        q: 'How big is a bigha?',
        a: 'It depends on the state: about 14,400 sq ft in West Bengal and Assam, 17,424 sq ft in Gujarat and 27,225 sq ft (pucca bigha) in Rajasthan. Always confirm the local definition.',
      },
      { q: 'How many square feet in a gaj?', a: 'One gaj (square yard) is 9 square feet.' },
    ],
  },
  'volume-converter': {
    description:
      'Convert volume and capacity between litres, millilitres, cubic metres, US and UK gallons, cups, pints and more.',
    whatIs:
      'Volume measures the space a liquid or object occupies. US and UK gallons differ, which matters when comparing fuel or recipes.',
    howItWorks: how('litre'),
    formula: '1 US gallon = 3.785 L\n1 UK gallon = 4.546 L\n1 m³ = 1,000 L',
    example: '10 litres = 2.64 US gallons = 2.2 UK gallons.',
    faq: [
      {
        q: 'Is a litre the same as a kilogram?',
        a: 'Only for water at about 4 °C. Other liquids have different densities.',
      },
    ],
  },
  'speed-converter': {
    description: 'Convert speed between km/h, mph, metres per second, knots and Mach.',
    whatIs:
      'Speed is distance per unit of time. Indian road signs use km/h, while aviation and shipping use knots.',
    howItWorks: how('metre per second'),
    formula: '1 km/h = 0.2778 m/s\n1 mph = 1.609344 km/h\n1 knot = 1.852 km/h',
    example: '100 km/h = 62.14 mph = 27.78 m/s.',
    faq: [
      {
        q: 'What is Mach 1?',
        a: 'The speed of sound, about 1,225 km/h at sea level and 15 °C. It varies with temperature and altitude.',
      },
    ],
  },
  'time-converter': {
    description:
      'Convert between nanoseconds, milliseconds, seconds, minutes, hours, days, weeks, months, years and centuries.',
    whatIs:
      'Time can be expressed in many units, from nanoseconds in computing to decades and centuries in history. This converter switches between any of them.',
    howItWorks: `${how('second')} Months and years use Gregorian averages (30.44 and 365.2425 days).`,
    formula: '1 hour = 3,600 s\n1 day = 86,400 s',
    example: '2.5 hours = 150 minutes = 9,000 seconds.',
    faq: [
      {
        q: 'Why is a month 30.44 days?',
        a: 'It is the average Gregorian month: 365.2425 days ÷ 12.',
      },
    ],
  },
  'data-storage-converter': {
    description:
      'Convert digital storage and data sizes between bits, bytes, kilobytes, megabytes, gigabytes, terabytes and binary units (KiB, MiB, GiB).',
    whatIs:
      'Data size is measured in bytes (8 bits). There are two conventions: decimal (1 KB = 1,000 bytes) and binary (1 KiB = 1,024 bytes).',
    howItWorks: how('byte'),
    formula: '1 GB = 1,000 MB\n1 GiB = 1,024 MiB\n1 byte = 8 bits',
    example: 'A “1 TB” hard disk is 10¹² bytes, which Windows shows as about 931 GB (GiB).',
    faq: [
      {
        q: 'Why does my 100 Mbps connection download at 12.5 MB/s?',
        a: 'Internet speeds are in megabits per second; downloads are shown in megabytes. 100 Mbit ÷ 8 = 12.5 MB.',
      },
    ],
  },
  'energy-converter': {
    description:
      'Convert energy between joules, kilojoules, calories, kilocalories, watt-hours, kWh (electricity units), BTU and electronvolts.',
    whatIs:
      'Energy is measured in joules. Food energy uses kilocalories, and electricity bills use kilowatt-hours, called “units” in India.',
    howItWorks: how('joule'),
    formula: '1 kcal = 4.184 kJ\n1 kWh = 3.6 MJ',
    example: '500 kcal = 2,092 kJ. 1 electricity unit (kWh) = 860 kcal.',
    faq: [
      {
        q: 'Is a food Calorie the same as a calorie?',
        a: 'No. A food Calorie (with a capital C) is a kilocalorie — 1,000 calories.',
      },
    ],
  },
  'power-converter': {
    description:
      'Convert power between watts, kilowatts, megawatts, horsepower, metric horsepower (PS), BTU per hour and tons of refrigeration.',
    whatIs:
      'Power is energy per unit time. Car engines are rated in hp or PS, air conditioners in tons, and appliances in watts.',
    howItWorks: how('watt'),
    formula: '1 hp = 745.7 W\n1 PS = 735.5 W\n1 AC ton = 3,516.85 W',
    example: '100 hp = 74.57 kW. A 1.5-ton AC removes about 5.28 kW of heat.',
    faq: [
      {
        q: 'Does a 1.5-ton AC consume 5.28 kW?',
        a: 'No. Tons measure cooling capacity; electricity use is lower and depends on the AC’s efficiency (star rating).',
      },
    ],
  },
  'pressure-converter': {
    description: 'Convert pressure between psi, bar, kPa, MPa, atmospheres, mmHg and kgf/cm².',
    whatIs:
      'Pressure is force per unit area. Tyre pressure is usually in psi, weather in millibars and blood pressure in mmHg.',
    howItWorks: how('pascal'),
    formula: '1 bar = 100 kPa = 14.5038 psi\n1 atm = 101.325 kPa',
    example: '32 psi (a common car tyre pressure) = 2.21 bar = 220.6 kPa.',
    faq: [{ q: 'Is kgf/cm² the same as bar?', a: 'Nearly: 1 kgf/cm² = 0.980665 bar.' }],
  },
  'fuel-economy-converter': {
    description:
      'Convert vehicle fuel efficiency between km/L, L/100 km and miles per gallon (US and UK).',
    whatIs:
      'India states mileage in km per litre. Europe uses litres per 100 km (lower is better) and the US and UK use miles per gallon, with different gallons.',
    howItWorks:
      'km/L and mpg are converted with distance and volume factors. L/100 km is the inverse: 100 ÷ km/L.',
    formula: 'L/100 km = 100 ÷ km/L\nmpg (US) = km/L × 2.352',
    example: '18 km/L = 5.56 L/100 km = 42.3 mpg (US) = 50.8 mpg (UK).',
    faq: [
      {
        q: 'Why are US and UK mpg different?',
        a: 'A UK (imperial) gallon is about 20% larger than a US gallon, so the same car shows higher mpg in UK units.',
      },
    ],
  },
  'frequency-converter': {
    description:
      'Convert frequency between hertz, kilohertz, megahertz, gigahertz, terahertz, RPM and radians per second.',
    whatIs:
      'Frequency is how many times something repeats per second. It describes radio, processors, motors and sound.',
    howItWorks: how('hertz'),
    formula: '1 Hz = 60 rpm\n1 Hz = 2π rad/s',
    example: '2.4 GHz Wi-Fi = 2,400 MHz. 3,000 rpm = 50 Hz.',
    faq: [
      {
        q: 'What is RPM?',
        a: 'Revolutions per minute — the rotational speed of engines and motors.',
      },
    ],
  },
  'angle-converter': {
    description:
      'Convert angles between degrees, radians, gradians, arcminutes, arcseconds, milliradians and turns.',
    whatIs:
      'Angles measure rotation. Degrees are everyday units, radians are used in mathematics and programming, and arcminutes and seconds in navigation and astronomy.',
    howItWorks: how('degree'),
    formula: 'radians = degrees × π ÷ 180',
    example: '90° = π/2 ≈ 1.5708 rad = 100 gradians.',
    faq: [
      {
        q: 'Why do programming languages use radians?',
        a: 'Radians make calculus formulas simpler, so Math.sin() and similar functions expect radians.',
      },
    ],
  },
};

export default content;

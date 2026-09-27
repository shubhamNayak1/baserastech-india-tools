import type { ContentMap } from '../define';

const content: ContentMap = {
  'percentage-calculator': {
    description:
      'Solve every common percentage problem: X% of Y, what percent one number is of another, the whole from a part and a percentage, and percentage change.',
    whatIs:
      'A percentage expresses a number as a fraction of 100. It is used for marks, discounts, interest, taxes, growth and much more.',
    howItWorks:
      'Pick the question you want to answer and enter the two numbers. The calculator applies the matching formula instantly.',
    formula:
      'X% of Y = X ÷ 100 × Y\nX as % of Y = X ÷ Y × 100\nWhole = X × 100 ÷ Y\nChange % = (Y − X) ÷ |X| × 100',
    example:
      '15% of 2,000 is 300. 45 out of 60 is 75%. If 30 is 20% of a number, the number is 150.',
    howToUse: [
      'Choose the type of question.',
      'Enter X and Y.',
      'Read the answer — it updates as you type.',
    ],
    faq: [
      {
        q: 'How do I calculate percentage of marks?',
        a: 'Divide marks obtained by total marks and multiply by 100. For example, 450 out of 500 is 90%. The Marks Percentage Calculator handles multiple subjects.',
      },
      {
        q: 'Is X% of Y the same as Y% of X?',
        a: 'Yes. 8% of 50 equals 50% of 8 — both are 4 — which can make mental math easier.',
      },
    ],
  },
  'percentage-difference-calculator': {
    description:
      'Calculate the percentage difference between two numbers when neither is the obvious reference value.',
    whatIs:
      'Percentage difference compares two values symmetrically, dividing their absolute difference by their average. Use percentage change instead when one value is clearly the “before”.',
    howItWorks:
      'The absolute difference is divided by the mean of the two values and multiplied by 100.',
    formula: '% difference = |A − B| ÷ ((A + B) ÷ 2) × 100',
    example:
      'Between 120 and 150, the difference is 30 and the average is 135, so the percentage difference is 22.22%.',
    faq: [
      {
        q: 'Why does the order of values not matter?',
        a: 'Because the formula uses the average of both values as the reference, the result is the same either way.',
      },
    ],
  },
  'fraction-calculator': {
    description:
      'Add, subtract, multiply and divide fractions, mixed numbers and decimals, with the answer simplified and shown as a mixed number, decimal and percentage.',
    whatIs:
      'A fraction represents parts of a whole as numerator/denominator. Mixed numbers combine a whole number with a fraction, like 1 1/2.',
    howItWorks:
      'Inputs are converted to exact fractions (decimals too), the operation is applied using whole-number arithmetic, and the result is reduced by the greatest common divisor.',
    formula: 'a/b + c/d = (ad + bc) / bd\na/b × c/d = ac / bd\na/b ÷ c/d = ad / bc',
    example: '3/4 + 2/3 = 9/12 + 8/12 = 17/12 = 1 5/12 ≈ 1.4167.',
    faq: [
      {
        q: 'How do I enter a mixed number?',
        a: 'Type the whole number, a space, then the fraction — for example 2 3/4.',
      },
    ],
  },
  'ratio-calculator': {
    description:
      'Simplify a ratio of two or three quantities and divide a total amount in that ratio.',
    whatIs:
      'A ratio compares quantities, such as 2:3. Simplifying divides every term by their greatest common divisor.',
    howItWorks:
      'Decimal terms are scaled to whole numbers, then divided by the GCD. To share a total, each part is its share of the sum of the terms multiplied by the total.',
    formula: 'Share of A = A ÷ (A + B + C) × Total',
    example: '12:18 simplifies to 2:3. Dividing ₹1,000 in the ratio 12:18 gives ₹400 and ₹600.',
    faq: [
      {
        q: 'Can ratios have decimals?',
        a: 'Yes. 1.5:2.5 is scaled to 15:25 and simplified to 3:5.',
      },
    ],
  },
  'proportion-calculator': {
    description: 'Find the missing value in a proportion A/B = C/D using cross-multiplication.',
    whatIs:
      'A proportion states that two ratios are equal. If three terms are known, the fourth can be found — often called the rule of three or unitary method.',
    howItWorks:
      'Cross-multiplying gives A × D = B × C. The unknown term is found by dividing the product of the opposite pair by the known term beside it.',
    formula: 'A/B = C/D ⇒ D = B × C ÷ A',
    example:
      '3/4 = 15/D gives D = 4 × 15 ÷ 3 = 20. If 3 kg of rice costs ₹210, then 5 kg costs 210 × 5 ÷ 3 = ₹350.',
    faq: [
      {
        q: 'Where are proportions used?',
        a: 'Scaling recipes, map distances, unit prices, currency conversion and many school maths problems.',
      },
    ],
  },
  'average-calculator': {
    description:
      'Calculate the mean, median, mode, sum, range and standard deviation for any list of numbers.',
    whatIs:
      'An average summarises a set of numbers with one value. The mean is the arithmetic average, the median is the middle value and the mode is the most frequent value.',
    howItWorks:
      'Paste numbers separated by commas, spaces or line breaks. The calculator sorts them and computes all common summary statistics at once.',
    formula: 'Mean = Σx ÷ n\nσ = √(Σ(x − mean)² ÷ n)',
    example: 'For 12, 15, 18, 22, 22, 30: mean 19.83, median 20, mode 22, range 18.',
    faq: [
      {
        q: 'When should I use the median instead of the mean?',
        a: 'When data has outliers, such as salaries or house prices, the median gives a better sense of a typical value.',
      },
      {
        q: 'Population or sample standard deviation?',
        a: 'Use population when your list is the entire group; use sample (n − 1) when it is a sample from a larger group.',
      },
    ],
  },
  'weighted-average-calculator': {
    description:
      'Calculate the weighted average of values that don’t all count equally, such as grades with credits or prices with quantities.',
    whatIs:
      'In a weighted average, each value is multiplied by its weight, so values with more weight influence the result more.',
    howItWorks:
      'Enter each value and its weight on a line. The calculator divides the sum of value × weight by the total weight.',
    formula: 'Weighted average = Σ(value × weight) ÷ Σweight',
    example:
      'Marks 85 (4 credits), 72 (3), 90 (2) and 65 (1) give a weighted average of 80.1, while the simple average is 78.',
    faq: [
      {
        q: 'Do weights need to add up to 100?',
        a: 'No. Any positive weights work; they are normalised by their total.',
      },
    ],
  },
  'scientific-calculator': {
    description:
      'A free online scientific calculator for trigonometry, logarithms, exponents, roots, factorials and percentages, with degree and radian modes.',
    whatIs:
      'A scientific calculator evaluates full expressions with the correct order of operations, and includes functions beyond basic arithmetic.',
    howItWorks:
      'Type or tap an expression. It is parsed safely in your browser (no code execution) using standard precedence: brackets, powers, multiplication/division, then addition/subtraction. Implicit multiplication like 2π is supported.',
    formula: 'Order of operations: ( ) → ^ → × ÷ → + −',
    example: 'sin(30) + √16 × 2 = 0.5 + 8 = 8.5 in degree mode.',
    howToUse: [
      'Choose DEG or RAD for trigonometric functions.',
      'Type an expression or use the keypad.',
      'Press = or Enter. Use Ans to reuse the last answer, and tap history to edit a previous calculation.',
    ],
    faq: [
      {
        q: 'What does log mean here?',
        a: 'log is base 10 and ln is the natural logarithm (base e). log2 is also supported.',
      },
      { q: 'Why does tan(90) show an error?', a: 'tan 90° is undefined because cos 90° is zero.' },
    ],
  },
  'exponent-calculator': {
    description:
      'Raise any number to any power. Whole-number powers are computed exactly, even when the answer has thousands of digits.',
    whatIs:
      'An exponent tells you how many times to multiply a number (the base) by itself. Negative exponents mean reciprocals and fractional exponents mean roots.',
    howItWorks:
      'For whole-number bases and exponents the calculator uses arbitrary-precision integers. Other cases use standard floating-point arithmetic.',
    formula: 'aⁿ = a × a × … × a (n times)\na⁻ⁿ = 1 ÷ aⁿ\na^(1/n) = ⁿ√a',
    example: '2¹⁰ = 1,024. 10⁻² = 0.01. 16^0.5 = 4.',
    faq: [
      {
        q: 'What is any number to the power 0?',
        a: 'Any non-zero number to the power 0 equals 1.',
      },
    ],
  },
  'square-root-calculator': {
    description:
      'Find the square root of a number, check whether it is a perfect square and see the simplified radical form.',
    whatIs: 'The square root of x is the number that, multiplied by itself, gives x.',
    howItWorks:
      'The calculator computes the decimal root and factors out perfect squares to simplify the radical.',
    formula: '√x × √x = x\n√(a²b) = a√b',
    example: '√72 = √(36 × 2) = 6√2 ≈ 8.4853.',
    faq: [
      {
        q: 'Can I find the square root of a negative number?',
        a: 'Not as a real number. Negative numbers have imaginary square roots, such as √−1 = i.',
      },
    ],
  },
  'cube-root-calculator': {
    description:
      'Find the cube root of any number, including negative numbers, and its simplified radical form.',
    whatIs: 'The cube root of x is the number that multiplied by itself three times gives x.',
    howItWorks:
      'The decimal cube root is computed directly; perfect cubes are factored out to simplify the radical.',
    formula: '∛x × ∛x × ∛x = x',
    example: '∛54 = ∛(27 × 2) = 3∛2 ≈ 3.7798. ∛−27 = −3.',
    faq: [
      {
        q: 'Why do negative numbers have real cube roots?',
        a: 'Because a negative number multiplied by itself three times stays negative, e.g. (−3)³ = −27.',
      },
    ],
  },
  'gcd-calculator': {
    description:
      'Find the greatest common divisor — also called the highest common factor (HCF) — of two or more whole numbers.',
    whatIs:
      'The GCD is the largest whole number that divides every number in the set without a remainder.',
    howItWorks:
      'The Euclidean algorithm repeatedly replaces the larger number with the remainder of dividing it by the smaller, until the remainder is zero. It extends to many numbers pair by pair.',
    formula: 'gcd(a, b) = gcd(b, a mod b); gcd(a, 0) = a',
    example: 'GCD of 48, 180 and 600 is 12.',
    faq: [
      {
        q: 'How is GCD related to LCM?',
        a: 'For two numbers, GCD × LCM = the product of the numbers.',
      },
    ],
  },
  'lcm-calculator': {
    description: 'Find the least common multiple of two or more whole numbers.',
    whatIs:
      'The LCM is the smallest positive number that is a multiple of every number in the set. It is used to add fractions and to schedule repeating events.',
    howItWorks:
      'LCM is built pair by pair using lcm(a, b) = a × b ÷ gcd(a, b), with exact big-integer arithmetic.',
    formula: 'lcm(a, b) = |a × b| ÷ gcd(a, b)',
    example: 'LCM of 4, 6 and 15 is 60.',
    faq: [
      {
        q: 'What if one number is zero?',
        a: 'The LCM is defined as 0 because 0 is the only common multiple.',
      },
    ],
  },
  'prime-number-checker': {
    description:
      'Check whether a number is prime, see its prime factorisation and find the nearest primes.',
    whatIs: 'A prime number has exactly two divisors: 1 and itself. 2 is the only even prime.',
    howItWorks:
      'The checker uses a deterministic Miller–Rabin test that is proven correct for numbers up to 24 digits. Composite numbers are factorised by trial division.',
    formula: 'n is prime ⇔ n > 1 and its only divisors are 1 and n',
    example: '97 is prime. 360 = 2³ × 3² × 5, which has 24 divisors.',
    faq: [
      {
        q: 'Is 1 a prime number?',
        a: 'No. By definition a prime must have exactly two distinct divisors, and 1 has only one.',
      },
    ],
  },
  'random-number-generator': {
    description:
      'Generate one or many random numbers in any range — whole or decimal, with or without repeats — using a secure random source.',
    whatIs:
      'A random number generator picks numbers with equal probability. It is useful for draws, sampling, games and testing.',
    howItWorks:
      'Numbers come from your browser’s cryptographically secure generator (Web Crypto) and are mapped uniformly onto your range. With “No repeats”, duplicates are skipped.',
    formula: 'x = min + ⌊u × (max − min + 1)⌋, u uniform in [0, 1)',
    example: 'Six unique numbers between 1 and 49 for a lucky draw.',
    faq: [
      {
        q: 'Are the numbers truly random?',
        a: 'They come from a cryptographically secure pseudo-random generator, which is suitable for draws and security-sensitive uses.',
      },
    ],
  },
  'factorial-calculator': {
    description:
      'Calculate the exact factorial of any whole number up to 5,000, with the digit count.',
    whatIs:
      'n! (n factorial) is the product of all positive integers from 1 to n. By definition 0! = 1.',
    howItWorks:
      'The product is computed with arbitrary-precision integers, so every digit is exact.',
    formula: 'n! = n × (n − 1) × … × 2 × 1',
    example: '5! = 120. 20! = 2,432,902,008,176,640,000 (about 2.43 × 10¹⁸).',
    faq: [
      {
        q: 'Why is 0! equal to 1?',
        a: 'There is exactly one way to arrange zero items, and it keeps formulas like nCr consistent.',
      },
    ],
  },
  'permutation-calculator': {
    description:
      'Calculate the number of permutations nPr — ordered selections of r items from n — with or without repetition.',
    whatIs:
      'A permutation is an arrangement where order matters, such as podium finishes or PIN codes.',
    howItWorks:
      'Without repetition, nPr = n! ÷ (n − r)!. With repetition, each of the r positions can be any of n items, giving nʳ.',
    formula: 'nPr = n! ÷ (n − r)!\nWith repetition: nʳ',
    example: 'Gold, silver and bronze among 10 runners: 10P3 = 720. A 4-digit PIN: 10⁴ = 10,000.',
    faq: [
      {
        q: 'Permutation or combination?',
        a: 'If swapping the order gives a different outcome, use permutations; otherwise use combinations.',
      },
    ],
  },
  'combination-calculator': {
    description:
      'Calculate the number of combinations nCr — ways to choose r items from n when order does not matter.',
    whatIs:
      'A combination is a selection where order is irrelevant, such as choosing a team or lottery numbers.',
    howItWorks: 'nCr = n! ÷ (r! × (n − r)!). With repetition allowed, it becomes (n + r − 1)Cr.',
    formula: 'nCr = n! ÷ (r!(n − r)!)',
    example: 'A 5-card hand from 52 cards: 52C5 = 25,98,960 combinations.',
    faq: [
      {
        q: 'Why is nCr always smaller than nPr?',
        a: 'Each combination of r items can be ordered in r! ways, so nPr = nCr × r!.',
      },
    ],
  },
};

export default content;

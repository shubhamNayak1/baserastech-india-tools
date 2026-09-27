const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', r ? twoDigits(r) : ''].filter(Boolean).join(' ');
}

/** Integer to words using the Indian system (thousand, lakh, crore). */
export function integerToIndianWords(num: number): string {
  if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num))
    throw new RangeError('Expected a non-negative integer');
  if (num === 0) return 'Zero';
  if (num >= 1e15) throw new RangeError('Number too large');
  const crore = Math.floor(num / 1e7);
  let rest = num % 1e7;
  const lakh = Math.floor(rest / 1e5);
  rest %= 1e5;
  const thousand = Math.floor(rest / 1000);
  const hundred = rest % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${integerToIndianWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));
  return parts.join(' ');
}

/** "Rupees One Lakh Twenty Three Thousand … and Fifty Paise Only" */
export function rupeesInWords(amount: number): string {
  const paiseTotal = Math.round(Math.abs(amount) * 100);
  const rupees = Math.floor(paiseTotal / 100);
  const paise = paiseTotal % 100;
  let s = `Rupees ${integerToIndianWords(rupees)}`;
  if (paise) s += ` and ${twoDigits(paise)} Paise`;
  return `${amount < 0 ? 'Minus ' : ''}${s} Only`;
}

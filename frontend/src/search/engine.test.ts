import { searchEngine } from './index';
import { boundedLevenshtein, normalize } from './normalize';

const top = (q: string, n = 5) => searchEngine.search(q, { limit: n }).map((h) => h.tool.slug);

describe('search ranking (specification examples)', () => {
  it('“emi” finds EMI calculators with the generic one first', () => {
    const r = top('emi', 8);
    expect(r[0]).toBe('emi-calculator');
    for (const s of [
      'home-loan-emi-calculator',
      'personal-loan-emi-calculator',
      'car-loan-emi-calculator',
      'education-loan-emi-calculator',
    ])
      expect(r).toContain(s);
    expect(top('emi', 12)).toContain('loan-eligibility-calculator');
  });
  it('“salary” finds salary tools', () => {
    const r = searchEngine.search('salary').map((h) => h.tool.slug);
    for (const s of [
      'ctc-to-in-hand-salary-calculator',
      'salary-hike-calculator',
      'gratuity-calculator',
      'hra-calculator',
      'salary-comparison-calculator',
    ])
      expect(r).toContain(s);
  });
  it('“gst” lists GST calculators with the main one first', () => {
    const r = top('gst', 7);
    expect(r[0]).toBe('gst-calculator');
    for (const s of [
      'gst-inclusive-calculator',
      'gst-exclusive-calculator',
      'gst-reverse-calculator',
      'gst-split-calculator',
    ])
      expect(r).toContain(s);
  });
  it('matches aliases and phrases', () => {
    expect(top('take home')[0]).toBe('ctc-to-in-hand-salary-calculator');
    expect(top('in hand')).toContain('ctc-to-in-hand-salary-calculator');
    expect(top('house loan')[0]).toBe('home-loan-emi-calculator');
    expect(top('loan emi')[0]).toBe('emi-calculator');
    expect(top('home loan')[0]).toBe('home-loan-emi-calculator');
    expect(top('take home salary')[0]).toBe('ctc-to-in-hand-salary-calculator');
  });
  it('“investment” finds investment calculators', () => {
    const r = searchEngine.search('investment').map((h) => h.tool.slug);
    for (const s of [
      'sip-calculator',
      'lump-sum-calculator',
      'cagr-calculator',
      'investment-return-calculator',
    ])
      expect(r).toContain(s);
    expect(r[0]).toBe('investment-return-calculator');
  });
  it('handles other common queries', () => {
    expect(top('json')).toEqual(expect.arrayContaining(['json-formatter', 'json-validator']));
    expect(top('convert kg')[0]).toBe('weight-converter');
    expect(top('age')[0]).toBe('age-calculator');
    expect(top('bmi')[0]).toBe('bmi-calculator');
    expect(top('tax').length).toBeGreaterThan(0);
    expect(top('sip')[0]).toBe('sip-calculator');
    expect(top('percentage')[0]).toBe('percentage-calculator');
  });
  it('is typo tolerant', () => {
    expect(top('calcualtor emi')).toContain('emi-calculator');
    expect(top('gratuty')[0]).toBe('gratuity-calculator');
    expect(top('pasword')[0]).toBe('password-generator');
  });
  it('filters by category and returns nothing for nonsense', () => {
    expect(searchEngine.search('emi', { category: 'business' }).map((h) => h.tool.slug)).toEqual([
      'business-loan-calculator',
    ]);
    expect(searchEngine.search('xyzzyq')).toEqual([]);
    expect(searchEngine.search('   ')).toEqual([]);
  });
  it('is fast', () => {
    const t = performance.now();
    for (let i = 0; i < 200; i++)
      searchEngine.search(['emi', 'salary', 'gst', 'jsn', 'convert kg'][i % 5]);
    expect((performance.now() - t) / 200).toBeLessThan(5);
  });
});

describe('normalisation', () => {
  it('normalises and measures edit distance', () => {
    expect(normalize('  Café & Crème!! ')).toBe('cafe and creme');
    expect(boundedLevenshtein('gratuity', 'gratuty', 2)).toBe(1);
    expect(boundedLevenshtein('abcd', 'bacd', 1)).toBe(1);
    expect(boundedLevenshtein('abc', 'xyzw', 1)).toBe(2);
  });
});

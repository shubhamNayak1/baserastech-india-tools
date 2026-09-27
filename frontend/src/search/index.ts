import { ACTIVE_TOOLS } from '@/tools/registry';
import { SearchEngine } from './engine';

export const searchEngine = new SearchEngine(ACTIVE_TOOLS);

export const POPULAR_SEARCHES = ['EMI', 'GST', 'Salary', 'SIP', 'Age', 'BMI', 'Percentage', 'JSON'];

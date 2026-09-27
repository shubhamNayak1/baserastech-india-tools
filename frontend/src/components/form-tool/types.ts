export type FieldValue = number | string | boolean;
export type FormValues = Record<string, FieldValue>;

interface FieldBase<V extends FormValues> {
  name: keyof V & string;
  label: string;
  help?: string;
  /** Show the field only when the predicate returns true. Hidden fields are not validated. */
  showIf?: (values: V) => boolean;
  /** Layout hint: fields default to half-width on larger screens. */
  full?: boolean;
}

export interface NumberField<V extends FormValues> extends FieldBase<V> {
  type: 'number' | 'currency' | 'percent';
  default: number | '';
  min?: number;
  max?: number;
  step?: number;
  /** Text appended inside the input, e.g. "years", "kg". May depend on other values. */
  unit?: string | ((values: V) => string);
  integer?: boolean;
  optional?: boolean;
  placeholder?: string;
  /** Minimum is exclusive (value must be strictly greater than min). */
  exclusiveMin?: boolean;
}

export interface Option {
  value: string;
  label: string;
}

export interface SelectField<V extends FormValues> extends FieldBase<V> {
  type: 'select' | 'segmented';
  default: string;
  options: Option[] | ((values: V) => Option[]);
}

export interface TextField<V extends FormValues> extends FieldBase<V> {
  type: 'text' | 'textarea' | 'date' | 'time' | 'datetime';
  /** For date fields, 'today' resolves to the user's local date. */
  default: string | (() => string);
  optional?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export interface ToggleField<V extends FormValues> extends FieldBase<V> {
  type: 'toggle';
  default: boolean;
}

export type Field<V extends FormValues = FormValues> =
  NumberField<V> | SelectField<V> | TextField<V> | ToggleField<V>;

export interface ResultItem {
  label: string;
  value: string;
  /** The headline result. */
  primary?: boolean;
  hint?: string;
}

export interface DonutChart {
  kind: 'donut';
  title?: string;
  data: { label: string; value: number }[];
  format?: 'inr' | 'number' | 'percent';
}

export interface BarChart {
  kind: 'bars';
  title?: string;
  labels: string[];
  series: { name: string; values: number[] }[];
  stacked?: boolean;
  format?: 'inr' | 'number';
}

export interface GaugeChart {
  kind: 'gauge';
  title?: string;
  value: number;
  min: number;
  max: number;
  bands: { to: number; label: string; tone: 'blue' | 'green' | 'amber' | 'red' }[];
  valueLabel: string;
}

export type ChartSpec = DonutChart | BarChart | GaugeChart;

export interface TableSpec {
  title?: string;
  columns: string[];
  rows: string[][];
  /** Rows visible before "Show all". */
  initialRows?: number;
}

export interface ToolResult {
  results: ResultItem[];
  chart?: ChartSpec;
  table?: TableSpec;
  notes?: string[];
  /** Optional plain-language summary sentence used for sharing. */
  summary?: string;
}

export interface FormToolSpec<V extends FormValues> {
  fields: Field<V>[];
  compute: (values: V) => ToolResult;
  /** Recalculate on every change once all inputs are valid (default true). */
  instant?: boolean;
  submitLabel?: string;
  /** Persist inputs in the URL for shareable links (default true). Disable for sensitive input. */
  urlState?: boolean;
  /** Cross-field validation returning a field-specific or general error. */
  validate?: (values: V) => { field?: keyof V & string; message: string } | null;
}

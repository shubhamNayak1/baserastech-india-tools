export type AnalyticsEventName =
  | 'tool_view'
  | 'tool_used'
  | 'calculation_completed'
  | 'result_copied'
  | 'result_shared'
  | 'search_started'
  | 'search_completed'
  | 'search_result_clicked'
  | 'category_viewed'
  | 'favorite_added'
  | 'favorite_removed'
  | 'page_view';

/** Only non-personal, low-cardinality properties. Never calculator inputs. */
export interface AnalyticsProps {
  tool?: string;
  category?: string;
  query?: string;
  results?: number;
  position?: number;
  channel?: string;
  path?: string;
}

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  props: AnalyticsProps;
  ts: number;
}

export interface AnalyticsProvider {
  readonly id: string;
  track(event: AnalyticsEvent): void;
  flush?(): void;
}

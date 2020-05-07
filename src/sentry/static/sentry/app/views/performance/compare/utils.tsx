import {SentryTransactionEvent} from 'app/types';
import {ParsedTraceType} from 'app/components/events/interfaces/spans/types';

export function isTransactionEvent(event: any): event is SentryTransactionEvent {
  if (!event) {
    return false;
  }

  return event?.type === 'transaction';
}

// The diff state between a baseline span sub-tree and the regression span sub-tree
type DiffState = 'no-changes' | 'new' | 'deleted';

export type ComparisonReport = {
  baselineTrace: ParsedTraceType;
  regressionTrace: ParsedTraceType;
};

export function diffTransactions({
  baselineTrace,
  regressionTrace,
}: {
  baselineTrace: ParsedTraceType;
  regressionTrace: ParsedTraceType;
}): ComparisonReport {
  const report = {
    baselineTrace,
    regressionTrace,
  };

  return report;
}

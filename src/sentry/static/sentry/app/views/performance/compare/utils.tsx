import {SentryTransactionEvent} from 'app/types';
import {RawSpanType} from 'app/components/events/interfaces/spans/types';
import {parseTrace, generateRootSpan} from 'app/components/events/interfaces/spans/utils';

export function isTransactionEvent(event: any): event is SentryTransactionEvent {
  if (!event) {
    return false;
  }

  return event?.type === 'transaction';
}

export type ComparisonReport = {};

export function diffTransactions({
  baselineEvent,
  regressionEvent,
}: {
  baselineEvent: SentryTransactionEvent;
  regressionEvent: SentryTransactionEvent;
}): ComparisonReport {
  const baselineTrace = parseTrace(baselineEvent);
  const regressionTrace = parseTrace(regressionEvent);

  const spans = [];

  // merge the two transaction's span trees

  const baseRootSpan: RawSpanType = generateRootSpan(baselineTrace);

  // we maintain a stack of spans to be compared
  const spansToBeCompared: Array<{
    baselineSpan: RawSpanType;
    regressionSpan: RawSpanType;
  }> = [
    {
      baselineSpan: generateRootSpan(baselineTrace),
      regressionSpan: generateRootSpan(regressionTrace),
    },
  ];

  while (spansToBeCompared.length > 0) {
    const currentSpans = spansToBeCompared.pop();

    if (!currentSpans) {
      break;
    }

    compareSpans(currentSpans);
  }

  const report = {};

  return report;
}

function compareSpans({
  baselineSpan,
  regressionSpan,
}: {
  baselineSpan: RawSpanType;
  regressionSpan: RawSpanType;
}) {
  console.log({
    baselineSpan,
    regressionSpan,
  });
}

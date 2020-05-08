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

  // merge the two transaction's span trees

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

    const {baselineSpan, regressionSpan} = currentSpans;

    // The span from the base transaction is considered 'identical' to the span from the regression transaction
    // only if they share the same op name, depth level, and description.
    //
    // baselineSpan and regressionSpan have equivalent depth levels due to the nature of the tree traversal algorithm.

    const opNamesEqual = baselineSpan.op === regressionSpan.op;
    const descriptionsEqual = baselineSpan.description === regressionSpan.description;

    // caveats
    // TODO: should we compare sibling position?
    // TODO: should we compare starting timestamp?

    if (!opNamesEqual || !descriptionsEqual) {
      // TODO:

      continue;
    }
  }

  const report = {};

  return report;
}

export type SpansComparisonReport = {
  spansAreIdentical: boolean;

  baselineSpan: RawSpanType;
  regressionSpan: RawSpanType;

  // direct children spans to be compared
  spansToBeCompared: Array<{
    baselineSpan: RawSpanType;
    regressionSpan: RawSpanType;
  }>;
};

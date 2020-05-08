import {SentryTransactionEvent} from 'app/types';
import {RawSpanType} from 'app/components/events/interfaces/spans/types';
import {parseTrace, generateRootSpan} from 'app/components/events/interfaces/spans/utils';

export function isTransactionEvent(event: any): event is SentryTransactionEvent {
  if (!event) {
    return false;
  }

  return event?.type === 'transaction';
}

type DiffSpanType =
  | {
      comparisonResult: 'matched';
      baselineSpan: RawSpanType;
      regressionSpan: RawSpanType;
    }
  | {
      comparisonResult: 'baseline';
      baselineSpan: RawSpanType;
    }
  | {
      comparisonResult: 'regression';
      regressionSpan: RawSpanType;
    };

type SpanId = string;

// map span_id to children whose parent_span_id is equal to span_id
export type SpanChildrenLookupType = Record<SpanId, Array<DiffSpanType>>;

export type ComparisonReport = {
  rootSpans: Array<DiffSpanType>;

  childSpans: SpanChildrenLookupType;
};

export function diffTransactions({
  baselineEvent,
  regressionEvent,
}: {
  baselineEvent: SentryTransactionEvent;
  regressionEvent: SentryTransactionEvent;
}): ComparisonReport {
  const baselineTrace = parseTrace(baselineEvent);
  const regressionTrace = parseTrace(regressionEvent);

  const rootSpans: Array<DiffSpanType> = [];
  const childSpans: SpanChildrenLookupType = {};

  // merge the two transaction's span trees

  // we maintain a stack of spans to be compared
  const spansToBeCompared: Array<{
    type: 'root' | 'descendent';
    baselineSpan: RawSpanType;
    regressionSpan: RawSpanType;
  }> = [
    {
      type: 'root',
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

    if (!opNamesEqual || !descriptionsEqual) {
      const spanComparisonResults: [DiffSpanType, DiffSpanType] = [
        {
          comparisonResult: 'baseline',
          baselineSpan,
        },
        {
          comparisonResult: 'regression',
          regressionSpan,
        },
      ];

      if (currentSpans.type === 'root') {
        rootSpans.push(...spanComparisonResults);
      } else {
        // TODO:
      }

      // TODO: handle children

      continue;
    }

    const spanComparisonResults: DiffSpanType = {
      comparisonResult: 'matched',
      baselineSpan,
      regressionSpan,
    };

    if (currentSpans.type === 'root') {
      rootSpans.push(spanComparisonResults);
    } else {
      // rootSpans.push(mergedSpan);
      // TODO:
    }

    // TODO: handle children
    // caveats
    // TODO: should we compare sibling position?
    // TODO: should we compare starting timestamp?
    // for each child in the base span, find the closest matching child in the regression span
  }

  const report = {
    rootSpans,
  };

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

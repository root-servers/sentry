import {SentryTransactionEvent} from 'app/types';
import {RawSpanType, SpanType} from 'app/components/events/interfaces/spans/types';
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
      span_id: SpanId; // baselineSpan.span_id + regressionSpan.span_id
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

type ComparableSpan = {
  type: 'descendent';
  parent_span_id: SpanId;
  baselineSpan: RawSpanType;
  regressionSpan: RawSpanType;
};

// TODO: move this
type SpanId = string;

// map span_id to children whose parent_span_id is equal to span_id
// invariant: spans that are matched will have children in this lookup map
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
  const spansToBeCompared: Array<
    | {
        type: 'root';
        baselineSpan: RawSpanType;
        regressionSpan: RawSpanType;
      }
    | ComparableSpan
  > = [
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

    if (!matchableSpans({baselineSpan, regressionSpan})) {
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
        // invariant: currentSpans.type === 'descendent'

        const spanChildren: Array<DiffSpanType> =
          childSpans[currentSpans.parent_span_id] ?? [];

        spanChildren.push(...spanComparisonResults);

        childSpans[currentSpans.parent_span_id] = spanChildren;
      }

      // since baselineSpan and regressionSpan are considered not identical, we do not
      // need to compare their sub-trees

      continue;
    }

    const spanComparisonResult: DiffSpanType = {
      comparisonResult: 'matched',
      span_id: `${baselineSpan.span_id}${regressionSpan.span_id}`,
      baselineSpan,
      regressionSpan,
    };

    if (currentSpans.type === 'root') {
      rootSpans.push(spanComparisonResult);
    } else {
      // invariant: currentSpans.type === 'descendent'

      const spanChildren: Array<DiffSpanType> =
        childSpans[currentSpans.parent_span_id] ?? [];

      spanChildren.push(spanComparisonResult);

      childSpans[currentSpans.parent_span_id] = spanChildren;
    }

    createChildPairs({
      baseChildren: baselineTrace.childSpans[baselineSpan.span_id],
      regressionChildren: regressionTrace.childSpans[regressionSpan.span_id],
    });
  }

  const report = {
    rootSpans,
    childSpans,
  };

  return report;
}

function createChildPairs({
  baseChildren,
  regressionChildren,
}: {
  baseChildren: Array<SpanType>;
  regressionChildren: Array<SpanType>;
}) {
  // for each child in baseChildren, pair them with the closest matching child in regressionChildren

  const pairs: Array<ComparableSpan> = [];

  regressionChildren = [...regressionChildren];

  for (const baselineSpan of baseChildren) {
    const maybeIndex = regressionChildren.findIndex(regressionSpan => {
      return matchableSpans({baselineSpan, regressionSpan});
    });

    if (maybeIndex < 0) {
      // TODO:
      continue;
    }
  }

  // TODO: compare description using similarity index or levenshtein distance?

  // TODO: implement

  return null;
}

function matchableSpans({
  baselineSpan,
  regressionSpan,
}: {
  baselineSpan: SpanType;
  regressionSpan: SpanType;
}): boolean {
  const opNamesEqual = baselineSpan.op === regressionSpan.op;
  const descriptionsEqual = baselineSpan.description === regressionSpan.description;

  return opNamesEqual && descriptionsEqual;
}

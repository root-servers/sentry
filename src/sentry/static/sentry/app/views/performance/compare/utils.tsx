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
  baselineSpan: SpanType;
  regressionSpan: SpanType;
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
      if (currentSpans.type === 'root') {
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

        rootSpans.push(...spanComparisonResults);
      } else {
        // invariant: currentSpans.type === 'descendent'
        //
        // TODO: no need to do this; audit this case
        //
        // const spanChildren: Array<DiffSpanType> =
        //   childSpans[currentSpans.parent_span_id] ?? [];
        // spanChildren.push(...spanComparisonResults);
        // childSpans[currentSpans.parent_span_id] = spanChildren;
      }

      // since baselineSpan and regressionSpan are considered not identical, we do not
      // need to compare their sub-trees

      continue;
    }

    const spanComparisonResult: DiffSpanType = {
      comparisonResult: 'matched',
      span_id: generateMergedSpanId({baselineSpan, regressionSpan}),
      baselineSpan,
      regressionSpan,
    };

    if (currentSpans.type === 'root') {
      rootSpans.push(spanComparisonResult);
    } else {
      // invariant: currentSpans.type === 'descendent'
      //
      // TODO: no need to do this; audit this case
      //
      // const spanChildren: Array<DiffSpanType> =
      //   childSpans[currentSpans.parent_span_id] ?? [];
      // spanChildren.push(spanComparisonResult);
      // childSpans[currentSpans.parent_span_id] = spanChildren;
    }

    const {comparablePairs, children} = createChildPairs({
      parent_span_id: spanComparisonResult.span_id,
      baseChildren: baselineTrace.childSpans[baselineSpan.span_id] ?? [],
      regressionChildren: regressionTrace.childSpans[regressionSpan.span_id] ?? [],
    });

    spansToBeCompared.push(...comparablePairs);

    childSpans[spanComparisonResult.span_id] = children;
  }

  const report = {
    rootSpans,
    childSpans,
  };

  return report;
}

function createChildPairs({
  parent_span_id,
  baseChildren,
  regressionChildren,
}: {
  parent_span_id: SpanId;
  baseChildren: Array<SpanType>;
  regressionChildren: Array<SpanType>;
}): {
  comparablePairs: Array<ComparableSpan>;
  children: Array<DiffSpanType>;
} {
  // invariant: the parents of baseChildren and regressionChildren are matched spans

  // for each child in baseChildren, pair them with the closest matching child in regressionChildren

  const comparablePairs: Array<ComparableSpan> = [];
  const children: Array<DiffSpanType> = [];

  regressionChildren = [...regressionChildren];

  for (const baselineSpan of baseChildren) {
    // TODO: compare description using similarity index or levenshtein distance?

    // TODO: match all possible candidates and get one closest to the span by start timestamp
    // or calculate delta to start timestamp, and delta to duration, and get lowest delta(start_time) + delta(duration)
    const maybeIndex = regressionChildren.findIndex(regressionSpan => {
      return matchableSpans({baselineSpan, regressionSpan});
    });

    if (maybeIndex < 0) {
      children.push({
        comparisonResult: 'baseline',
        baselineSpan,
      });
      continue;
    }

    const regressionSpan = regressionChildren.splice(maybeIndex, 1)[0];

    comparablePairs.push({
      type: 'descendent',
      parent_span_id,
      baselineSpan,
      regressionSpan,
    });

    children.push({
      comparisonResult: 'matched',
      span_id: generateMergedSpanId({baselineSpan, regressionSpan}),
      baselineSpan,
      regressionSpan,
    });
  }

  // push any remaining un-matched regressionSpans
  for (const regressionSpan of regressionChildren) {
    children.push({
      comparisonResult: 'regression',
      regressionSpan,
    });
  }

  // TODO: sort children by start timestamp

  return {
    comparablePairs,
    children,
  };
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

function generateMergedSpanId({
  baselineSpan,
  regressionSpan,
}: {
  baselineSpan: SpanType;
  regressionSpan: SpanType;
}): string {
  return `${baselineSpan.span_id}${regressionSpan.span_id}`;
}

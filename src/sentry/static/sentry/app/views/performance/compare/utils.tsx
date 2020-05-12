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
      // typescript assumes currentSpans is undefined due to the nature of Array.prototype.pop()
      // returning undefined if spansToBeCompared is empty. the loop invariant guarantees that spansToBeCompared
      // is a non-empty array. we handle this case for sake of completeness
      break;
    }

    // invariant: the parents of currentSpans are matched spans; with the exception of the root spans of the baseline
    //            transaction and the regression transaction.
    // invariant: any unvisited siblings of currentSpans are in spansToBeCompared.
    // invariant: currentSpans and their siblings are already in childSpans

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

    if (children.length > 0) {
      childSpans[spanComparisonResult.span_id] = children;
    }
  }

  rootSpans.sort(sortByMostTimeAdded);

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

  const remainingRegressionChildren = [...regressionChildren];

  for (const baselineSpan of baseChildren) {
    // reduce remainingRegressionChildren down to spans that are applicable candidate
    // of spans that can be paired with baselineSpan

    const candidates = remainingRegressionChildren.reduce(
      (
        acc: Array<{regressionSpan: SpanType; index: number}>,
        regressionSpan: SpanType,
        index: number
      ) => {
        if (matchableSpans({baselineSpan, regressionSpan})) {
          acc.push({
            regressionSpan,
            index,
          });
        }

        return acc;
      },
      []
    );

    if (candidates.length === 0) {
      children.push({
        comparisonResult: 'baseline',
        baselineSpan,
      });
      continue;
    }

    // the best candidate span is one that has the closest start timestamp to baselineSpan;
    // and one that has a duration that's close to baselineSpan

    const baselineSpanDuration = Math.abs(
      baselineSpan.timestamp - baselineSpan.start_timestamp
    );

    candidates.sort(({regressionSpan: thisSpan}, {regressionSpan: otherSpan}) => {
      // calculate the deltas of the start timestamps relative to baselineSpan's
      // start timestamp

      const deltaStartTimestampThisSpan = Math.abs(
        thisSpan.start_timestamp - baselineSpan.start_timestamp
      );

      const deltaStartTimestampOtherSpan = Math.abs(
        otherSpan.start_timestamp - baselineSpan.start_timestamp
      );

      // calculate the deltas of the durations relative to the baselineSpan's
      // duration

      const thisSpanDuration = Math.abs(thisSpan.timestamp - thisSpan.start_timestamp);
      const otherSpanDuration = Math.abs(otherSpan.timestamp - otherSpan.start_timestamp);

      const deltaDurationThisSpan = Math.abs(thisSpanDuration - baselineSpanDuration);
      const deltaDurationOtherSpan = Math.abs(otherSpanDuration - baselineSpanDuration);

      const thisSpanScore = deltaDurationThisSpan + deltaStartTimestampThisSpan;
      const otherSpanScore = deltaDurationOtherSpan + deltaStartTimestampOtherSpan;

      if (thisSpanScore < otherSpanScore) {
        // sort thisSpan before otherSpan
        return -1;
      }

      if (thisSpanScore > otherSpanScore) {
        // sort thisSpan after otherSpan
        return 1;
      }

      return 0;
    });

    const {regressionSpan, index} = candidates[0];

    // remove regressionSpan from list of remainingRegressionChildren
    remainingRegressionChildren.splice(index, 1);

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
  for (const regressionSpan of remainingRegressionChildren) {
    children.push({
      comparisonResult: 'regression',
      regressionSpan,
    });
  }

  // sort children by start timestamp

  children.sort(function(firstSpan: DiffSpanType, secondSpan: DiffSpanType) {
    // TODO: sort by most time added?

    // sort spans by their start timestamp in ascending order

    const firstSpanTimestamp = getDiffSpanStartTime(firstSpan);
    const secondSpanTimestamp = getDiffSpanStartTime(secondSpan);

    if (firstSpanTimestamp < secondSpanTimestamp) {
      // sort firstSpan before secondSpan
      return -1;
    }

    if (firstSpanTimestamp === secondSpanTimestamp) {
      return 0;
    }

    // sort secondSpan before firstSpan
    return 1;
  });

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

function getDiffSpanStartTime(diffSpan: DiffSpanType): number {
  switch (diffSpan.comparisonResult) {
    case 'matched': {
      return (
        (diffSpan.baselineSpan.start_timestamp +
          diffSpan.regressionSpan.start_timestamp) /
        2
      );
    }
    case 'baseline': {
      return diffSpan.baselineSpan.start_timestamp;
    }
    case 'regression': {
      return diffSpan.regressionSpan.start_timestamp;
    }
    default: {
      throw Error('Unknown comparisonResult');
    }
  }
}

function getSpanDuration(span: RawSpanType): number {
  return Math.abs(span.timestamp - span.start_timestamp);
}

function sortSpans(firstSpan: RawSpanType, secondSpan: RawSpanType): number {
  const firstSpanDuration = getSpanDuration(firstSpan);
  const secondSpanDuration = getSpanDuration(secondSpan);

  if (firstSpanDuration > secondSpanDuration) {
    // sort firstSpan before secondSpan
    return -1;
  }

  if (firstSpanDuration < secondSpanDuration) {
    // sort secondSpan before firstSpan
    return 1;
  }

  // try to break ties by sorting by start timestamp in ascending order

  if (firstSpan.start_timestamp < secondSpan.start_timestamp) {
    // sort firstSpan before secondSpan
    return -1;
  }

  if (firstSpan.start_timestamp > secondSpan.start_timestamp) {
    // sort secondSpan before firstSpan
    return 1;
  }

  return 0;
}

function sortByMostTimeAdded(firstSpan: DiffSpanType, secondSpan: DiffSpanType): number {
  // Sort the spans by most time added. This means that when comparing the spans of the regression transaction
  // against the spans of the baseline transaction, we sort the spans by those that have regressed the most
  // relative to their baseline counter parts first.
  //
  // In terms of sort, we display them in the following way:
  // - Regression only spans; sorted first by duration (descending), and then start timestamps (ascending)
  // - Matched spans:
  //     - slower -- i.e. regression.duration - baseline.duration > 0 (sorted by duration deltas, and by duration)
  //     - no change -- i.e. regression.duration - baseline.duration == 0 (sorted by duration)
  //     - faster -- i.e. regression.duration - baseline.duration < 0 (sorted by duration deltas, and by duration)
  // - Baseline only spans; sorted by duration

  switch (firstSpan.comparisonResult) {
    case 'regression': {
      switch (secondSpan.comparisonResult) {
        case 'regression': {
          return sortSpans(firstSpan.regressionSpan, secondSpan.regressionSpan);
        }
        case 'baseline':
        case 'matched': {
          // sort firstSpan (regression) before secondSpan (baseline)
          return -1;
        }
        default: {
          throw Error('Unknown comparisonResult');
        }
      }
    }
    case 'baseline': {
      switch (secondSpan.comparisonResult) {
        case 'baseline': {
          return sortSpans(firstSpan.baselineSpan, secondSpan.baselineSpan);
        }
        case 'regression':
        case 'matched': {
          // sort secondSpan (regression or matched) before firstSpan (baseline)
          return 1;
        }
        default: {
          throw Error('Unknown comparisonResult');
        }
      }
    }
    case 'matched': {
      switch (secondSpan.comparisonResult) {
        case 'regression': {
          // sort secondSpan (regression) before firstSpan (matched)
          return 1;
        }
        case 'baseline': {
          // sort firstSpan (matched) before secondSpan (baseline)
          return -1;
        }
        case 'matched': {
          // TODO: ????
        }
        default: {
          throw Error('Unknown comparisonResult');
        }
      }
    }
    default: {
      throw Error('Unknown comparisonResult');
    }
  }
}

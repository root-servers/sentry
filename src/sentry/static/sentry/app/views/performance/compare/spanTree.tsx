import React from 'react';
import styled from '@emotion/styled';

import {SentryTransactionEvent} from 'app/types';
import {TreeDepthType} from 'app/components/events/interfaces/spans/types';

import {diffTransactions, DiffSpanType, SpanChildrenLookupType, getSpanID} from './utils';
import SpanGroup from './spanGroup';

type RenderedSpanTree = {
  spanTree: JSX.Element | null;
  nextSpanNumber: number;
  // numOfSpansOutOfViewAbove: number;
  // numOfFilteredSpansAbove: number;
};

type Props = {
  baselineEvent: SentryTransactionEvent;
  regressionEvent: SentryTransactionEvent;
};

class SpanTree extends React.Component<Props> {
  renderSpan({
    span,
    childSpans,
    spanNumber,
    treeDepth,
    continuingTreeDepths,
    isLast,
    isRoot,
  }: {
    span: Readonly<DiffSpanType>;
    childSpans: Readonly<SpanChildrenLookupType>;
    spanNumber: number;
    treeDepth: number;
    continuingTreeDepths: Array<TreeDepthType>;
    isLast: boolean;
    isRoot: boolean;
  }): RenderedSpanTree {
    const spanChildren: Array<DiffSpanType> = childSpans?.[getSpanID(span)] ?? [];

    type AccType = {
      renderedSpanChildren: Array<JSX.Element>;
      nextSpanNumber: number;
    };

    // TODO: deal with orphan case
    // const treeDepthEntry = isOrphanSpan(span)
    //   ? ({type: 'orphan', depth: treeDepth} as OrphanTreeDepth)
    //   : treeDepth;
    const treeDepthEntry = treeDepth;

    const treeArr = isLast
      ? continuingTreeDepths
      : [...continuingTreeDepths, treeDepthEntry];

    const reduced: AccType = spanChildren.reduce(
      (acc: AccType, spanChild, index) => {
        const key = `${getSpanID(spanChild)}`;

        const results = this.renderSpan({
          spanNumber: acc.nextSpanNumber,
          isLast: index + 1 === spanChildren.length,
          isRoot: false,
          span: spanChild,
          childSpans,
          continuingTreeDepths: treeArr,
          treeDepth: treeDepth + 1,
        });

        acc.renderedSpanChildren.push(
          <React.Fragment key={key}>{results.spanTree}</React.Fragment>
        );

        acc.nextSpanNumber = results.nextSpanNumber;

        return acc;
      },
      {
        renderedSpanChildren: [],
        nextSpanNumber: spanNumber + 1,
      }
    );

    const spanTree = (
      <React.Fragment>
        <SpanGroup
          spanNumber={spanNumber}
          span={span}
          renderedSpanChildren={reduced.renderedSpanChildren}
          treeDepth={treeDepth}
          continuingTreeDepths={continuingTreeDepths}
          isRoot={isRoot}
          isLast={isLast}
          numOfSpanChildren={spanChildren.length}
        />
      </React.Fragment>
    );

    return {
      nextSpanNumber: reduced.nextSpanNumber,
      spanTree,
    };
  }

  renderRootSpans(): RenderedSpanTree {
    const {baselineEvent, regressionEvent} = this.props;

    const comparisonReport = diffTransactions({
      baselineEvent,
      regressionEvent,
    });

    const {rootSpans, childSpans} = comparisonReport;

    console.log('comparisonReport', comparisonReport);
    console.log('rootSpans', rootSpans);

    let nextSpanNumber = 1;

    const spanTree = (
      <React.Fragment key="root-spans-tree">
        {rootSpans.map((rootSpan, index) => {
          const renderedRootSpan = this.renderSpan({
            isLast: index + 1 === rootSpans.length,
            isRoot: true,
            span: rootSpan,
            childSpans,
            spanNumber: nextSpanNumber,
            treeDepth: 0,
            continuingTreeDepths: [],
          });

          nextSpanNumber = renderedRootSpan.nextSpanNumber;

          return (
            <React.Fragment key={String(index)}>
              {renderedRootSpan.spanTree}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );

    return {
      spanTree,
      nextSpanNumber,
    };
  }

  render() {
    const {spanTree} = this.renderRootSpans();

    return <TraceViewContainer>{spanTree}</TraceViewContainer>;
  }
}

const TraceViewContainer = styled('div')`
  overflow-x: hidden;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
`;

export default SpanTree;

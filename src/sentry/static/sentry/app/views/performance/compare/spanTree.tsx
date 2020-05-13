import React from 'react';
import styled from '@emotion/styled';

import {SentryTransactionEvent} from 'app/types';

import {diffTransactions, DiffSpanType} from './utils';

type RenderedSpanTree = {
  spanTree: JSX.Element | null;

  // TODO: needed?
  // nextSpanNumber: number;
  // numOfSpansOutOfViewAbove: number;
  // numOfFilteredSpansAbove: number;
};

type Props = {
  baselineEvent: SentryTransactionEvent;
  regressionEvent: SentryTransactionEvent;
};

class SpanTree extends React.Component<Props> {
  renderSpan({span}: {span: Readonly<DiffSpanType>}): RenderedSpanTree {
    const spanTree = <div>{span.comparisonResult}</div>;

    return {
      spanTree,
    };
  }

  renderRootSpans(): RenderedSpanTree {
    const {baselineEvent, regressionEvent} = this.props;

    const comparisonReport = diffTransactions({
      baselineEvent,
      regressionEvent,
    });

    const {rootSpans} = comparisonReport;

    console.log('comparisonReport', comparisonReport);
    console.log('rootSpans', rootSpans);

    const spanTree = (
      <React.Fragment key="root-spans-tree">
        {rootSpans.map((rootSpan, index) => {
          const renderedSpan = this.renderSpan({span: rootSpan});

          return (
            <React.Fragment key={String(index)}>{renderedSpan.spanTree}</React.Fragment>
          );
        })}
      </React.Fragment>
    );

    return {
      spanTree,
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

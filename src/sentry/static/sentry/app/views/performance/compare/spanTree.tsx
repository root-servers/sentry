import React from 'react';
import styled from '@emotion/styled';

import {SentryTransactionEvent} from 'app/types';

import {diffTransactions} from './utils';

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
  renderRootSpans(): RenderedSpanTree {
    const {baselineEvent, regressionEvent} = this.props;

    const comparisonReport = diffTransactions({
      baselineEvent,
      regressionEvent,
    });

    console.log('comparisonReport', comparisonReport);

    const spanTree = <div>root spans</div>;

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

import React from 'react';
import styled from '@emotion/styled';

import {SentryTransactionEvent} from 'app/types';

import {diffTransactions, DiffSpanType, SpanChildrenLookupType, getSpanID} from './utils';
import SpanGroup from './spanGroup';

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
  renderSpan({
    span,
    childSpans,
  }: {
    span: Readonly<DiffSpanType>;
    childSpans: Readonly<SpanChildrenLookupType>;
  }): RenderedSpanTree {
    const spanChildren: Array<DiffSpanType> = childSpans?.[getSpanID(span)] ?? [];

    type AccType = {
      renderedSpanChildren: Array<JSX.Element>;
    };

    const reduced: AccType = spanChildren.reduce(
      (acc: AccType, spanChild) => {
        const key = `${getSpanID(spanChild)}`;

        const results = this.renderSpan({
          span: spanChild,
          childSpans,
        });

        acc.renderedSpanChildren.push(
          <React.Fragment key={key}>{results.spanTree}</React.Fragment>
        );

        return acc;
      },
      {
        renderedSpanChildren: [],
      }
    );

    const spanTree = (
      <React.Fragment>
        <div>
          {getSpanID(span)} - {span.comparisonResult}
        </div>
        <SpanGroup renderedSpanChildren={reduced.renderedSpanChildren} />
      </React.Fragment>
    );

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

    const {rootSpans, childSpans} = comparisonReport;

    console.log('comparisonReport', comparisonReport);
    console.log('rootSpans', rootSpans);

    const spanTree = (
      <React.Fragment key="root-spans-tree">
        {rootSpans.map((rootSpan, index) => {
          const renderedSpan = this.renderSpan({span: rootSpan, childSpans});

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

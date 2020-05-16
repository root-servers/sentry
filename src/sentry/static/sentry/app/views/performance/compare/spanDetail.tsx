import React from 'react';
import styled from '@emotion/styled';

import space from 'app/styles/space';
import {
  SpanDetailContainer,
  SpanDetails,
  Row,
} from 'app/components/events/interfaces/spans/spanDetail';
import {SpanType} from 'app/components/events/interfaces/spans/types';

import {DiffSpanType} from './utils';
import SpanDetailContent from './spanDetailContent';

type Props = {
  span: Readonly<DiffSpanType>;
};

class SpanDetail extends React.Component<Props> {
  renderContent() {
    const {span} = this.props;

    switch (span.comparisonResult) {
      case 'matched': {
        return (
          <MatchedSpanDetailsContent
            baselineSpan={span.baselineSpan}
            regressionSpan={span.regressionSpan}
          />
        );
      }
      case 'regression': {
        return <SpanDetailContent span={span.regressionSpan} />;
      }
      case 'baseline': {
        return <SpanDetailContent span={span.baselineSpan} />;
      }
      default: {
        const _exhaustiveCheck: never = span;
        return _exhaustiveCheck;
      }
    }
  }

  render() {
    return (
      <SpanDetailContainer
        onClick={event => {
          // prevent toggling the span detail
          event.stopPropagation();
        }}
      >
        {this.renderContent()}
      </SpanDetailContainer>
    );
  }
}

const MatchedSpanDetailsContent = (props: {
  baselineSpan: SpanType;
  regressionSpan: SpanType;
}) => {
  const {baselineSpan, regressionSpan} = props;

  return (
    <MatchedSpanDetails>
      <RowSplitter>
        <Foo>
          <Row title="Span ID">{baselineSpan.span_id}</Row>
        </Foo>
        <Foo>
          <Row title="Span ID">{regressionSpan.span_id}</Row>
        </Foo>
      </RowSplitter>
      <RowSplitter>
        <Foo>
          <Row title="Trace ID">{baselineSpan.trace_id}</Row>
        </Foo>
        <Foo>
          <Row title="Trace ID">{regressionSpan.trace_id}</Row>
        </Foo>
      </RowSplitter>
      <RowSplitter>
        <Foo>
          <Row title="Parent Span ID">{baselineSpan.parent_span_id || ''}</Row>
        </Foo>
        <Foo>
          <Row title="Parent Span ID">{regressionSpan.parent_span_id || ''}</Row>
        </Foo>
      </RowSplitter>
      <RowSplitter>
        <Foo>
          <Row title="Description">{baselineSpan.description ?? ''}</Row>
        </Foo>
        <Foo>
          <Row title="Description">{regressionSpan.description ?? ''}</Row>
        </Foo>
      </RowSplitter>
    </MatchedSpanDetails>
  );
};

const MatchedSpanDetails = styled('div')`
  padding-top: ${space(2)};
  padding-bottom: ${space(2)};
`;

const RowSplitter = styled('div')`
  display: flex;
  flex-direction: row;
`;

const Foo = (props: {children: JSX.Element}) => {
  return (
    <TableContainer>
      <table className="table key-value">
        <tbody>{props.children}</tbody>
      </table>
    </TableContainer>
  );
};

const TableContainer = styled('div')`
  width: 50%;
  min-width: 50%;
  max-width: 50%;
  flex-basis: 50%;

  outline: 1px solid red;

  padding-left: ${space(2)};
  padding-right: ${space(2)};
`;

// const MatchedSpanDetails = styled('div')`
//   display: flex;
//   flex-direction: row;

//   & > * + * {
//     border-left: 1px solid red;
//   }
// `;

export default SpanDetail;

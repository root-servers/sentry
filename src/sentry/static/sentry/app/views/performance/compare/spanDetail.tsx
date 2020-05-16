import React from 'react';
import styled from '@emotion/styled';

import {SpanDetailContainer} from 'app/components/events/interfaces/spans/spanDetail';

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
          <MatchedSpanDetails>
            <MatchedSpanDetailsChild>
              <SpanDetailContent span={span.baselineSpan} />
            </MatchedSpanDetailsChild>
            <MatchedSpanDetailsChild>
              <SpanDetailContent span={span.regressionSpan} />
            </MatchedSpanDetailsChild>
          </MatchedSpanDetails>
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

const MatchedSpanDetails = styled('div')`
  display: flex;
  flex-direction: row;

  & > * + * {
    border-left: 1px solid red;
  }
`;

const MatchedSpanDetailsChild = styled('div')`
  width: 50%;
  min-width: 50%;
  max-width: 50%;
  flex-basis: 50%;
`;

export default SpanDetail;

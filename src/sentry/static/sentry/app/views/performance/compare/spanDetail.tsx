import React from 'react';

import {
  SpanDetailContainer,
  SpanDetails,
} from 'app/components/events/interfaces/spans/spanDetail';

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
          <SpanDetails>
            <div>baseline</div>
            <div>regression</div>
          </SpanDetails>
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

export default SpanDetail;

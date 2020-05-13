import React from 'react';

import {SpanRow} from 'app/components/events/interfaces/spans/styles';
import {
  SpanRowCellContainer,
  SpanRowCell,
} from 'app/components/events/interfaces/spans/spanBar';
import {toPercent} from 'app/components/events/interfaces/spans/utils';

import {DiffSpanType, getSpanID} from './utils';

type Props = {
  span: Readonly<DiffSpanType>;
};

class SpanBar extends React.Component<Props> {
  renderTitle() {
    const {span} = this.props;

    return (
      <div>
        {getSpanID(span)} - {span.comparisonResult}
      </div>
    );
  }

  renderHeader() {
    // TODO:
    const dividerPosition = 0.5;

    return (
      <SpanRowCellContainer>
        <SpanRowCell
          style={{
            left: 0,
            width: toPercent(dividerPosition),
          }}
        >
          {this.renderTitle()}
        </SpanRowCell>
        <SpanRowCell
          style={{
            left: toPercent(dividerPosition),
            width: toPercent(1 - dividerPosition),
          }}
        >
          bar here
        </SpanRowCell>
      </SpanRowCellContainer>
    );
  }

  render() {
    return <SpanRow visible>{this.renderHeader()}</SpanRow>;
  }
}

export default SpanBar;

import React from 'react';

import {TreeDepthType} from 'app/components/events/interfaces/spans/types';
import {SpanRow} from 'app/components/events/interfaces/spans/styles';
import {
  TOGGLE_BORDER_BOX,
  SpanRowCellContainer,
  SpanRowCell,
  SpanBarTitleContainer,
  SpanBarTitle,
  OperationName,
} from 'app/components/events/interfaces/spans/spanBar';
import {toPercent} from 'app/components/events/interfaces/spans/utils';

import {DiffSpanType, getSpanID, getSpanOperation, getSpanDescription} from './utils';

type Props = {
  span: Readonly<DiffSpanType>;
  treeDepth: number;
  continuingTreeDepths: Array<TreeDepthType>;
  spanNumber: number;
};

class SpanBar extends React.Component<Props> {
  renderSpanTreeToggler = ({left}: {left: number}) => {
    return <div>toggler {left}</div>;
  };

  renderTitle() {
    const {span, treeDepth} = this.props;

    const operationName = getSpanOperation(span) ? (
      <strong>
        <OperationName spanErrors={[]}>{getSpanOperation(span)}</OperationName>
        {` \u2014 `}
      </strong>
    ) : (
      ''
    );
    const description = getSpanDescription(span) ?? getSpanID(span);

    const left = treeDepth * (TOGGLE_BORDER_BOX / 2);

    return (
      <SpanBarTitleContainer>
        {this.renderSpanTreeToggler({left})}
        <SpanBarTitle
          style={{
            left: `${left}px`,
            width: '100%',
          }}
        >
          <span>
            {operationName}
            {description}
          </span>
        </SpanBarTitle>
      </SpanBarTitleContainer>
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

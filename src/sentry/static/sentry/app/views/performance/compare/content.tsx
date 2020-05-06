import React from 'react';
import styled from '@emotion/styled';

import {Event} from 'app/types';
import {Panel} from 'app/components/panels';
import {ContentBox, HeaderBox} from 'app/utils/discover/styles';
import overflowEllipsis from 'app/styles/overflowEllipsis';

import TraceView from './traceView';

type Props = {
  baselineEvent: Event;
  regressionEvent: Event;
};

class TransactionComparisonContent extends React.Component<Props> {
  render() {
    const {baselineEvent, regressionEvent} = this.props;

    return (
      <React.Fragment>
        <HeaderBox>
          <div>breadcrumb here</div>
          <StyledTitleHeader>transaction name</StyledTitleHeader>
        </HeaderBox>
        <ContentBox>
          <Panel>
            <TraceView baselineEvent={baselineEvent} regressionEvent={regressionEvent} />
          </Panel>
        </ContentBox>
      </React.Fragment>
    );
  }
}

// TODO: move to styles.tsx
const StyledTitleHeader = styled('span')`
  font-size: ${p => p.theme.headerFontSize};
  color: ${p => p.theme.gray4};
  grid-column: 1/2;
  align-self: center;
  min-height: 30px;
  ${overflowEllipsis};
`;

export default TransactionComparisonContent;

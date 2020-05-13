import React from 'react';
import styled from '@emotion/styled';

import {Event} from 'app/types';
import {Panel} from 'app/components/panels';
import {ContentBox, HeaderBox} from 'app/utils/discover/styles';
import overflowEllipsis from 'app/styles/overflowEllipsis';

import TraceView from './traceView';
import TransactionSummary from './transactionSummary';

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
          <TransactionSummary
            baselineEvent={baselineEvent}
            regressionEvent={regressionEvent}
          />
        </HeaderBox>
        <ContentBox>
          <StyledPanel>
            <TraceView baselineEvent={baselineEvent} regressionEvent={regressionEvent} />
          </StyledPanel>
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

const StyledPanel = styled(Panel)`
  grid-column: 1 / span 2;
`;

export default TransactionComparisonContent;

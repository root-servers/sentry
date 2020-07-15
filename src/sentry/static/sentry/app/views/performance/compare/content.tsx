import React from 'react';
import styled from '@emotion/styled';

import {Event} from 'app/types';
import {Panel} from 'app/components/panels';
import overflowEllipsis from 'app/styles/overflowEllipsis';
import * as Layout from 'app/components/layouts/thirds';

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
        <Layout.Header>
          <Layout.HeaderContent>
            <div>breadcrumb here</div>
            <StyledTitleHeader>transaction name</StyledTitleHeader>
            <TransactionSummary
              baselineEvent={baselineEvent}
              regressionEvent={regressionEvent}
            />
          </Layout.HeaderContent>
        </Layout.Header>
        <Layout.Body>
          <StyledPanel>
            <TraceView baselineEvent={baselineEvent} regressionEvent={regressionEvent} />
          </StyledPanel>
        </Layout.Body>
      </React.Fragment>
    );
  }
}

// TODO: move to styles.tsx
const StyledTitleHeader = styled('span')`
  font-size: ${p => p.theme.headerFontSize};
  color: ${p => p.theme.gray400};
  grid-column: 1/2;
  align-self: center;
  min-height: 30px;
  ${overflowEllipsis};
`;

const StyledPanel = styled(Panel)`
  grid-column: 1 / span 2;
`;

export default TransactionComparisonContent;

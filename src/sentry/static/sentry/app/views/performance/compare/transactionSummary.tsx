import React from 'react';
import styled from '@emotion/styled';

import {Event} from 'app/types';
import space from 'app/styles/space';

import {isTransactionEvent} from './utils';

type Props = {
  baselineEvent: Event;
  regressionEvent: Event;
};

class TransactionSummary extends React.Component<Props> {
  render() {
    const {baselineEvent, regressionEvent} = this.props;

    if (!isTransactionEvent(baselineEvent) || !isTransactionEvent(regressionEvent)) {
      // TODO: better error
      return null;
    }

    // const baselineTraceContext = getTraceContext(baselineEvent);
    // const regressionTraceContext = getTraceContext(regressionEvent);

    return (
      <div>
        <EventRow>
          <Baseline /> baseline event: {baselineEvent.eventID}
        </EventRow>
        <EventRow>
          <Regression /> regressive event: {regressionEvent.eventID}
        </EventRow>
      </div>
    );
  }
}

const EventRow = styled('div')`
  display: flex;
`;

const Baseline = styled('div')`
  background-color: ${p => p.theme.purple300};
  height: 40px;
  width: 4px;

  margin-right: ${space(1)};
`;

const Regression = styled('div')`
  background-color: ${p => p.theme.gray5};
  height: 40px;
  width: 4px;

  margin-right: ${space(1)};
`;

export default TransactionSummary;

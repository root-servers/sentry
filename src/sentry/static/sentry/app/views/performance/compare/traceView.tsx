import React from 'react';

import {Event} from 'app/types';
import {getTraceContext} from 'app/components/events/interfaces/spans/utils';

import {isTransactionEvent} from './utils';

type Props = {
  baselineEvent: Event;
  regressionEvent: Event;
};

class TraceView extends React.Component<Props> {
  render() {
    const {baselineEvent, regressionEvent} = this.props;

    if (!isTransactionEvent(baselineEvent) || !isTransactionEvent(regressionEvent)) {
      // TODO: better error
      return <div>One of the given events is not a transaction.</div>;
    }

    const baselineTraceContext = getTraceContext(baselineEvent);
    const regressionTraceContext = getTraceContext(regressionEvent);

    if (!baselineTraceContext || !regressionTraceContext) {
      // TODO: better error
      return <div>There is no trace found in either of the given transactions.</div>;
    }

    return <div>traceview</div>;
  }
}

export default TraceView;

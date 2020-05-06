import React from 'react';

import {Event} from 'app/types';

type Props = {
  baselineEvent: Event;
  regressionEvent: Event;
};

class TraceView extends React.Component<Props> {
  render() {
    return <div>traceview</div>;
  }
}

export default TraceView;

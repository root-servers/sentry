import React from 'react';

import {DiffSpanType, getSpanID} from './utils';

type Props = {
  span: Readonly<DiffSpanType>;
};

class SpanBar extends React.Component<Props> {
  render() {
    const {span} = this.props;

    return (
      <div>
        {getSpanID(span)} - {span.comparisonResult}
      </div>
    );
  }
}

export default SpanBar;

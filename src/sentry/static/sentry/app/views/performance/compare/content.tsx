import React from 'react';

import {Event} from 'app/types';

type Props = {
  baselineEvent: Event;
  regressionEvent: Event;
};

class TransactionComparisonContent extends React.Component<Props> {
  render() {
    console.log('props', this.props);
    return <div>foo</div>;
  }
}

export default TransactionComparisonContent;

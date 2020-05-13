import React from 'react';

import {DiffSpanType} from './utils';
import SpanBar from './spanBar';

type Props = {
  span: Readonly<DiffSpanType>;
  renderedSpanChildren: Array<JSX.Element>;
};

type State = {
  showSpanTree: boolean;
};

class SpanGroup extends React.Component<Props, State> {
  state: State = {
    showSpanTree: true,
  };

  toggleSpanTree = () => {
    this.setState(state => ({
      showSpanTree: !state.showSpanTree,
    }));
  };

  renderSpanChildren = () => {
    if (!this.state.showSpanTree) {
      return null;
    }

    return this.props.renderedSpanChildren;
  };

  render() {
    const {span} = this.props;

    return (
      <React.Fragment>
        <SpanBar span={span} />
        {this.renderSpanChildren()}
      </React.Fragment>
    );
  }
}

export default SpanGroup;

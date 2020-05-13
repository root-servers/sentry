import React from 'react';

import {TreeDepthType} from 'app/components/events/interfaces/spans/types';

import {DiffSpanType} from './utils';
import SpanBar from './spanBar';

type Props = {
  span: Readonly<DiffSpanType>;
  renderedSpanChildren: Array<JSX.Element>;
  treeDepth: number;
  continuingTreeDepths: Array<TreeDepthType>;
  spanNumber: number;
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
    const {span, treeDepth, continuingTreeDepths, spanNumber} = this.props;

    return (
      <React.Fragment>
        <SpanBar
          span={span}
          treeDepth={treeDepth}
          continuingTreeDepths={continuingTreeDepths}
          spanNumber={spanNumber}
        />
        {this.renderSpanChildren()}
      </React.Fragment>
    );
  }
}

export default SpanGroup;

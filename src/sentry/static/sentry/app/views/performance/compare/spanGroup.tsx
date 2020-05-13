import React from 'react';

type Props = {
  renderedSpanChildren: Array<JSX.Element>;
};

class SpanGroup extends React.Component<Props> {
  render() {
    return <div>group</div>;
  }
}

export default SpanGroup;

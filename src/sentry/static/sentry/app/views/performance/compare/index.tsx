import React from 'react';
import {Params} from 'react-router/lib/Router';
import {Location} from 'history';

type Props = {
  location: Location;
  params: Params;
};

class CompareContainer extends React.Component<Props> {
  render() {
    console.log('props', this.props);
    return <div>compare transactions</div>;
  }
}

export default CompareContainer;

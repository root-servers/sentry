import React from 'react';
import {Params} from 'react-router/lib/Router';
import {Location} from 'history';

import FetchEvent from './fetchEvent';

type Props = {
  location: Location;
  params: Params;
};

class CompareContainer extends React.Component<Props> {
  render() {
    console.log('props', this.props);
    return (
      <div>
        <div>compare transactions</div>
        <FetchEvent />
      </div>
    );
  }
}

export default CompareContainer;

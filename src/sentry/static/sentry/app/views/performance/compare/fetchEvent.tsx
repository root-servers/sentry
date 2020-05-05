import React from 'react';

import {Client} from 'app/api';
import withApi from 'app/utils/withApi';

type Props = {
  api: Client;

  eventSlug: string;
};

class FetchEvent extends React.Component<Props> {
  render() {
    return <div>FetchEvent</div>;
  }
}

export default withApi(FetchEvent);

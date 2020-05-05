import React from 'react';

import {Client} from 'app/api';
import withApi from 'app/utils/withApi';
import {Event} from 'app/types';

type ChildrenProps = {
  isLoading: boolean;
  error: null | string;
  event: Event | undefined;
};

type Props = {
  api: Client;

  orgSlug: string;
  eventSlug: string;
};

type State = {
  tableFetchID: symbol | undefined;
} & ChildrenProps;

class FetchEvent extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    tableFetchID: undefined,
    error: null,

    event: undefined,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: Props) {
    const orgSlugChanged = prevProps.orgSlug !== this.props.orgSlug;
    const eventSlugChanged = prevProps.eventSlug !== this.props.eventSlug;

    if (!this.state.isLoading && (orgSlugChanged || eventSlugChanged)) {
      this.fetchData();
    }
  }

  fetchData() {
    const {orgSlug, eventSlug} = this.props;

    // note: eventSlug is of the form <project-slug>:<event-id>

    const url = `/organizations/${orgSlug}/events/${eventSlug}/`;
  }

  render() {
    return <div>FetchEvent</div>;
  }
}

export default withApi(FetchEvent);

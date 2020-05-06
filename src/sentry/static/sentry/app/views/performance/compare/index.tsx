import React from 'react';
import {Params} from 'react-router/lib/Router';
import {Location} from 'history';

import withOrganization from 'app/utils/withOrganization';
import {Organization, Event} from 'app/types';

import FetchEvent, {ChildrenProps} from './fetchEvent';

type Props = {
  location: Location;
  params: Partial<Params>;
  organization: Organization;
};

class TransactionComparisonPage extends React.PureComponent<Props> {
  getEventSlugs() {
    let {baselineEventSlug, regressionEventSlug} = this.props.params;

    baselineEventSlug =
      typeof baselineEventSlug === 'string' ? baselineEventSlug.trim() : undefined;
    regressionEventSlug =
      typeof regressionEventSlug === 'string' ? regressionEventSlug.trim() : undefined;

    return {
      baselineEventSlug,
      regressionEventSlug,
    };
  }

  fetchEvent(
    eventSlug: string | undefined,
    renderFunc: (props: ChildrenProps) => React.ReactNode
  ) {
    if (!eventSlug) {
      return null;
    }

    const {organization} = this.props;

    return (
      <FetchEvent orgSlug={organization.slug} eventSlug={eventSlug}>
        {renderFunc}
      </FetchEvent>
    );
  }

  renderComparison(baselineEvent: Event, regressionEvent: Event): React.ReactNode {
    console.log('baselineEvent', baselineEvent);
    console.log('regressionEvent', regressionEvent);
    return <div>renderComparison</div>;
  }

  render() {
    console.log('props', this.props);

    const {baselineEventSlug, regressionEventSlug} = this.getEventSlugs();

    return (
      <div>
        <div>compare transactions</div>
        {this.fetchEvent(baselineEventSlug, baselineEventResults => {
          return this.fetchEvent(regressionEventSlug, regressionEventResults => {
            if (
              baselineEventResults.isLoading ||
              baselineEventResults.error ||
              !baselineEventResults.event ||
              regressionEventResults.isLoading ||
              regressionEventResults.error ||
              !regressionEventResults.event
            ) {
              // TODO: better UI handling
              return null;
            }

            return this.renderComparison(
              baselineEventResults.event,
              regressionEventResults.event
            );
          });
        })}
      </div>
    );
  }
}

export default withOrganization(TransactionComparisonPage);

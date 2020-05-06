import React from 'react';
import {Params} from 'react-router/lib/Router';
import {Location} from 'history';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import withOrganization from 'app/utils/withOrganization';
import {Organization} from 'app/types';
import {PageContent} from 'app/styles/organization';
import LightWeightNoProjectMessage from 'app/components/lightWeightNoProjectMessage';
import SentryDocumentTitle from 'app/components/sentryDocumentTitle';

import FetchEvent, {ChildrenProps} from './fetchEvent';
import TransactionComparisonContent from './content';

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

  renderComparison(
    baselineEventSlug: string | undefined,
    regressionEventSlug: string | undefined
  ): React.ReactNode {
    return this.fetchEvent(baselineEventSlug, baselineEventResults => {
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

        return (
          <TransactionComparisonContent
            baselineEvent={baselineEventResults.event}
            regressionEvent={regressionEventResults.event}
          />
        );
      });
    });
  }

  getDocumentTitle(
    baselineEventSlug: string | undefined,
    regressionEventSlug: string | undefined
  ): string {
    if (
      typeof baselineEventSlug === 'string' &&
      typeof regressionEventSlug === 'string'
    ) {
      // TODO: fix translation
      const title = `Comparing ${baselineEventSlug} to ${regressionEventSlug}`;

      return [title, t('Performance')].join(' - ');
    }

    return [t('Transaction Comparison'), t('Performance')].join(' - ');
  }

  render() {
    const {organization} = this.props;
    const {baselineEventSlug, regressionEventSlug} = this.getEventSlugs();

    return (
      <SentryDocumentTitle
        title={this.getDocumentTitle(baselineEventSlug, regressionEventSlug)}
        objSlug={organization.slug}
      >
        <React.Fragment>
          <StyledPageContent>
            <LightWeightNoProjectMessage organization={organization}>
              {this.renderComparison(baselineEventSlug, regressionEventSlug)}
            </LightWeightNoProjectMessage>
          </StyledPageContent>
        </React.Fragment>
      </SentryDocumentTitle>
    );
  }
}

const StyledPageContent = styled(PageContent)`
  padding: 0;
`;

export default withOrganization(TransactionComparisonPage);

import React from 'react';
import styled from '@emotion/styled';
import {
  List,
  ListRowProps,
  CellMeasurer,
  CellMeasurerCache,
  AutoSizer,
} from 'react-virtualized';

import {aroundContentStyle} from './styles';
import ListHeader from './listHeader';
import ListBody from './listBody';
import {BreadcrumbsWithDetails} from './types';

const LIST_MAX_HEIGHT = 400;

type Props = {
  onSwitchTimeFormat: () => void;
  breadcrumbs: BreadcrumbsWithDetails;
  relativeTime: string;
} & Omit<React.ComponentProps<typeof ListBody>, 'breadcrumb' | 'isLastItem' | 'column'>;

type State = {
  isLoading: boolean;
};

const cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 42,
});

class ListContainer extends React.Component<Props, State> {
  componentWillReceiveProps() {
    this.updateGrid();
  }

  componentDidUpdate() {
    this.updateGrid();
  }

  wrapperRef = React.createRef<HTMLDivElement>();
  listRef: List | null = null;

  updateGrid = () => {
    if (this.listRef) {
      cache.clearAll();
      this.listRef.forceUpdateGrid();
    }
  };

  renderBody(breadcrumb: BreadcrumbsWithDetails[0]) {
    const {
      event,
      orgId,
      searchTerm,
      breadcrumbs,
      relativeTime,
      displayRelativeTime,
    } = this.props;
    return (
      <ListBody
        orgId={orgId}
        searchTerm={searchTerm}
        breadcrumb={breadcrumb}
        event={event}
        relativeTime={relativeTime}
        displayRelativeTime={displayRelativeTime}
        isLastItem={breadcrumbs[breadcrumbs.length - 1].id === breadcrumb.id}
      />
    );
  }

  renderRow = ({index, key, parent, style}: ListRowProps) => (
    <CellMeasurer
      cache={cache}
      columnIndex={0}
      key={key}
      parent={parent}
      rowIndex={index}
    >
      {({measure}) => (
        <Row style={style} onLoad={measure}>
          {this.renderBody(this.props.breadcrumbs[index])}
        </Row>
      )}
    </CellMeasurer>
  );

  render() {
    const {breadcrumbs, displayRelativeTime, onSwitchTimeFormat} = this.props;

    return (
      <Wrapper ref={this.wrapperRef}>
        <Row>
          <ListHeader
            displayRelativeTime={!!displayRelativeTime}
            onSwitchTimeFormat={onSwitchTimeFormat}
          />
        </Row>
        <AutoSizer disableHeight onResize={this.updateGrid}>
          {({width}) => (
            <StyledList
              ref={(el: List | null) => {
                this.listRef = el;
              }}
              deferredMeasurementCache={cache}
              height={LIST_MAX_HEIGHT}
              overscanRowCount={5}
              rowCount={breadcrumbs.length}
              rowHeight={cache.rowHeight}
              rowRenderer={this.renderRow}
              width={width}
              scrollToIndex={breadcrumbs.length - 1}
              scrollToAlignment="end"
            />
          )}
        </AutoSizer>
      </Wrapper>
    );
  }
}

export default ListContainer;

const Wrapper = styled('div')`
  overflow: auto hidden;
  ${aroundContentStyle}
`;

const StyledList = styled(List)<{height: number}>`
  height: auto !important;
  max-height: ${p => p.height}px;
  overflow-y: auto !important;
`;

const Row = styled('div')`
  display: grid;
  grid-template-columns: 45px minmax(55px, 1fr) 6fr 86px 67px;
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    grid-template-columns: 63px minmax(132px, 1fr) 6fr 75px 83px;
  }
`;

import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from 'react-bootstrap';

import { getAnchoredRowFormatter } from './util';

const propTypes = {
  scannedItems: React.PropTypes.arrayOf(React.PropTypes.object),
};

const contextTypes = {
  history: PropTypes.object,
};

const itemListFormatter = {
  title: loan => `${_.get(loan, ['item', 'title'])}`,
  barcode: loan => `${_.get(loan, ['item', 'barcode'])}`,
  'Date loaned': loan => loan.loanDate.substr(0, 10),
  'Date due': loan => loan.dueDate.substr(0, 10),
};

class ItemView extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  onSelectRow(e, item) {
    this.context.history.push(`/items/view/${item.itemId}`);
  }

  render() {
    const scannedItems = this.props.scannedItems;

    return (
      <MultiColumnList
        id="list-items-checked-out"
        visibleColumns={['title', 'barcode', 'Date loaned', 'Date due']}
        rowMetadata={['id']}
        contentData={scannedItems}
        formatter={itemListFormatter}
        isEmptyMessage="No items have been entered yet."
        fullwidth
        rowFormatter={getAnchoredRowFormatter}
        onRowClick={this.onSelectRow}
      />
    );
  }
}

ItemView.propTypes = propTypes;
ItemView.contextTypes = contextTypes;

export default ItemView;
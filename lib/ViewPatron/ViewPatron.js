import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-bootstrap';

import ProxyModal from '../ProxyModal';
import UserDetail from '../UserDetail';
import css from './ViewPatron.css';

class ViewPatron extends React.Component {

  static propTypes = {
    stripes: PropTypes.object,
    patron: React.PropTypes.object,
    proxy: React.PropTypes.object,
    onSelectPatron: PropTypes.func,
    onClearPatron: PropTypes.func,
    resources: PropTypes.shape({
      sponsors: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: React.PropTypes.shape({
      sponorQuery: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
  };

  static manifest = Object.freeze({
    sponorQuery: {
      initialValue: {},
    },
    sponsors: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{sponorQuery.ids})',
    },
    openLoansCount: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans?query=(userId=!{patron.id} and status.name<>Closed)&limit=1',
      },
    },
  });

  constructor(props) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
    this.onContinue = this.onContinue.bind(this);
    this.onClose = this.onClose.bind(this);
    this.connectedUserDetail = props.stripes.connect(UserDetail);
    this.state = { showModal: false };
  }

  componentDidMount() {
    const { patron, onSelectPatron } = this.props;
    const hasProxy = !!(patron.proxyFor.length);

    if (hasProxy) {
      this.toggleModal(true);
    } else {
      onSelectPatron(patron);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { patron, resources: { sponorQuery }, mutator } = nextProps;
    const hasProxy = !!(patron.proxyFor.length);

    if (patron.id !== this.props.patron.id) {
      this.toggleModal(hasProxy);
    }

    if (!hasProxy) return;

    const ids = patron.proxyFor.map(id => `id=${id}`).join(' or ');
    if (sponorQuery.patronId !== patron.id || sponorQuery.ids !== ids) {
      mutator.sponorQuery.replace({ ids, patronId: patron.id });
    }
  }

  onContinue(data) {
    const { resources, onSelectPatron, patron } = this.props;
    const sponsors = (resources.sponsors || {}).records || [];
    const selPatron = (patron.id === data.sponsorId)
      ? patron
      : _.find(sponsors, s => s.id === data.sponsorId);

    onSelectPatron(selPatron);
    this.toggleModal(false);
  }

  onClose() {
    this.toggleModal(false);
    this.props.onClearPatron();
  }

  toggleModal(showModal) {
    this.setState({ showModal });
  }

  render() {
    const { patron, proxy, resources } = this.props;
    const sponsors = (resources.sponsors || {}).records || [];
    const openLoansCount = _.get(resources.openLoansCount, ['records', '0', 'totalRecords'], 0);
    const showModal = this.state.showModal;
    const patronDetail = (
      <div>
        <br />
        <this.connectedUserDetail id="patron-detail" label="Patron" user={patron} {...this.props} />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Open Loans" value={openLoansCount} />
            </Col>
          </Row>
        </div>
      </div>
    );

    const proxyDetail = (
      <div>
        <br />
        <this.connectedUserDetail id="proxy-detail" label="Proxy" user={proxy} {...this.props} />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue label="Proxy Expiration" value="-" />
            </Col>
          </Row>
        </div>
      </div>
    );

    return (
      <div>
        {!showModal && patronDetail}
        {!showModal && proxy.id && proxy.id !== patron.id && proxyDetail}
        <ProxyModal
          patron={patron}
          sponsors={sponsors}
          open={showModal}
          onContinue={this.onContinue}
          onClose={this.onClose}
        />
      </div>
    );
  }
}

export default ViewPatron;

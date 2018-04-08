import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  Icon,
  Header,
  Button,
  Table,
  Label,
  Checkbox,
  Responsive,
  Divider
} from 'semantic-ui-react';
import { formatIOTAAmount } from '../utils';

class TXTable extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.state = {
      hideZero: true
    };
  }
  render() {
    const { address, page } = this.props;
    const { hideZero } = this.state;
    const txs = (address
      ? Object.values(address.transactions)
      : Object.values(page.page.addresses)
          .map(a => Object.values(a.transactions))
          .reduce((t, i) => t.concat(i), [])
    ).filter(t => !hideZero || t.value !== 0);

    return (
      <Table striped stackable compact fixed attached='top'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={8}>Transaction</Table.HeaderCell>
            <Responsive as={Table.HeaderCell} width={5} maxWidth={767}>
              Tag
            </Responsive>
            <Table.HeaderCell width={4}>View</Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width={3}>
              <Checkbox
                toggle
                checked={hideZero}
                label="Value"
                onChange={() => this.setState({ hideZero: !hideZero })}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {this.renderRows(this._sortTXs(txs))}
      </Table>
    );
  }

  renderRows(txs) {
    return <Table.Body>{txs.map(this.renderRow)}</Table.Body>;
  }

  renderRow(tx) {
    const confirmed = tx.persistence;
    const icon = confirmed ? (
      <Icon name="check" color="green" />
    ) : (
      <Icon name="close" color="yellow" />
    );
    const color = tx.value > 0 ? 'green' : tx.value < 0 ? 'red' : 'grey';

    const buttons = (mini) => (
      <Button.Group fluid>
        <Button
          Button    icon
          size="tiny"
          onClick={() =>
            window.open(
              `https://thetangle.org/transaction/${tx.hash}`,
              '_blank'
            )
          }
        >
          { mini
            ? <span><Icon name="external" /> &nbsp; TN</span>
            : <span><Icon name="external" /> &nbsp; Transaction</span>
          }
        </Button>
        <Button
          icon
          size="tiny"
          onClick={() =>
            window.open(`https://thetangle.org/bundle/${tx.bundle}`, '_blank')
          }
        >
          { mini
            ? <span><Icon name="external" /> &nbsp; BN</span>
            : <span><Icon name="external" /> &nbsp; Bundle</span>
          }
        </Button>
      </Button.Group>
    );

    return (
      <Table.Row
        key={tx.hash}
        negative={tx.value < 0}
        positive={tx.value > 0}
        warning={!confirmed}
      >
        <Table.Cell className="ellipsible" width={8}>
          <Header as="h4" textAlign="left">
            {icon}
            <Header.Content>
              {new Date(tx.timestamp * 1000).toLocaleString()}
              <Responsive as={Label} minWidth={1201}>
                <Icon name="tag" />
                {tx.tag}
              </Responsive>
              <Responsive as={Label} minWidth={830} maxWidth={960}>
                <Icon name="tag" />
                {tx.tag}
              </Responsive>
            </Header.Content>
          </Header>
        </Table.Cell>
        <Responsive as={Table.Cell} maxWidth={767} width={4}>
          <Label>
            <Icon name="tag" />
            {tx.tag}
          </Label>
        </Responsive>
        <Table.Cell width={5}>
          <Responsive maxWidth={767}>
            {buttons(false)}
          </Responsive>
          <Responsive minWidth={768} maxWidth={1200}>
            {buttons(true)}
          </Responsive>
          <Responsive minWidth={1201}>
            {buttons(false)}
          </Responsive>
        </Table.Cell>
        <Table.Cell textAlign="right" width={3}>
          <Responsive maxWidth={767}>
            <Divider/>
          </Responsive>
          <Header as="h2" textAlign="right" color={color}>
            {formatIOTAAmount(tx.value).short}
          </Header>
        </Table.Cell>
      </Table.Row>
    );
  }

  _sortTXs(txs) {
    return txs.sort((a, b) => b.timestamp - a.timestamp);
  }

  _shorten(txt, length = 54) {
    return `${txt.slice(0, length)}...`;
  }
}

export default withRouter(TXTable);

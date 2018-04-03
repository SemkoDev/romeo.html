import React from 'react'
import { withRouter } from 'react-router-dom'
import { Icon, Header, Button, Table, Label, Checkbox } from 'semantic-ui-react'
import { get } from '../romeo'
import { formatIOTAAmount } from '../utils'

class TXTable extends React.Component {
  constructor (props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.state = {
      hideZero: true
    }
  }
  render () {
    const { address, page } = this.props;
    const { hideZero } = this.state;
    const txs = (address
      ? Object.values(address.transactions)
      : Object.values(page.page.addresses)
        .map(a => Object.values(a.transactions))
        .reduce((t, i) => t.concat(i), []))
        .filter(t => !hideZero || t.value !== 0);

    return (
      <Table celled stackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Transaction</Table.HeaderCell>
            <Table.HeaderCell>View</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>
              <Checkbox toggle checked={hideZero} label='Value'
                onChange={() => this.setState({ hideZero: !hideZero })}/>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {this.renderRows(this._sortTXs(txs))}
      </Table>
    )
  }

  renderRows(txs) {
    return <Table.Body>{txs.map(this.renderRow)}</Table.Body>
  }

  renderRow (tx) {
    const confirmed = tx.persistence;
    const icon = confirmed
      ? <Icon name='check' color='green' />
      : <Icon name='close' color='yellow' />;
    const color = tx.value > 0
      ? 'green'
      : tx.value < 0
        ? 'red'
        : 'grey';

    return (
      <Table.Row key={tx.hash} negative={tx.value < 0}
        positive={tx.value > 0} warning={!confirmed}>
        <Table.Cell className='ellipsible'>
          <Header as='h4' textAlign='left'>
            {icon}
            <Header.Content>
              {(new Date(tx.timestamp*1000)).toLocaleString()}
              <Label>
                <Icon name='tag' />
                {tx.tag}
              </Label>
            </Header.Content>
          </Header>
        </Table.Cell>
        <Table.Cell>
          <Button icon size='tiny' onClick={() => window.open(`https://thetangle.org/transaction/${tx.hash}`, '_blank')}>
            <Icon name='external'/> &nbsp;
            Transaction
          </Button>
          <Button icon size='tiny' onClick={() => window.open(`https://thetangle.org/bundle/${tx.bundle}`, '_blank')}>
            <Icon name='external'/> &nbsp;
            Bundle
          </Button>
        </Table.Cell>
        <Table.Cell textAlign='right'>
          <Header as='h2' textAlign='right' color={color}>
            {tx.value}
          </Header>
        </Table.Cell>
      </Table.Row>
    )
  }

  _sortTXs (txs) {
    return txs.sort((a, b) => b.timestamp - a.timestamp)
  }

  _shorten (txt, length=54) {
    return `${txt.slice(0, length)}...`
  }
}

export default withRouter(TXTable);

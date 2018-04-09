import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import {
  Grid,
  Message,
  Header,
  Icon,
  Step,
  Form,
  Divider,
  Button,
  Segment
} from 'semantic-ui-react';
import Nav from '../components/nav';
import { get, showInfo } from '../romeo';
import { searchSpentAddressThunk } from '../reducers/ui';
import { formatIOTAAmount } from '../utils';
import deepHoc from '../components/deep-hoc';

import classes from './transfer.css';

const UNITS = [
  { key: 'i', text: 'i', value: 1 },
  { key: 'k', text: 'Ki', value: 1000 },
  { key: 'm', text: 'Mi', value: 1000000 },
  { key: 'g', text: 'Gi', value: 1000000000 },
  { key: 't', text: 'Ti', value: 1000000000000 }
];

class Transfer extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;
    this.state = {
      maxStep: 0,
      currentStep: 0,
      address: (location && location.state && location.state.address) || '',
      value: 0,
      unit: 1000000,
      donationAddress: this.props.donationAddress,
      donationValue: 0,
      donationUnit: 1000000,
      tag: '',
      sending: false
    };
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleChange0 = this.handleChange0.bind(this);
    this.sendTransfer = this.sendTransfer.bind(this);
    this.romeo = get();
    this.pageObject = this.romeo.pages.getByIndex(props.currentIndex).page;
  }

  componentWillReceiveProps (props) {
    const { currentIndex } = props;
    if (currentIndex !== this.props.currentIndex) {
      this.pageObject = this.romeo.pages.getByIndex(currentIndex).page;
    }
  }

  render() {
    const { currentStep, sending } = this.state;
    return (
      <span>
        <Nav />
        <Segment basic style={{ padding: 0 }} loading={sending}>
          {this.renderSteps()}
          {this[`renderStep${currentStep}`]()}
        </Segment>
      </span>
    );
  }

  renderSteps() {
    const { currentStep, maxStep, sending } = this.state;
    const selectStep = index => {
      if (sending || currentStep === index || maxStep < index) return;
      this.setState({ currentStep: index });
    };
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column computer={8} tablet={16} mobile={16}>
            <Step.Group fluid>
              <Step
                active={currentStep === 0}
                disabled={sending || maxStep < 0}
                completed={maxStep > 0}
                onClick={() => selectStep(0)}
              >
                <Icon name="send" />
                <Step.Content>
                  <Step.Title>Destination</Step.Title>
                  <Step.Description>Address and value</Step.Description>
                </Step.Content>
              </Step>

              <Step
                active={currentStep === 1}
                disabled={sending || maxStep < 1}
                completed={maxStep > 1}
                onClick={() => selectStep(1)}
              >
                <Icon name="payment" />
                <Step.Content>
                  <Step.Title>Source</Step.Title>
                  <Step.Description>Page addresses to use</Step.Description>
                </Step.Content>
              </Step>

              <Step
                active={currentStep === 2}
                disabled={sending || maxStep < 2}
                completed={maxStep > 2}
                onClick={() => selectStep(2)}
              >
                <Icon name="info" />
                <Step.Content>
                  <Step.Title>Confirm transfer</Step.Title>
                </Step.Content>
              </Step>
            </Step.Group>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderStep0() {
    const {
      ui: {
        searchSpentAddress,
        searchSpentAddressError,
        spentAddress,
        spentAddressResult
      },
      page: { page: { balance: pageBalance }}
    } = this.props;
    const { value, address, unit, tag } = this.state;
    const totalValue = value * unit;
    const formattedValue = formatIOTAAmount(totalValue).short;
    const validTag = !tag.length || this.romeo.iota.valid.isTrytes(tag);
    let validAddress = false;
    try {
      validAddress = this.romeo.iota.utils.isValidChecksum(address);
    } catch (e) {
      validAddress = false;
    }
    let searchingSpent = false;
    let searchingError = false;
    let usedAddress = false;
    if (spentAddress === address) {
      searchingSpent = searchSpentAddress;
      searchingError = searchSpentAddressError;
      usedAddress = spentAddressResult && !searchingSpent;
    }

    const enoughBalance = totalValue <= pageBalance;
    const color = totalValue >= 0 && enoughBalance ? 'green' : 'red';
    const addressInfo = validAddress ? null : (
      <Grid.Row>
        <Grid.Column computer={12} tablet={16} mobile={16}>
          <Message
            info
            icon="at"
            header="Make sure your address is correct!"
            content={
              <span>
                Only addresses with checksums are allowed (81-character address
                + 9-character checksum). An address consists of uppercase
                letters (A-Z) and the digit 9.
              </span>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
    const spentAddressInfo = usedAddress ? (
      <Grid.Row>
        <Grid.Column computer={12} tablet={16} mobile={16}>
          <Message
            error
            icon="at"
            header="This address should not be used!"
            content={
              <span>
                The balance on this address has already been spent. Transferring
                again to a spent address is discouraged, since it poses problems
                for the receiving party to securely retrieve the funds you are
                sending, leading to a potential loss of these funds.
                <br />
                <br />
                Please ask the receiving party to provide you with a new,
                unspent address!
              </span>
            }
          />
        </Grid.Column>
      </Grid.Row>
    ) : null;
    const spentAddressErrorInfo = searchingError ? (
      <Grid.Row>
        <Grid.Column computer={12} tablet={16} mobile={16}>
          <Message
            error
            icon="at"
            header="Could not determine the address state!"
            content={
              <span>
                There was a problem checking, whether this address has been
                spent from. Since sending to a spent address poses security
                problem for the receiving party, leading to a potential loss of
                funds, make sure this address has not been spent. Do not send
                unless 100% sure!
                <br />
                <br />
                Try refreshing the page, make sure you have internet connection
                and try again!
              </span>
            }
          />
        </Grid.Column>
      </Grid.Row>
    ) : null;
    const balanceInfo =
      enoughBalance && totalValue >= 0 ? null : (
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16}>
            <Message
              info
              icon="balance"
              header="How many IOTAs do you want to send?"
              content={
                <span>
                  Negative-value transactions are not allowed. Also,
                  make sure that your page balance is enough to make that
                  transfer.
                </span>
              }
            />
          </Grid.Column>
        </Grid.Row>
      );

    return (
      <span>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Form>
                <Form.Group>
                  <Form.Input
                    fluid
                    label="Address"
                    onChange={this.handleAddressChange}
                    loading={searchingSpent}
                    error={!validAddress || searchingError || usedAddress}
                    value={address}
                    placeholder="XYZ"
                    width={9}
                    name="address"
                    maxLength={90}
                  />
                  <Form.Input
                    fluid
                    label="Tag"
                    onChange={this.handleChange0}
                    error={!validTag}
                    value={tag}
                    placeholder="XYZ"
                    width={3}
                    name="tag"
                    maxLength={27}
                  />
                  <Form.Input
                    fluid
                    label="Value"
                    onChange={this.handleChange0}
                    error={value<0}
                    value={value}
                    width={2}
                    name="value"
                    type="number"
                    min="0"
                  />
                  <Form.Select
                    fluid
                    label="Unit"
                    onChange={this.handleChange0}
                    options={UNITS}
                    name="unit"
                    value={unit}
                    width={2}
                  />
                </Form.Group>
              </Form>
            </Grid.Column>
            <Grid.Column width={4}>
              <Header
                as="h2"
                textAlign="right"
                color={color}
                className="valueDisplay"
              >
                <Header.Content>
                  {formattedValue}
                  <Header.Subheader>
                    {!enoughBalance && 'Not enough balance!'}
                    {totalValue < 0 && 'Input a positive value!'}
                  </Header.Subheader>
                </Header.Content>
              </Header>
            </Grid.Column>
          </Grid.Row>
          {spentAddressInfo}
          {addressInfo}
          {balanceInfo}
          {spentAddressErrorInfo}
        </Grid>
        {this.renderDonation()}
        {this.renderTotalStep0(validAddress, validTag)}
      </span>
    );
  }

  renderStep1() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16}>
            <Message
              info
              icon="at"
              header="Automatic address selection enabled"
              content={
                <span>
                  The source/input addresses to cover the total transfer value
                  will be selected automatically. Optional manual selection
                  coming soon!
                </span>
              }
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16} textAlign="right">
            <Divider />
            <Button
              color="olive"
              size="large"
              onClick={() =>
                this.setState({
                  currentStep: 2,
                  maxStep: 2
                })
              }
            >
              <Icon name="info" /> &nbsp; Next: Confirm transfer
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderStep2() {
    const {
      value,
      unit,
      donationValue,
      donationUnit,
      address,
      donationAddress,
      tag
    } = this.state;
    const totalTransfer = value * unit;
    const totalDonation = donationValue * donationUnit;

    const transferInfo =
      totalTransfer >= 0 ? (
        <Message
          info
          icon="send"
          className='dont-break-out'
          header={`You are transferring ${
            formatIOTAAmount(totalTransfer).short
          } (${totalTransfer}) IOTAs ${ tag && tag.length ? `tagged "${tag}"` : ''}`}
          content={`To: ${address}`}
        />
      ) : null;

    const donationInfo =
      totalDonation > 0 ? (
        <Message
          success
          icon="heart"
          className='dont-break-out'
          header={`You are donating ${
            formatIOTAAmount(totalDonation).short
          } (${totalDonation}) IOTAs`}
          content={`To: ${donationAddress}`}
        />
      ) : null;
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16}>
            {transferInfo}
            {donationInfo}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16} textAlign="right">
            <Divider />
            <Button color="olive" size="large" onClick={this.sendTransfer}>
              <Icon name="send" /> &nbsp; Send transfer(s)
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderDonation() {
    const {
      page: { page: { balance: pageBalance }}
    } = this.props;
    const { donationAddress, donationValue, donationUnit } = this.state;
    if (!donationAddress) return null;
    const totalValue = donationValue * donationUnit;
    const formattedValue = formatIOTAAmount(totalValue).short;
    const enoughBalance = totalValue <= pageBalance;
    const color = totalValue > 0 && enoughBalance ? 'green' : 'red';

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Header as="h4">
              <Icon name="heart" color="red" />
              Add a small donation to the Field Nodes
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={12}>
            <Form>
              <Form.Group>
                <Form.Input
                  fluid
                  label="Current Field Season Donation Address"
                  disabled
                  value={donationAddress}
                  width={12}
                  name="donationAddress"
                />
                <Form.Input
                  fluid
                  label="Value"
                  onChange={this.handleChange0}
                  value={donationValue}
                  width={2}
                  name="donationValue"
                  type="number"
                  min="0"
                />
                <Form.Select
                  fluid
                  label="Unit"
                  onChange={this.handleChange0}
                  options={UNITS}
                  name="donationUnit"
                  value={donationUnit}
                  width={2}
                />
              </Form.Group>
            </Form>
          </Grid.Column>
          <Grid.Column width={4}>
            <Header
              as="h2"
              textAlign="right"
              color={color}
              className="valueDisplay"
            >
              <Header.Content>
                {formattedValue}
                <Header.Subheader>
                  {!enoughBalance && 'Not enough balance!'}
                  {totalValue < 0 && 'Input a positive value!'}
                </Header.Subheader>
              </Header.Content>
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderTotalStep0(validAddress, validTag) {
    const {
      page: { page: { balance: pageBalance }}
    } =  this.props;
    const { value, unit, donationValue, donationUnit } = this.state;
    const totalValue = donationValue * donationUnit + value * unit;
    const formattedValue = formatIOTAAmount(totalValue).short;
    const enoughBalance = totalValue <= pageBalance;
    const color = totalValue >= 0 && enoughBalance ? 'green' : 'red';

    const canProceed =
      totalValue >= 0 && enoughBalance && validAddress && validTag;

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={12} textAlign="right">
            <Divider />
            <Button
              disabled={!canProceed}
              color="olive"
              size="large"
              onClick={() =>
                this.setState({
                  currentStep: 1,
                  maxStep: 1
                })
              }
            >
              <Icon name="payment" /> &nbsp; Next: Select source addresses
            </Button>
          </Grid.Column>
          <Grid.Column width={4}>
            <Divider />
            <Header
              as="h2"
              textAlign="right"
              color={color}
              className="valueDisplay"
            >
              <Header.Content>
                {formattedValue}
                <Header.Subheader>
                  {!enoughBalance && 'Not enough balance!'}
                </Header.Subheader>
              </Header.Content>
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  canGoToStep1() {
    const {
      page: { page: { balance: pageBalance }}
    } = this.props
    const { value, unit, donationValue, donationUnit } = this.state;
    const totalValue = donationValue * donationUnit + value * unit;
    const enoughBalance = totalValue <= pageBalance;
    let validAddress = false;
    try {
      validAddress = this.romeo.iota.utils.isValidChecksum(address);
    } catch (e) {
      validAddress = false;
    }
    return totalValue > 0 && enoughBalance && validAddress;
  }

  handleAddressChange(event, data) {
    const { searchSpent } = this.props;
    searchSpent(data.value);
    this.handleChange0(event, data);
  }

  handleChange0(event, { name, value }) {
    if (name === 'address' || name === 'tag') {
      value = value.toUpperCase();
    }
    if  (name === 'value') {
      value = !isNaN(parseFloat(value)) && isFinite(value)
        ? value
        : '';
    }
    this.setState({ [name]: value }, () => {
      const { maxStep } = this.state;
      this.setState({
        maxStep: this.canGoToStep1() ? (maxStep > 0 ? maxStep : 1) : 0
      });
    });
  }

  sendTransfer() {
    const { history } = this.props;
    const {
      value,
      unit,
      address,
      donationValue,
      donationUnit,
      donationAddress,
      tag
    } = this.state;
    const donation = donationValue * donationUnit;
    const transfers = [
      {
        address,
        tag,
        value: value * unit
      }
    ];

    if (donation) {
      transfers.push({
        address: donationAddress,
        value: donation
      });
    }

    this.setState({ sending: true });
    this.pageObject.sendTransfers(transfers, null, null, null, 7000).then(() => {
      this.setState({ sending: false });
      history.push(`/page/${this.pageObject.opts.index + 1}`);
      showInfo(
        <span>
          <Icon name="send" /> Transfer sent!
        </span>
      );
      this.pageObject.sync(true, 7000);
    });
  }
}

function mapStateToProps(state, props) {
  const { pages } = state.romeo;
  const { match: { params } } = props;
  const currentIndex = parseInt((params && params.page) || 0) - 1;
  const page = pages.find(p => p.page.index === currentIndex);
  return {
    currentIndex,
    page,
    ui: state.ui,
    donationAddress:
      state.field && state.field.season && state.field.season.address
  };
}

function mapDispatchToProps(dispatch) {
  return {
    searchSpent: address => dispatch(searchSpentAddressThunk(address))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(deepHoc(Transfer));

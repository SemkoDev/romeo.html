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
      <Step.Group>
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
    );
  }

  renderStep0() {
    const {
      pageObject,
      romeo,
      ui: {
        searchSpentAddress,
        searchSpentAddressError,
        spentAddress,
        spentAddressResult
      }
    } = this.props;
    const { value, address, unit, tag } = this.state;
    const totalValue = value * unit;
    const formattedValue = formatIOTAAmount(totalValue).short;
    const validTag = !tag.length || romeo.iota.valid.isTrytes(tag);
    let validAddress = false;
    try {
      validAddress = romeo.iota.utils.isValidChecksum(address);
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

    const enoughBalance = totalValue <= pageObject.getBalance();
    const color = totalValue > 0 && enoughBalance ? 'green' : 'red';
    const addressInfo = validAddress ? null : (
      <Grid.Row>
        <Grid.Column width={12}>
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
        <Grid.Column width={12}>
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
        <Grid.Column width={12}>
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
      enoughBalance && totalValue ? null : (
        <Grid.Row>
          <Grid.Column width={12}>
            <Message
              info
              icon="balance"
              header="How many IOTAs do you want to send?"
              content={
                <span>
                  Negative and zero-value transactions are not allowed. Also,
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
                    {totalValue < 1 && 'Input a positive value!'}
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
          <Grid.Column width={12}>
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
          <Grid.Column width={12} textAlign="right">
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
      donationAddress
    } = this.state;
    const totalTransfer = value * unit;
    const totalDonation = donationValue * donationUnit;

    const transferInfo =
      totalTransfer > 0 ? (
        <Message
          info
          icon="send"
          header={`You are transferring ${
            formatIOTAAmount(totalTransfer).short
          } (${totalTransfer}) IOTAs`}
          content={`To: ${address}`}
        />
      ) : null;

    const donationInfo =
      totalDonation > 0 ? (
        <Message
          success
          icon="heart"
          header={`You are donating ${
            formatIOTAAmount(totalDonation).short
          } (${totalDonation}) IOTAs`}
          content={`To: ${donationAddress}`}
        />
      ) : null;
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={12}>
            {transferInfo}
            {donationInfo}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={12} textAlign="right">
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
    const { pageObject } = this.props;
    const { donationAddress, donationValue, donationUnit } = this.state;
    if (!donationAddress) return null;
    const totalValue = donationValue * donationUnit;
    const formattedValue = formatIOTAAmount(totalValue).short;
    const enoughBalance = totalValue <= pageObject.getBalance();
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
    const { pageObject } = this.props;
    const { value, unit, donationValue, donationUnit } = this.state;
    const totalValue = donationValue * donationUnit + value * unit;
    const formattedValue = formatIOTAAmount(totalValue).short;
    const enoughBalance = totalValue <= pageObject.getBalance();
    const color = totalValue > 0 && enoughBalance ? 'green' : 'red';

    const canProceed =
      totalValue > 0 && enoughBalance && validAddress && validTag;

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
                  {totalValue < 1 && 'Zero transfers not allowed!'}
                </Header.Subheader>
              </Header.Content>
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  canGoToStep1() {
    const { pageObject } = this.props;
    const { value, unit, donationValue, donationUnit } = this.state;
    const totalValue = donationValue * donationUnit + value * unit;
    const enoughBalance = totalValue <= pageObject.getBalance();
    let validAddress = false;
    try {
      validAddress = romeo.iota.utils.isValidChecksum(address);
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
    this.setState({ [name]: value }, () => {
      const { maxStep } = this.state;
      this.setState({
        maxStep: this.canGoToStep1() ? (maxStep > 0 ? maxStep : 1) : 0
      });
    });
  }

  sendTransfer() {
    const { pageObject, history } = this.props;
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
    pageObject.sendTransfers(transfers, null, null, null, 70).then(() => {
      this.setState({ sending: false });
      history.push(`/page/${pageObject.opts.index + 1}`);
      showInfo(
        <span>
          <Icon name="send" /> Transfer sent!
        </span>
      );
      pageObject.sync(true, 70);
    });
  }
}

function mapStateToProps(state, props) {
  const romeo = get();
  const { pages } = state.romeo;
  const { match: { params } } = props;
  const currentIndex = parseInt((params && params.page) || 0) - 1;
  const pageObject = romeo.pages.getByIndex(currentIndex).page;
  const page = pages.find(p => p.page.index === currentIndex);
  return {
    romeo,
    page,
    pageObject,
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

export default connect(mapStateToProps, mapDispatchToProps)(Transfer);

import React from 'react';
import { Route, Switch } from 'react-router';
import {
  Grid,
  Message,
  Header,
  Icon,
  Popup,
  Form,
  Divider,
  Button,
  Segment
} from 'semantic-ui-react';
import { get, wasSpent } from '../romeo';
import { formatIOTAAmount } from '../utils';
import deepHoc from '../components/deep-hoc';

const UNITS = [
  { key: 'i', text: 'i', value: 1 },
  { key: 'k', text: 'Ki', value: 1000 },
  { key: 'm', text: 'Mi', value: 1000000 },
  { key: 'g', text: 'Gi', value: 1000000000 },
  { key: 't', text: 'Ti', value: 1000000000000 }
];

class TransferRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: props.address || '',
      value: props.value || 0,
      unit: props.unit || 1,
      tag: props.tag || '',
      searchingAddress: '',
      validAddress: false,
      addressSearchInProgress: false,
      addressSearchError: false
    };
    this.romeo = get();
    this.handleChange = this.handleChange.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.checkAddress(this.props.address);
  }

  render() {
    const { disableAddress, onRemove } = this.props;
    const {
      value,
      address,
      unit,
      tag,
      addressSearchInProgress,
      validAddress,
      addressSearchError
    } = this.state;
    const totalValue = value * unit;
    const validValue = this.validValue();
    const formattedValue = formatIOTAAmount(totalValue).short;
    const addressAction = onRemove ? (
      <Button icon onClick={onRemove}>
        <Icon name="minus" />
      </Button>
    ) : (
      false
    );

    const addressInput = (
      <Form.Input
        fluid
        action={addressAction}
        actionPosition={onRemove ? 'left' : null}
        label="Address"
        onChange={this.handleChange}
        loading={addressSearchInProgress}
        error={!this.validAddress() || addressSearchError}
        value={address}
        disabled={disableAddress}
        placeholder="XYZ"
        width={9}
        name="address"
        maxLength={90}
      />
    );

    let addressElement = addressInput;

    if (!addressSearchInProgress) {
      if (!validAddress) {
        addressElement = (
          <Popup
            trigger={addressInput}
            position="top left"
            content="This address has been spent from. Please ask the receiving party another address!"
          />
        );
      } else if (addressSearchError) {
        addressElement = (
          <Popup
            trigger={addressInput}
            position="top left"
            content="We could not determine whether this address has been spent from. Use at your own risk!"
          />
        );
      }
    }

    return (
      <Grid.Row>
        <Grid.Column width={12}>
          <Form>
            <Form.Group>
              {addressElement}
              <Form.Input
                fluid
                label="Tag"
                onChange={this.handleChange}
                error={!this.validTag()}
                value={tag}
                placeholder="XYZ"
                width={3}
                name="tag"
                maxLength={27}
              />
              <Form.Input
                fluid
                label="Value"
                onChange={this.handleChange}
                error={!this.validValue()}
                value={value}
                width={2}
                name="value"
                type="number"
                min="0"
              />
              <Form.Select
                fluid
                label="Unit"
                onChange={this.handleChange}
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
            color={validValue ? 'green' : 'red'}
            className="valueDisplay"
          >
            <Header.Content>
              {validValue ? formattedValue : 'X'}
              <Header.Subheader>
                {!validValue && 'Input a positive value!'}
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Grid.Column>
      </Grid.Row>
    );
  }

  validTag() {
    const { tag } = this.state;
    return !tag.length || this.romeo.iota.valid.isTrytes(tag);
  }

  validAddress() {
    const {
      address,
      searchingAddress,
      validAddress,
      addressSearchInProgress
    } = this.state;
    return (
      address === searchingAddress && validAddress && !addressSearchInProgress
    );
  }

  validValue() {
    const { value } = this.state;
    return !isNaN(parseFloat(value)) && isFinite(value) && value >= 0;
  }

  validInputs() {
    return this.validTag() && this.validAddress() && this.validValue();
  }

  async handleChange(event, { name, value }) {
    if (name === 'address' || name === 'tag') {
      value = value.toUpperCase();
    }
    if (name === 'address') {
      this.checkAddress(value).then(valid => valid && this.onChange());
    }
    if (name === 'value') {
      value = !isNaN(parseFloat(value)) && isFinite(value) ? value : '';
    }
    this.setState({ [name]: value }, this.onChange);
  }

  onChange() {
    const { onChange, identifier } = this.props;
    const { value: v, address, unit, tag } = this.state;
    onChange &&
      onChange({
        identifier,
        value: v * unit,
        address,
        tag,
        valid: this.validInputs()
      });
  }

  checkAddress(address) {
    return new Promise(resolve => {
      const { searchingAddress } = this.state;
      if (address === searchingAddress) {
        resolve(false);
        return;
      }
      let valid = false;

      try {
        valid = this.romeo.iota.utils.isValidChecksum(address);
      } catch (e) {}
      if (!valid) {
        this.setState(
          {
            searchingAddress: address,
            validAddress: false,
            addressSearchError: false
          },
          () => resolve(false)
        );
        return;
      }
      this.setState(
        {
          addressSearchInProgress: true,
          addressSearchError: false,
          searchingAddress: address
        },
        () => {
          wasSpent(address)
            .then(spent => {
              const { searchingAddress } = this.state;
              if (searchingAddress !== address) {
                resolve(false);
                return;
              }
              this.setState(
                {
                  addressSearchInProgress: false,
                  validAddress: !spent
                },
                () => resolve(!spent)
              );
            })
            .catch(() => {
              const { searchingAddress } = this.state;
              if (searchingAddress !== address) {
                resolve(false);
                return;
              }
              this.setState(
                {
                  addressSearchInProgress: false,
                  validAddress: true,
                  addressSearchError: true
                },
                () => resolve(false)
              );
            });
        }
      );
    });
  }
}

export default deepHoc(TransferRow);

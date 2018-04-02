import React from 'react'
import romeo from 'romeo.lib'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router-dom'
import {
  Container, Grid, Form, Button, Label,
  Header, Icon, Transition
} from 'semantic-ui-react'
import { version } from '../../../package'
import { updateRomeo } from '../reducers/romeo';
import { login } from '../romeo';

import classes from './login.css'

class Login extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render () {
    const { isLoggedIn, fromPath } = this.props;

    if (isLoggedIn) {
      return <Redirect to={{pathname: fromPath || '/',}} />
    }

    return (
      <div className='loginPage'>
        <Container className='loginContainer'>
          <Transition transitionOnMount animation='fade up'>
          <Grid divided>
            <Grid.Row columns={4} centered stretched>
              <Grid.Column mobile={4} stretched>
                <Header as='h2' icon>
                  <Icon name='book' />
                  CarrIOTA Romeo
                  <Header.Subheader>
                    Ultra-Light Ledger v.{version}
                  </Header.Subheader>
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={4} centered stretched>
              <Grid.Column mobile={4} stretched>
                {this.renderForm()}
              </Grid.Column>
              <Grid.Column mobile={4} stretched>
                <p>
                  Please enter your username and password.
                  If no ledgers exist with the given credentials, a new one
                  will be generated.
                </p>
                <p>
                  Spaces, unicode, emticons, everything is allowed.
                  Make sure to check (and remember) your checksum when the
                  login button becomes enabled - this is the only way to be sure
                  that you entered correct details!
                </p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          </Transition>
        </Container>
      </div>
    )
  }

  renderForm() {
    const { username, password, loading } = this.state;

    const userLabel = romeo.utils.validate.isUsername(username).valid
      ? null
      : <Label pointing color='red'>10+ chars, 1 uppercase</Label>;

    const passwordLabel = romeo.utils.validate.isPassword(password).valid
      ? null
      : <Label pointing color='red'>12+ chars, 1 uppercase, 1 number, 1 symbol</Label>;

    const ready = !userLabel && !passwordLabel;
    const checksumLabel = ready
      ? (
        <Label size='large' color='yellow'>
          {romeo.crypto.keys.getKeys(username, password).checksum}
        </Label>
      )
      : null;
    const checksumCheckLabel = ready
      ? (
        <Label size='large' pointing='left'>
          Checksum?
        </Label>
      )
      : null;

    return (
      <Form onSubmit={this.handleSubmit} loading={loading}>
        <Form.Field>
          <label>Username</label>
          <input type='password' name='username' onChange={this.handleChange} />
          {userLabel}
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input type='password' name='password' onChange={this.handleChange}  />
          {passwordLabel}
        </Form.Field>
        <Button type='submit' disabled={!ready}>Login</Button>
        {checksumLabel} {checksumCheckLabel}
      </Form>
    )
  }

  handleChange ({ target: { name, value }}) {
    this.setState({ [name]: value })
  }

  handleSubmit () {
    const { login } = this.props;
    const { username, password } = this.state;
    const u = romeo.utils.validate.isUsername(username).valid;
    const p = romeo.utils.validate.isPassword(password).valid;
    if (u && p) {
      this.setState({ loading: true }, () => login(username, password));
    }
  }
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.romeo && state.romeo.keys && true,
    fromPath: state.router.location &&
      state.router.location.state &&
      state.router.location.state.from &&
      state.router.location.state.from.pathname
  }
}

function mapDispatchToProps (dispatch) {
  return {
    login: (username, password) => {
      login(username, password, (romeo) => dispatch(updateRomeo(romeo)));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
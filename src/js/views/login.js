import React from 'react';
import romeo from 'romeo.lib';
import { connect } from 'react-redux';
import ReactFileReader from 'react-file-reader';
import { Redirect } from 'react-router-dom';
import {
  Container,
  Grid,
  Form,
  Button,
  Label,
  Header,
  Icon,
  Transition,
  Menu,
  Responsive,
  Segment
} from 'semantic-ui-react';
import { version } from '../../../package';
import { updateRomeo } from '../reducers/romeo';
import { login } from '../romeo';

import classes from './login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false,
      file: null,
      fileError: false,
      mode: 'username'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLedgerLogin = this.handleLedgerLogin.bind(this);
    this.handleFiles = this.handleFiles.bind(this);
  }

  componentDidMount() {
    if (this.userInput) {
      setTimeout(() => this.userInput.focus(), 10);
    }
  }

  render() {
    const { isLoggedIn, fromPath } = this.props;
    const { mode } = this.state;

    if (isLoggedIn) {
      return <Redirect to={{ pathname: fromPath || '/' }} />;
    }

    const loginView = mode === 'username'
      ? this.renderUsernameLogin()
      : this.renderLedgerLogin();

    return (
      <div className="loginPage">
        <Container className="loginContainer">
          <Transition transitionOnMount animation="fade up">
            <Grid divided>
              <Grid.Row centered stretched>
                <Grid.Column
                  largeScreen={4}
                  computer={6}
                  tablet={8}
                  mobile={16}
                  stretched
                >
                  <Header as="h2" color="purple" textAlign="center">
                    <div className="romeoLogo" />
                    <br />
                    Deviota Romeo
                    <Header.Subheader>
                      Ultra-Light Ledger v.{version}
                    </Header.Subheader>
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row centered stretched>
                <Grid.Column
                  largeScreen={8}
                  computer={12}
                  tablet={16}
                  mobile={16}
                  stretched
                >
                  <Button.Group fluid>
                    <Button style={{ width: '50%'}} active={mode === 'username'}
                      onClick={() => this.setState({ mode: 'username' })}>
                      <Icon name='user' /> Username/Pass
                    </Button>
                    <Button style={{ width: '50%'}} active={mode === 'ledger'}
                      onClick={() => this.setState({ mode: 'ledger' })}>
                      <Icon name='usb' /> Ledger Nano
                    </Button>
                  </Button.Group>
                </Grid.Column>
              </Grid.Row>
              {loginView}
            </Grid>
          </Transition>
        </Container>
        {this.renderBottomMenu()}
      </div>
    );
  }

  renderUsernameLogin () {
    return (
      <Grid.Row centered stretched>
        <Grid.Column
          largeScreen={4}
          computer={6}
          tablet={8}
          mobile={16}
          stretched
        >
          {this.renderForm()}
        </Grid.Column>
        <Grid.Column
          largeScreen={4}
          computer={6}
          tablet={8}
          mobile={16}
          stretched
        >
          <p>
            Please enter your username and password. If no ledgers exist
            with the given credentials, a new one will be generated.
          </p>
          <p>
            Spaces, unicode, emticons, everything is allowed. Make sure
            to check (and remember) your checksum when the login button
            becomes enabled - this is the only way to be sure that you
            entered correct details!
          </p>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderLedgerLogin () {
    const { loading } = this.state;

    return (
      <Grid.Row centered stretched reversed='mobile'>
        <Grid.Column
          largeScreen={4}
          computer={6}
          tablet={8}
          mobile={16}
          stretched
        >
          <p>
            Use your <strong>Ledger Nano</strong> hardware wallet to
            login into Romeo.
          </p>
          <p>
            Please be aware that you either use Ledger nano or
            username/password login. You cannot use both to login
            into the same account as both are using different
            techniques to generate and secure your ledger.
          </p>
        </Grid.Column>
        <Grid.Column
          largeScreen={4}
          computer={6}
          tablet={8}
          mobile={16}
          stretched
        >
          {this.renderUpload()}
          <Segment basic>
            <Button fluid color='purple' size='huge'
              onClick={this.handleLedgerLogin}
              disabled={loading} loading={loading}>
              Login with Ledger
            </Button>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderForm() {
    const { username, password, loading } = this.state;

    const userLabel = romeo.utils.validate.isUsername(username).valid ? null : (
      <Label pointing color="red">
        10+ chars, 1 uppercase
      </Label>
    );

    const passwordLabel = romeo.utils.validate.isPassword(password)
      .valid ? null : (
      <Label pointing color="red">
        12+ chars, 1 uppercase, 1 number, 1 symbol
      </Label>
    );

    const ready = !userLabel && !passwordLabel;
    const checksumLabel = ready ? (
      <Label size="large" color="yellow">
        {new romeo.guard.SimpleGuard({ username, password }).getChecksum()}
      </Label>
    ) : null;
    const checksumCheckLabel = ready ? (
      <Label size="large" pointing="left">
        Checksum?
      </Label>
    ) : null;

    return (
      <Form onSubmit={this.handleSubmit} loading={loading}>
        <Form.Field>{this.renderUpload()}</Form.Field>
        <Form.Field>
          <label>Username</label>
          <input
            type="password"
            name="username"
            ref={input => {
              this.userInput = input;
            }}
            onChange={this.handleChange}
          />
          {userLabel}
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input type="password" name="password" onChange={this.handleChange} />
          {passwordLabel}
        </Form.Field>
        <Button type="submit" disabled={!ready}>
          Login
        </Button>
        {checksumLabel} {checksumCheckLabel}
      </Form>
    );
  }

  renderUpload() {
    const { file, fileError, loading } = this.state;
    const color = file ? 'green' : fileError ? 'red' : null;
    const text = file
      ? 'Backup uploaded!'
      : fileError ? 'Wrong format!' : 'Upload backup file first (if any)';
    return (
      <ReactFileReader
        handleFiles={this.handleFiles}
        fileTypes={['.txt']}
        multipleFiles={false}
      >
        <Button icon fluid color={color} type="button" disabled={loading}>
          <Icon name="upload" /> &nbsp;
          {text}
        </Button>
      </ReactFileReader>
    );
  }

  renderBottomMenu() {
    return (
      <Menu fixed="bottom" className="bottomMenu">
        <Menu.Item>
          Crafted with &nbsp;<Icon
            name="heart"
            color="red"
            style={{ display: 'inline-block' }}
          />{' '}
          at&nbsp;
          <a href="https://twitter.com/RomanSemko" target="_blank">
            SemkoDev
          </a>
        </Menu.Item>
        <Responsive as={Menu.Item} minWidth={620}>
          <Icon name="paw" color="grey" /> No animals have been harmed when
          crafting this software
        </Responsive>
      </Menu>
    );
  }

  handleChange({ target: { name, value } }) {
    this.setState({ [name]: value });
  }

  handleSubmit() {
    const { login } = this.props;
    const { username, password, file } = this.state;
    const u = romeo.utils.validate.isUsername(username).valid;
    const p = romeo.utils.validate.isPassword(password).valid;
    const guard = new romeo.guard.SimpleGuard({ username, password });
    if (u && p) {
      this.setState({ loading: true }, () => login(guard, file));
    }
  }

  handleLedgerLogin () {
    const { file } = this.state;
    // TODO: setup ledger guard here and pass to login:
    const guard = new romeo.guard.LedgerGuard();

    this.setState(
      { loading: true },
      // TODO: uncomment once ledger guard is ready:
      // () => login(guard, file)
    );
  }

  handleFiles(files) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = reader.result;
      try {
        const json = JSON.parse(text);
        const wrongFormat = !!json.find(j => !j.data || !j._id);
        if (wrongFormat) {
          this.setState({ file: null, fileError: true });
          return;
        }
        this.setState({ file: text, fileError: false });
      } catch (e) {
        this.setState({ file: null, fileError: true });
      }
    };

    reader.readAsText(files[0], 'utf-8');
  }
}

function mapStateToProps(state) {
  return {
    isLoggedIn: state.romeo && state.romeo.pages && true,
    fromPath:
      state.router.location &&
      state.router.location.state &&
      state.router.location.state.from &&
      state.router.location.state.from.pathname
  };
}

function mapDispatchToProps(dispatch) {
  return {
    login: (guard, file) => {
      login(guard, romeo => dispatch(updateRomeo(romeo)), file);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

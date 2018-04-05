# CarrIOTA Romeo - Ultra-Light-Ledger

CarrIOTA Romeo is a lightweight ledger built on top of the IOTA Tangle. 
It compiles to a single HTML file, including all images, fonts,
stylesheets and scripts, which is used as an interface for the end user.

The HTML file can be copied to any computer, USB Stick or hosted on a
server, giving access to the IOTA Tangle and the powerful tools built on
top of it offered by Romeo.

## How to use

Please check the Articles on [Deviota Medium](https://medium.com/deviota) for instructions.
Download the latest release from the releases tab.

**BEFORE RUNNING**: Check that the file has not been tampered with.
**It's MD5 Signature should match** the one given in the release information!

You can use command-line tools on your OS or upload the file at [OnlineMD5](http://onlinemd5.com/)

## How to compile locally

Clone or download the repository. Then run:

```
# Install packages:
yarn
# Build:
yarn run pack
```
This will create a file called romeo-X.X.X.html in the root folder
of the project.

This project is a mere frontend interface to **romeo.lib**, which
holds the bulk of the system. The frontend is not clean nor documented.
It's work in progress. Please bear with the simplicity.

## WARNING

This software is experimental. Use at your own risk!

## Contributing

### Donations

**Donations always welcome**:

```
YHZIJOENEFSDMZGZA9WOGFTRXOFPVFFCDEYEFHPUGKEUAOTTMVLPSSNZNHRJD99WAVESLFPSGLMTUEIBDZRKBKXWZD
```

## Authors

* **Roman Semko** - _SemkoDev_ - (https://github.com/romansemko)

## License

This project is licensed under the ICS License - see the [LICENSE.md](LICENSE.md) file for details.


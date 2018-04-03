const path = require('path');
const fs = require('fs');
const serve = require('serve');
const Inliner = require('inliner');
const version = require('./package').version;

(async function() {
  const server = serve(path.join(__dirname, 'dist'), { port: 2424 });

  setTimeout(() => {
    new Inliner('http://localhost:2424/', function (error, html) {
      if (error) {
        console.log(error);
        process.exit(1)
      }
      fs.writeFileSync(path.join(__dirname, `romeo-${version}.html`), html);
      server.stop();
    });
  }, 2000);
})();


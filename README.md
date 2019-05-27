# gcloud-cli

Download gcloud CLI if it doesn't exist in PATH.

## Usage

Install with:

```bash
npm install --save gcloud-cli
```

Then use it:

```javascript
const GcloudCli = require('gcloud-cli');

// returns a promise that resolves to an absolute path of a gcloud executable
GcloudCli.getPath();

// or add some options
new GcloudCli({
  // where to extract the tar, defaults to OS' temporary directory (e.g '/tmp')
  extractPath: os.tmpdir(), 
  // which version to download (if a download is needed), defaults to the one specified in index.js
  downloadVersion: '...',
}).getPath();
```

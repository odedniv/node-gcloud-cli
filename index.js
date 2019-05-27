'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const which = promisify(require('which'));
const https = require('https');
const tar = require('tar');

const fsExists = promisify(fs.exists);

const DEFAULT_EXTRACT_PATH = os.tmpdir();
const EXECUTABLE_PATH = ['google-cloud-sdk', 'bin', 'gcloud'];
const DEFAULT_DOWNLOAD_VERSION = '247.0.0';

class GcloudCli {
  constructor(options) {
    options = options || {};
    this.extractPath = options.extractPath || DEFAULT_EXTRACT_PATH;
    this.downloadVersion = options.downloadVersion || DEFAULT_DOWNLOAD_VERSION;
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new GcloudCli();
    }
    return this._instance;
  }

  static getPath() {
    return this.instance.getPath();
  }

  async getPath() {
    if (!this._path) {
      this._path =
        await this._findInPath() ||
        await this._findInTmp() ||
        await this._findOnline();
    }
    return this._path;
  }

  async _findInPath() {
    try {
      return await which('gcloud');
    } catch (err) {
      return undefined;
    }
  }

  async _findInTmp() {
    let tmpPath = path.join(this.extractPath, ...EXECUTABLE_PATH);
    if (await fsExists(tmpPath)) {
      return tmpPath;
    } else {
      return undefined;
    }
  }

  _findOnline() {
    return new Promise((resolve, reject) => {
      https.get(this.url, response => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Request to ${this.url} failed with status code: ${response.statusCode}`));
        }
        response.on('error', reject);

        let tarStream = tar.extract({ cwd: this.extractPath });
        tarStream.on('error', reject);
        tarStream.on('finish', () => resolve(path.join(this.extractPath, ...EXECUTABLE_PATH)));

        response.pipe(tarStream);
      });
    });
  }

  get url() {
    let platform = process.platform;
    switch (platform) {
      case 'win32': platform = 'windows'; break;
    }
    let arch = process.arch;
    switch (arch) {
      case 'x32': arch = 'x86'; break;
      case 'x64': arch = 'x86_64'; break;
    }

    return `https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-${this.downloadVersion}-${platform}-${arch}.tar.gz`;
  }
}

module.exports = GcloudCli;

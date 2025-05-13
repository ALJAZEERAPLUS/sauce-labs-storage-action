/* eslint-disable import/no-unresolved */
const core = require('@actions/core');
const upload = require('./endpoints/storage/upload');
const fetchFiles = require('./endpoints/storage/fetchFiles');

async function main() {
  const endpointAction = core.getInput('endpoint-action');

  try {
    switch (endpointAction) {
      case 'upload':
        await upload();
        break;
      case 'get-file-id':
        await fetchFiles();
        break;
      default:
        core.setFailed(`[ERROR] Invalid endpoint action: ${endpointAction}`);
        break;
    }
  } catch (error) {
    core.setFailed(`[ERROR] There was an error during the action execution: ${error}`);
  }
}

exports.main = main;

if (require.main === module) {
  main();
}

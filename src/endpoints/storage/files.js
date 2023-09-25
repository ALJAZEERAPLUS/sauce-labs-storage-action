const axios = require('axios');
const core = require('@actions/core');

async function files() {
  const username = core.getInput('sauce-labs-username', { required: true });
  const accessKey = core.getInput('sauce-labs-access-key', { required: true });
  const hostName = core.getInput('sauce-labs-data-center-host-name', { required: false });
  const platform = core.getInput('get-file-id-platform', { required: false }).toLowerCase();
  const version = core.getInput('get-file-id-app-version', { required: false });
  const build = core.getInput('get-file-id-app-build-number', { required: false });
  const description = core.getInput('get-file-id-app-description', { required: false });

  try {
    const response = await axios.get(`${hostName}/v1/storage/files`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${accessKey}`).toString('base64')}`,
      },
      params: {
        kind: platform,
        per_page: 100,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Unexpected response code: ${response.status}`);
    }

    const { items } = response.data;

    if (!Array.isArray(items)) {
      throw new Error('Unexpected response structure');
    }

    const filteredItems = items.filter((file) => (
      (!version || (platform === 'ios' && file.metadata.short_version === version) || (platform === 'android' && file.metadata.version === version))
      && (!build || (platform === 'ios' && file.metadata.version === build) || (platform === 'android' && file.metadata.version_code === parseInt(build, 10)))
      && (!description || (file.description && file.description.includes(description)))
    ));

    let fileId = null;

    if (filteredItems.length > 0) {
      fileId = filteredItems[0].id;
      core.info(`File ID: ${fileId}`);
    } else {
      core.setFailed('No file found');
    }

    core.setOutput('file-id', fileId);
  } catch (error) {
    core.setFailed(`Unexpected error: ${error.message}`);
  }
}

module.exports = files;

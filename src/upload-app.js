const core = require('@actions/core');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function uploadApp() {
  const filePath = core.getInput('file-path');
  const sauceLabsUsername = core.getInput('sauce-labs-username');
  const sauceLabsAccessKey = core.getInput('sauce-labs-access-key');
  const sauceLabsDataCenterHostName = core.getInput('sauce-labs-data-center-host-name');
  const sauceLabsArtifactDescription = core.getInput('sauce-labs-artifact-description');

  const requestData = new FormData();
  requestData.append('payload', fs.createReadStream(filePath));

  const response = await fetch(`${sauceLabsDataCenterHostName}/v1/storage/upload`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${sauceLabsUsername}:${sauceLabsAccessKey}`).toString('base64')}`
    },
    body: requestData
  })
  .then(response => {
    if (response.status !== 201) {
      throw new Error(`Unexpected response status: ${response.statusText}`);
    } else {
      core.info(`Response: ${response.status} - ${response.statusText}`);
      return response.json();
    }
  });

  const fileId = response.item.id;
  core.setOutput('file-id', fileId);

  await fetch(`${sauceLabsDataCenterHostName}/v1/storage/files/${fileId}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'text/json',
      'Authorization': `Basic ${Buffer.from(`${sauceLabsUsername}:${sauceLabsAccessKey}`).toString('base64')}`
    },
    body: JSON.stringify({
      item: {
        description: sauceLabsArtifactDescription
      }
    })
  }).then(response => {
    if (response.status !== 200) {
      throw new Error(`Unexpected response status: ${response.statusText}`);
    } else {
      core.info(`Response: ${response.status} - ${response.statusText}`);
      return response.json();
    }
  });
}

module.exports = uploadApp;
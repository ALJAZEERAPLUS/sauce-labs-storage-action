const axios = require('axios');
const core = require('@actions/core');
const FormData = require('form-data');
const fs = require('fs');
const getAuthHeader = require('../../utils/utils');

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function upload() {
  const username = 'SANTOSV';
  const accessKey = '8f572c21-d082-4cfd-b504-ca1e755c439c';
  const hostName = 'https://api.us-west-1.saucelabs.com';
  const filePath = '/Users/hugo/Downloads/app-release-2.aab';
  const artifactDescription = 'Built from branch: ANA-2963. Workflow URL: https://github.com/ALJAZEERAPLUS/ump/actions/runs/14994798538';
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const requestData = new FormData();
    requestData.append('payload', fs.createReadStream(filePath));

    const uploadResponse = await axios.post(`${hostName}/v1/storage/upload`, requestData, {
      headers: {
        Accept: 'application/json',
        Authorization: getAuthHeader(username, accessKey),
        ...requestData.getHeaders(),
      },
    }).then((response) => {
      if (response.status !== 201) {
        throw new Error(`Unexpected status: ${response.status} - ${response.statusText}`);
      }

      if (!response?.data?.item) {
        throw new Error('Response data is missing or incomplete');
      }
      return response;
    });

    core.info(`Response: ${uploadResponse.status} - ${uploadResponse.statusText}`);
    const fileId = uploadResponse.data.item.id;
    core.info(`File uploaded successfully with ID: ${fileId}`);

    if (artifactDescription) {
      try {
        // Add a small delay to ensure the file is fully processed
        await sleep(2000);

        const descriptionUrl = `${hostName}/v1/storage/files/${fileId}`;
        core.info(`Attempting to update description at: ${descriptionUrl}`);

        const editResponse = await axios.put(
          descriptionUrl,
          {
            item: {
              description: artifactDescription,
            },
          },
          {
            headers: {
              'Content-type': 'application/json',
              Authorization: getAuthHeader(username, accessKey),
            },
          },
        );
        core.info(`Description update response: ${editResponse.status} - ${editResponse.statusText}`);
      } catch (descriptionError) {
        // Log the error but don't fail the whole upload
        core.warning(`Failed to update description: ${descriptionError.message}`);
        if (descriptionError.response) {
          core.warning(`Error details: ${JSON.stringify({
            status: descriptionError.response.status,
            statusText: descriptionError.response.statusText,
            data: descriptionError.response.data,
          }, null, 2)}`);
        }
      }
    }

    core.setOutput('file-id', fileId);
  } catch (error) {
    core.setFailed(`Unexpected error: ${error.message}`);
    if (error.response) {
      core.error(`Error details: ${JSON.stringify({
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      }, null, 2)}`);
    }
  }
}

module.exports = upload;

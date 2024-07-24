const axios = require('axios');
const core = require('@actions/core');
const FormData = require('form-data');
const fs = require('fs');
const getAuthHeader = require('../../utils/utils');

async function upload() {
  const username = core.getInput('sauce-labs-username', { required: true });
  const accessKey = core.getInput('sauce-labs-access-key', { required: true });
  const hostName = core.getInput('sauce-labs-data-center-host-name', { required: false });
  const filePath = core.getInput('upload-file-path', { required: true });
  const artifactDescription = core.getInput('upload-artifact-description', { required: false });
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

    if (artifactDescription) {
      const editResponse = await axios.put(
        `${hostName}/v1/storage/files/${fileId}`,
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
      core.info(`Response: ${editResponse.status} - ${editResponse.statusText}`);
    }

    core.setOutput('file-id', fileId);
  } catch (error) {
    core.setFailed(`Unexpected error: ${error.message}`);
  }
}

module.exports = upload;

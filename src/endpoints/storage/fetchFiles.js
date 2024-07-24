/* eslint-disable camelcase */
const axios = require('axios');
const core = require('@actions/core');
const getAuthHeader = require('../../utils/utils');
/**
 * Filters the items based on the provided criteria, with platform-specific handling for version
 * and build values.
 *
 * Note: There is a distinction between how iOS and Android versions and builds are handled:
 * - For iOS:
 *   - The `version` is matched against `file.metadata.short_version`.
 *   - The `build` is matched against `file.metadata.version`.
 * - For Android:
 *   - The `version` is matched against `file.metadata.version`.
 *   - The `build` is matched against `file.metadata.version_code` (and is parsed as an integer).
 *
 * @param {Array} items - The array of items to filter.
 * @param {string} version - The version to filter by. The source of this value differs between iOS
 * and Android.
 * @param {string} build - The build to filter by. The source of this value differs between iOS
 * and Android.
 * @param {string} description - The description to filter by.
 * @param {string} platform - The platform to filter by (either 'ios' or 'android').
 * @returns {Array} - The filtered array of items.
 */
function filterItems(items, version, build, description, platform) {
  return items.filter((file) => (
    (!version || (platform === 'ios' && file.metadata.short_version === version) || (platform === 'android' && file.metadata.version === version))
    && (!build || (platform === 'ios' && file.metadata.version === build) || (platform === 'android' && file.metadata.version_code === parseInt(build, 10)))
    && (!description || file.description?.includes(description))
  ));
}

async function fetchFiles() {
  const username = core.getInput('sauce-labs-username', { required: true });
  const accessKey = core.getInput('sauce-labs-access-key', { required: true });
  const hostName = core.getInput('sauce-labs-data-center-host-name', { required: false });
  const platform = core.getInput('get-file-id-platform', { required: false });
  const version = core.getInput('get-file-id-app-version', { required: false });
  const build = core.getInput('get-file-id-app-build-number', { required: false });
  const description = core.getInput('get-file-id-app-description', { required: false });

  const perPage = 100;
  let pageCounter = 1;
  let fileId = null;

  core.debug(`Fetching files for ${platform} platform`);

  do {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(`${hostName}/v1/storage/files`, {
        headers: {
          Authorization: getAuthHeader(username, accessKey),
        },
        params: {
          kind: platform,
          per_page: perPage,
          page: pageCounter,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Unexpected response code: ${response.status}`);
      }

      const { items, total_items } = response.data;

      if (!Array.isArray(items)) {
        throw new Error('Unexpected response structure');
      }

      const filteredItems = filterItems(items, version, build, description, platform);
      const page = Math.ceil(total_items / perPage);

      core.info(`Page ${pageCounter}/${page} - No files found!`);

      if (filteredItems.length > 0) {
        fileId = filteredItems[0].id;
        core.info(`File ID: ${fileId}`);
        break;
      } else if (!page || pageCounter >= page) {
        core.info('No files found');
        break;
      }

      pageCounter += 1;
    } catch (error) {
      core.setFailed(`Unexpected error: ${error.message}`);
      break;
    }
  } while (!fileId);

  if (!fileId) {
    core.setFailed('File not found');
  } else {
    core.setOutput('file-id', fileId);
  }
}

module.exports = fetchFiles;

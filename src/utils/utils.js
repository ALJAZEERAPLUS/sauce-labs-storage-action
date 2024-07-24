/**
 * Generates the authorization header for the Sauce Labs Storage API.
 *
 * @param {string} username - The username for authentication.
 * @param {string} accessKey - The access key for authentication.
 * @returns {string} The authorization header.
 */
function getAuthHeader(username, accessKey) {
  const credentials = `${username}:${accessKey}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

module.exports = getAuthHeader;

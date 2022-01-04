const core = require('@actions/core');
const uploadApp = require('./upload-app');

(async () => {
  try {
    await uploadApp();
  } catch (error) {
    core.setFailed(`[ERROR] There was an error during the action execution: ${error}`);
  }
})();
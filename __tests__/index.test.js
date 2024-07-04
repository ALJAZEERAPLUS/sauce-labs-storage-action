/* eslint-disable global-require */
const core = require('@actions/core');
const upload = require('../src/endpoints/storage/upload');
const fetchFiles = require('../src/endpoints/storage/fetchFiles');
const index = require('../src/index');

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
}));
jest.mock('../src/endpoints/storage/upload');
jest.mock('../src/endpoints/storage/fetchFiles');

describe('Action execution', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call upload when endpoint-action is "upload"', async () => {
    core.getInput.mockReturnValue('upload');

    await index.main();

    expect(upload).toHaveBeenCalled();
    expect(fetchFiles).not.toHaveBeenCalled();
  });

  it('should call files when endpoint-action is "get-file-id"', async () => {
    core.getInput.mockReturnValue('get-file-id');

    await index.main();

    expect(fetchFiles).toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it('should set failure when endpoint-action is invalid', async () => {
    core.getInput.mockReturnValue('invalid-action');

    await index.main();

    expect(core.setFailed).toHaveBeenCalledWith('[ERROR] Invalid endpoint action: invalid-action');
  });

  it('should set failure when there is an error during execution', async () => {
    core.getInput.mockReturnValue('upload');
    upload.mockImplementation(() => {
      throw new Error('Test error');
    });

    await index.main();

    expect(core.setFailed).toHaveBeenCalledWith('[ERROR] There was an error during the action execution: Error: Test error');
  });
});
